// Internal alert functions for background jobs only - NOT exposed as server actions
// These functions should only be imported by server-side code (e.g., Inngest functions)

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';

export const getActiveAlerts = async () => {
    try {
        await connectToDatabase(); 

        const alerts = await Alert.find({
            isActive: true,
            triggeredAt: null,
        }).lean();

        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        console.error("Error getting active alerts: ", error);
        return [];
    }
}

/**
 * Atomically marks an alert as triggered using compare-and-set.
 * Only updates if the alert is still active and not yet triggered (idempotent guard).
 * Returns { success: true, alreadyTriggered: false } if we triggered it,
 * { success: true, alreadyTriggered: true } if it was already triggered,
 * { success: false } on error.
 */
export const markAlertAsTriggered = async (alertId: string) => {
    try {
        await connectToDatabase(); 
      
        // Atomic compare-and-set: only update if still active and not triggered
        const result = await Alert.updateOne(
            { _id: alertId, isActive: true, triggeredAt: null },
            { $set: { triggeredAt: new Date(), isActive: false } }
        );

        if (result.modifiedCount === 0) {
            // Alert was already triggered or doesn't exist
            return { success: true, alreadyTriggered: true, message: 'Alert already triggered or not found' };
        }

        return { success: true, alreadyTriggered: false, message: 'Alert marked as triggered' };
    } catch (error) {
        console.error("markAlertTriggered Error:", error);
        return { success: false, alreadyTriggered: false, error: 'Failed to mark alert as triggered' };
    }
}

/**
 * Marks an alert's notification as failed (for retry/monitoring purposes).
 * Called when email sending fails after the alert was marked as triggered.
 */
export const markAlertNotificationFailed = async (alertId: string, errorMessage: string) => {
    try {
        await connectToDatabase();
        
        await Alert.updateOne(
            { _id: alertId },
            { $set: { notificationFailed: true, notificationError: errorMessage } }
        );

        return { success: true };
    } catch (error) {
        console.error("markAlertNotificationFailed Error:", error);
        return { success: false };
    }
}

