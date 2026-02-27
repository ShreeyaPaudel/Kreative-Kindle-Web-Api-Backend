import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  title:       string;
  category:    string;
  age:         string;
  duration:    string;
  description: string;
  image:       string;
  materials:   string[];
  steps:       string[];
  createdAt:   Date;
  updatedAt:   Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title:       { type: String, required: true, trim: true },
    category:    { type: String, required: true, enum: ["Art", "Math", "Reading", "Science"] },
    age:         { type: String, required: true },
    duration:    { type: String, required: true },
    description: { type: String, required: true },
    image:       { type: String, default: "" },
    materials:   [{ type: String }],
    steps:       [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);