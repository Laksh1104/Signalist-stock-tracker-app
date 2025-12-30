import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface Alert extends Document {
    userId: string;
    symbol: string;
    company: string;
    alertName: string;
    alertType: "upper" | "lower";
    threshold: number;
    triggeredAt?: Date | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const AlertSchema = new Schema<Alert>(
    {
      userId: { type: String, required: true, index: true },
      symbol: { type: String, required: true, uppercase: true, trim: true, index: true },
      company: { type: String, required: true, trim: true },
      alertName: { type: String, required: true, trim: true },
      alertType: { type: String, required: true, enum: ["upper", "lower"] },
      threshold: { type: Number, required: true, min: 0 },
      triggeredAt: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );

AlertSchema.index({ userId: 1, symbol: 1, alertType: 1, threshold: 1 }, { unique: true });
AlertSchema.index({ isActive: 1, triggeredAt: 1 });

export const Alert: Model<Alert> =
  (models?.Alert as Model<Alert>) || model<Alert>("Alert", AlertSchema);
  
