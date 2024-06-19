import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const TicketSchema = new mongoose.Schema({
  code: { type: String, default: uuidv4, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
});

export const Ticket = mongoose.model("Ticket", TicketSchema);
