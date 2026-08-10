import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  sessionId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  rollNo: string;
  timestamp: Date;
  status: "PRESENT" | "ABSENT";
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceSession",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      default: "PRESENT",
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound unique index to prevent duplicate submissions
AttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
AttendanceSchema.index({ studentId: 1 });
AttendanceSchema.index({ classId: 1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
