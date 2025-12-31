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
 * Atomically marks an alert as triggered by setting triggeredAt.
 * Only succeeds if the alert exists and hasn't been triggered yet (triggeredAt: null).
 * This prevents race conditions where multiple workers might try to process the same alert.
 * 
 * @returns The updated document if successful, null if alert was already triggered or doesn't exist
 */
export const markAlertAsTriggered = async (alertId: string) => {
    try {
        await connectToDatabase();
        
        const updatedAlert = await Alert.findOneAndUpdate(
            { _id: alertId, triggeredAt: null },
            { $set: { triggeredAt: new Date() } },
            { new: true }
        ).lean();

        if (!updatedAlert) {
            return { success: false, error: 'Alert not found or already triggered' };
        }

        return { success: true, alert: JSON.parse(JSON.stringify(updatedAlert)) };
    } catch (error) {
        console.error("markAlertAsTriggered Error:", error);
        return { success: false, error: 'Failed to mark alert as triggered' };
    }
}

/**
 * Deletes an alert that has been marked as triggered.
 * Only deletes if triggeredAt is set (not null) to ensure the alert was properly marked.
 * 
 * @throws Error if the alert was not deleted (deletedCount === 0)
 */
export const deleteTriggeredAlert = async (alertId: string) => {
    try {
        await connectToDatabase();
        
        // Only delete alerts that have been marked as triggered
        const result = await Alert.deleteOne({ 
            _id: alertId, 
            triggeredAt: { $ne: null } 
        });

        if (result.deletedCount === 0) {
            throw new Error(`Failed to delete alert ${alertId}: alert not found or not marked as triggered (deletedCount: 0)`);
        }

        return { success: true, message: 'Alert deleted after trigger', deletedCount: result.deletedCount };
    } catch (error) {
        console.error("deleteTriggeredAlert Error:", error);
        throw error;
    }
};

export const markAlertNotificationFailed = async (alertId: string, errorMessage?: string) => {
    try {
        await connectToDatabase();
        
        await Alert.updateOne(
            { _id: alertId },
            { 
                $set: { 
                    notificationFailed: true,
                    notificationError: errorMessage || 'Unknown error'
                } 
            }
        );

        return { success: true };
    } catch (error) {
        console.error("markAlertNotificationFailed Error:", error);
        return { success: false, error: 'Failed to mark alert notification as failed' };
    }
}