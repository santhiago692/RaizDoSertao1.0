const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  producerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  
  productDetails: { 
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    imageUrl: { type: String }
  },
  
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['Entrega', 'Retirada'] 
  },
  
  status: {
    type: String,
    required: true,
    enum: [ 
      "Aguardando confirmação do produtor",
      "Aceito pelo produtor",
      "Em andamento",
      "Finalizado", 
      "Entregue",   // NOVO STATUS
      "Cancelado"
    ],
    default: "Aguardando confirmação do produtor"
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;