import mongoose, { Schema, Document } from 'mongoose';

export interface IImageHistory extends Document {
    userId: mongoose.Types.ObjectId;
    agentId: string;
    prompt: string;
    imageUrl: string;
    createdAt: Date;
}

const imageHistorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentId: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IImageHistory>('ImageHistory', imageHistorySchema);
