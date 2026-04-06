import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomKey:  { type: String, required: true, index: true },
  from:     { type: String, required: true },  // socket id
  name:     { type: String, required: true },  // username
  text:     { type: String, required: true },
  ts:       { type: Date,   default: Date.now },
});

export const Message = mongoose.model('Message', messageSchema);