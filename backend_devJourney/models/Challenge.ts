import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  teacherId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
