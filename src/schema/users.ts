import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

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
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  //@ts-ignore
  this.password = bcryptjs.hashSync(this.password, 10);
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
