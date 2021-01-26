import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  fullName: string;
  password: number;
}

export const UserSchema = new Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
