import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClass extends Document {
  name: string;
  code: string;
  professorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema<IClass> = new Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Materials Joining Technology",
    },
    code: {
      type: String,
      required: true,
      default: "MJT",
      unique: true,
    },
    professorId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);

export default Class;
