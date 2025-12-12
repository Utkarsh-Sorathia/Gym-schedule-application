import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    createdAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
    endpoint: { type: String, required: true, unique: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
