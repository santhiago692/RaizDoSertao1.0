const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  storeId: { type: String, required: true }, // No futuro, podemos refatorar para ObjectId
  
  // CAMPO ADICIONADO: Uma lista de referências aos feedbacks
  feedbacks: [{ type: Schema.Types.ObjectId, ref: 'Feedback' }]
  
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;