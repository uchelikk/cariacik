import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
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
      required: [true, 'Email zorunludur.'],
      unique: true,
      // validate: {
      //   validator: (data: string) => {
      //     if (!validator.isEmail(data)) return false;
      //     return true;
      //   },
      //   message: 'Email değeri geçersiz!',
      // },
      validate: [validator.isEmail, 'Geçerli bir mail adresi giriniz.'],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
      maxlength: [50, 'Şifre çok uzun'],
    },
    fullName: {
      type: String,
      required: true,
      minlength: [3, 'İsim çok kısa'],
      maxlength: [50, 'İsim çok uzun'],
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
