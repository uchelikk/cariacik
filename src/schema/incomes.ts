import mongoose, { Schema, Document } from 'mongoose';

export interface IIncomes extends Document {
  name: string;
  description?: string;
  amount: string;
  isActive: boolean;
  room: any;
  user: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export const IncomesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, 'En az 2 karakterden oluşmalıdır.'],
      maxlength: [100, 'En fazla 100 karakter içerebilir.'],
    },
    description: {
      type: String,
      maxlength: [100, 'En fazla 100 karakter içerebilir.'],
    },
    amount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Incomes = mongoose.model<IIncomes>('Incomes', IncomesSchema);
export default Incomes;
/**
 * id
 * room_id
 * user_id
 * name
 * description
 * is_active
 * amount
 */
