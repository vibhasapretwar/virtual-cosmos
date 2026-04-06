import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  socketId:  { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  joinedAt:  { type: Date,   default: Date.now },
  leftAt:    { type: Date,   default: null },
});

export const Session = mongoose.model('Session', sessionSchema);