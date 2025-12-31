'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const createAlert = async (input: AlertData) => {
    try {
        await connectToDatabase(); 

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if(!session?.user) redirect('/log-in');

        if (input.threshold <= 0 || input.threshold == null) {
            return { success: false, error: 'Threshold must be greater than 0' };
        }

        // Create alert - duplicate detection is handled by the unique index
        const alert = new Alert({
            userId: session.user.id,
            symbol: input.symbol.toUpperCase(),
            company: input.company.trim(),
            alertName: input.alertName,
            alertType: input.alertType,
            threshold: input.threshold,
            triggeredAt: null,
            isActive: true,
        });

        await alert.save(); 

        return { success: true, message: "Alert created successfully" };
    } catch (error: any) {
        console.error("Error creating alert: ", error);
        
        // MongoDB duplicate key error (unique index violation)
        if (error?.code === 11000) {
            return { success: false, error: 'You already have an alert for this stock with the same condition and target price' };
        }
        
        return { success: false, error: 'Failed to create alert' };
    }
}

export const getUserAlerts = async () => {
    try {
        await connectToDatabase(); 

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if(!session?.user) redirect('/log-in');

        const alerts = await Alert.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();

        return { success: true,message: "Alerts fetched successfully", data: JSON.stringify(alerts) };

    } catch (error) {
        console.error("Error getting user alerts: ", error);
        return { success: false, error: 'Failed to get user alerts' };
    }
}

export const deleteAlert = async (alertId: string) => {
    try {
        await connectToDatabase(); 

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if(!session?.user) redirect('/log-in');

        await Alert.deleteOne({ _id: alertId, userId: session.user.id });

        return { success: true, message: 'Alert deleted.' };
    } catch (error) {
        console.error("Error deleting alert: ", error);
        return { success: false, error: 'Failed to delete alert' };
    }
}