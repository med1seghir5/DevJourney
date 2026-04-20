import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username?: string;
  email: string;
  password?: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpires?: Date;
  role: 'user' | 'admin' | 'teacher';
  completedChallenges: number;
  xp: number;
  createdAt: Date;
  updatedAt: Date;
}


const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
      required: false,
    },
    otpExpires: {
      type: Date,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'teacher'],
      default: 'user',
    },
    completedChallenges: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
