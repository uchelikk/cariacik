import mongoose, { Schema, Document } from 'mongoose';

export enum TimelaneTYPE {
  INCOME = 1,
  OUTGOING = 2,
  SHOP = 3,
}

export interface ITimelane extends Document {
  name?: string;
  description?: string;
  amount?: string;
  active?: boolean;
  room?: any;
  user?: any;
  type?: TimelaneTYPE;
  createdAt?: Date;
  updatedAt?: Date;
}

export const TimelanesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    type: {
      type: TimelaneTYPE,
      required: true,
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

const Timelanes = mongoose.model<ITimelane>('Timelanes', TimelanesSchema);
export default Timelanes;

/**
 * id
 * room_id
 * user_id
 * name
 * description
 * is_active
 * amount
 */
