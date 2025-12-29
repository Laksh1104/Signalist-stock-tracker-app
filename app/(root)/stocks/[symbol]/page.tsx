import React from 'react';
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG
} from "@/lib/constants";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";

const StockDetails = async ({ params }: StockDetailsPageProps) => {
    const { symbol } = await params;
    const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-"

    const session = await auth.api.getSession({ headers: await headers() });
    const watchlist = session?.user?.email ? await getWatchlistSymbolsByEmail(session.user.email) : [];
    const isInWatchlist = watchlist.includes(symbol.toUpperCase());

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="flex flex-col gap-8">
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}symbol-info.js`}
                    config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                    height={170}
                />
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}advanced-chart.js`}
                    config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                    height={600}
                />
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}advanced-chart.js`}
                    config={BASELINE_WIDGET_CONFIG(symbol)}
                    height={600}
                />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
                <WatchlistButton
                    symbol={symbol}
                    company={symbol}
                    isInWatchlist={isInWatchlist}
                />
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}technical-analysis.js`}
                    config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                    height={400}
                />
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}financials.js`}
                    config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                    height={464}
                />
                <TradingViewWidget
                    scriptUrl={`${scriptUrl}symbol-profile.js`}
                    config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                    height={440}
                />
            </div>
        </div>
    );
}

export default StockDetails;
