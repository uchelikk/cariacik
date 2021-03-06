import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
