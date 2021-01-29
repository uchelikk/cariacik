import mongoose, { Schema, Document } from 'mongoose';
import { customAlphabet } from 'nanoid';

export interface IRoom extends Document {
  name: string;
  description: string;
  totalMoney: number;
  roomCode: string; // must be unique
  roomOwner: any;
  createdAt: Date;
  updatedAt: Date;
}

export const RoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, 'En az 2 karakter olmalıdır.'],
      maxlength: [100, 'Oda ismi çok uzun'],
    },
    description: {
      type: String,
      required: false,
      minlength: [2, 'En az 2 karakter olmalıdır.'],
      maxlength: [1000, 'Açıklama çok uzun'],
    },
    totalMoney: { type: Number, required: false, default: 0 },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        customAlphabet('ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZQWX1234567890', 8)(),
    },
    roomOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Room = mongoose.model<IRoom>('Room', RoomSchema);
export default Room;
