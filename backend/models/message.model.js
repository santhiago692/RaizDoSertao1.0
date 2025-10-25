const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  orderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  senderId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
    // Em mensagens automáticas, podemos usar um ID genérico do sistema ou o ID do consumidor
  },
  receiverId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  isSystemMessage: { 
    type: Boolean, 
    default: false 
    // Marcamos como 'true' para a primeira mensagem automática do sistema
  },
  read: {
    type: Boolean,
    default: false
    // Podemos usar isso no futuro para marcar se o destinatário leu a mensagem
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;