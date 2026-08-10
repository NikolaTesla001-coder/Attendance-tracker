import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendanceSession extends Document {
  classId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema: Schema<IAttendanceSession> = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSessionSchema.index({ token: 1 });

const AttendanceSession: Model<IAttendanceSession> =
  mongoose.models.AttendanceSession ||
  mongoose.model<IAttendanceSession>("AttendanceSession", AttendanceSessionSchema);

export default AttendanceSession;
