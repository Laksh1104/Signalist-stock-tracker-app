import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompts";
import {sendNewsSummaryEmail, sendWelcomeEmail, sendStockAlertEmail} from "@/lib/nodemailer";
import {getAllUsersForNewsEmail, getUserEmailById} from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews, getCurrentPrice } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate } from "@/lib/utils";
import { getActiveAlerts, markAlertAsTriggered, markAlertNotificationFailed } from "@/lib/actions/alert.internal";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created'},
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary' },
    [ { event: 'app/send.daily.news' }, { cron: '12 0 * * *' } ],
    async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if(!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries: { user: UserForNewsEmail; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                const response = await step.ai.infer(`summarize-news-${user.email}`, {
                    model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
                    body: {
                        contents: [{ role: 'user', parts: [{ text:prompt }]}]
                    }
                });

                const part = response.candidates?.[0]?.content?.parts?.[0];
                const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

                userNewsSummaries.push({ user, newsContent });
            } catch (e) {
                console.error('Failed to summarize news for : ', user.email);
                userNewsSummaries.push({ user, newsContent: null });
            }
        }

        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
            const results = await Promise.allSettled(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return false;
                    return await sendNewsSummaryEmail({
                        email: user.email,
                        date: getFormattedTodayDate(),
                        newsContent,
                    });
                })
            );

            // Log failures
            results.forEach((r, idx) => {
                if (r.status === 'rejected') {
                    console.error('Failed to send email to:', userNewsSummaries[idx].user.email, r.reason);
                }
            });
        });


        return { success: true, message: 'Daily news summary emails sent successfully' }
    }
)

export const checkPriceAlerts = inngest.createFunction(
    { id: 'check-price-alerts' },
    [{ event: 'app/check.price.alerts' }, { cron: '*/5 * * * *' }], // Every 5 minutes

    async ({ step }) => {

        // Step #1: Get all active alerts
        const alerts = await step.run('get-active-alerts', getActiveAlerts);

        if(!alerts || alerts.length === 0) return { success: false, message: 'No active alerts found' };

        // Step #2: For each alert, get stock details and check if the price has reached the threshold
        const results = await step.run('evaluate-alerts', async () => {
            return Promise.all(alerts.map(async (alert: any) => {
                const currentPrice = await getCurrentPrice(alert.symbol);

                if(currentPrice === null) return { success: false, message: `No price found for ${alert.symbol}` };

                const conditionMet = alert.alertType === 'upper' ? currentPrice >= alert.threshold : currentPrice <= alert.threshold;

                if (conditionMet) {
                    return { alertId: alert._id, triggered: true, alert, currentPrice };
                }
                return { alertId: alert._id, triggered: false, alert, currentPrice };
            })
        );
        });

        // Step #3: Mark alerts as triggered and send emails
        // Order: mark first, then send email to prevent duplicate emails on retry
        await step.run('send-alert-emails', async () => {
            for (const result of results) {
                if (!result.triggered) continue;
                
                const { alert, currentPrice } = result;
                
                // Step 3a: Mark alert as triggered first (idempotent, uses compare-and-set)
                const markResult = await markAlertAsTriggered(alert._id);
                
                if (!markResult.success) {
                    console.error(`Failed to mark alert as triggered for ${alert.symbol}:`, markResult.error);
                    continue; // Skip sending email if we couldn't mark it
                }
                
                if (markResult.alreadyTriggered) {
                    // Already processed by another run, skip to avoid duplicate email
                    console.log(`Alert for ${alert.symbol} already triggered, skipping email`);
                    continue;
                }
                
                // Step 3b: Now send the email (alert is already marked, safe from duplicates)
                try {
                    const userEmail = await getUserEmailById(alert.userId);
                    if (!userEmail) {
                        console.error(`No email found for user ${alert.userId}, alert ${alert.symbol}`);
                        await markAlertNotificationFailed(alert._id, 'User email not found');
                        continue;
                    }

                    await sendStockAlertEmail({
                        email: userEmail,
                        symbol: alert.symbol,
                        company: alert.company,
                        currentPrice: currentPrice,
                        targetPrice: alert.threshold,
                        alertType: alert.alertType,
                    });
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                    console.error(`Failed to send alert email for ${alert.symbol}:`, e);
                    // Mark notification as failed for monitoring/retry purposes
                    await markAlertNotificationFailed(alert._id, errorMessage);
                }
            }
        });

        return { success: true, message: 'Price alerts checked and emails sent successfully' }
    }
)

