import mongoose, { Schema, Document } from 'mongoose';

export interface IChatHistory extends Document {
    userId: mongoose.Types.ObjectId;
    agentId: string;
    message: string;
    response: string;
    createdAt: Date;
}

const chatHistorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
