import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
  },
  priceMoney: {
    type: Number,
  },
});

export const UserModel = model("User", userSchema);
