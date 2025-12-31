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

export const deleteTriggeredAlert = async (alertId: string) => {
    try {
        await connectToDatabase();
        
        await Alert.deleteOne({ _id: alertId });

        return { success: true, message: 'Alert deleted after trigger' };
    } catch (error) {
        console.error("deleteTriggeredAlert Error:", error);
        return { success: false, error: 'Failed to delete alert' };
    }
};