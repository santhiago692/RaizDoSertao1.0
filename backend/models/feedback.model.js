const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  consumerName: { type: String, required: true }, // Para exibir o nome junto ao comentário
  
  // Sugestão: Adicionei um campo 'rating' (nota de 1 a 5), que é comum e agrega valor
  rating: { type: Number, required: true, min: 1, max: 5 },
  
  comment: { type: String, required: true },
}, {
  timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;