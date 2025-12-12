import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    notificationTime: string; // Format: "HH:MM" (24-hour), e.g., "18:30"
    lastNotified: string | null; // ISO date string (YYYY-MM-DD) to prevent duplicate notifications
    createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    notificationTime: { type: String, default: '18:30' }, // Default to 6:30 PM
    lastNotified: { type: String, default: null }, // Track last notification date
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
