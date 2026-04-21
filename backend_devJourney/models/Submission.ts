import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  githubRepoLink: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submissionDate: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
      index: true,
    },
    githubRepoLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    feedback: {
      type: String,
      required: false,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
