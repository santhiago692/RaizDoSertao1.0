import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal'; // Reutilizamos o componente Modal que já temos

// CORREÇÃO AQUI: O caminho correto para o CSS
import '../pages/OrderDetailPage.css'; 

const FEEDBACK_API_URL = 'http://localhost:5000/api/feedbacks';

function FeedbackModal({ isOpen, onClose, order }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating === 0) {
      setError('Por favor, selecione uma nota.');
      return;
    }
    if (!comment.trim()) {
      setError('Por favor, deixe um comentário.');
      return;
    }
    if (!order || !user) {
        setError('Erro: Dados do pedido ou usuário não encontrados.');
        return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(FEEDBACK_API_URL, {
        productId: order.productId._id, 
        consumerId: user.id,
        rating: rating,
        comment: comment,
      });
      alert("Feedback enviado com sucesso! Obrigado.");
      setRating(0); 
      setComment('');
      onClose(); 
    } catch (err) {
      setError("Erro ao enviar feedback. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente simples de estrelas para avaliação
  const StarRating = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'star filled' : 'star'}
            onClick={() => handleRating(star)}
            style={{ cursor: 'pointer', fontSize: '2rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Deixe seu Feedback</h3>
      <p>Avalie o produto que você recebeu:</p>
      {order?.productDetails?.name && <p><strong>{order.productDetails.name}</strong></p>}

      <form onSubmit={handleSubmit}>
        <StarRating />
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escreva seu comentário aqui..."
          className="form-control"
          rows="4"
          style={{ marginTop: '1rem', marginBottom: '1rem' }}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Fechar
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default FeedbackModal;