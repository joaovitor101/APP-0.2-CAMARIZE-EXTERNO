import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true },
  readAt: { type: Date, default: null },
}, {
  timestamps: true,
  collection: 'messages'
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;


