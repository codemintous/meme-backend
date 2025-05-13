import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  userAddress: string;
  serverAddress: string;
  publicKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  userAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  serverAddress: {
    type: String,
    required: true,
    trim: true
  },
  publicKey: {
    type: String,
    sparse: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema); 