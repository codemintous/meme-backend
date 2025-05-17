import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    message: string;
    response: string;
    imageUrl?: string;
    timestamp: Date;
}

export interface IChatHistory extends Document {
    userId: mongoose.Types.ObjectId;
    agentId: string;
    conversationId: string;  // To group messages in a conversation
    messages: IMessage[];    // Array of messages in the conversation
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

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
    conversationId: {
        type: String,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
chatHistorySchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
