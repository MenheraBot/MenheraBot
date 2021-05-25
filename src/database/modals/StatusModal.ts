import { Schema, model } from 'mongoose';

interface IStatus {
  _id: string;
  ping: number;
  disabledCommands: string[];
  lastPing: string;
}

const statusSchema = new Schema({
  _id: { type: String },
  ping: { type: Number, default: 0 },
  disabledCommands: { type: Array },
  lastPingAt: { type: String },
});

export default model<IStatus>('status', statusSchema);
