const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  type: { type: String, required: true, enum: ['consumer', 'producer'] },
  phone: { type: String },
  city: { type: String },
  address: { type: String },
  storeId: { type: String },
  // --- NOVO CAMPO ---
  avatarUrl: { type: String, default: '' }, // URL da imagem de perfil
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;