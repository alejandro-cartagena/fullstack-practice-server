import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      maxLength: 50,
    },
    email: { type: String, unique: true, trim: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("User", userSchema);
