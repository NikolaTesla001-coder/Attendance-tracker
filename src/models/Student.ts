import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  rollNo: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema<IStudent> = new Schema(
  {
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
