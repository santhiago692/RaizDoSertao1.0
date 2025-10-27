import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // 1. useNavigate está de volta
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // 1. useAuth está de volta
import { useCart } from '../contexts/CartContext';
import FeedbackModal from '../components/FeedbackModal';

// URLs das APIs
const PRODUCTS_API_URL = 'http://localhost:5000/api/products';
const ORDERS_API_URL = 'http://localhost:5000/api/orders'; // 1. API de Pedidos está de volta
const FEEDBACK_API_URL = 'http://localhost:5000/api/feedbacks';

// Componente para exibir estrelas de avaliação
const StarDisplay = ({ rating }) => {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ fontSize: '1.2rem', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
        >
          ★
        </span>
      ))}
    </div>
  );
};


function ProductPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth(); // 2. Pegamos user e isAuthenticated
  const { addToCart } = useCart();
  const navigate = useNavigate(); // 2. Inicializamos o navigate

  const [product, setProduct] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductAndFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        const productRes = await axios.get(`${PRODUCTS_API_URL}/${id}`);
        setProduct(productRes.data);
        const feedbackRes = await axios.get(`${FEEDBACK_API_URL}/product/${id}`);
        setFeedbacks(feedbackRes.data);
      } catch (err) {
        setError('Erro ao carregar o produto ou avaliações.');
        console.error("Erro no fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndFeedbacks();
  }, [id]);

  // --- FUNÇÃO "ADICIONAR À SACOLA" (Existente) ---
  const handleAddToCart = () => {
    if (!product) return;

    if (user && user.type === 'producer') {
      return alert("Produtores não podem adicionar itens à sacola.");
    }
    if (quantity > product.stock) {
      return alert("Quantidade solicitada indisponível em estoque.");
    }
    
    addToCart(product, quantity);
    alert(`${quantity}x ${product.name} adicionado(s) à sacola!`);
  };

  // --- 3. NOVA FUNÇÃO "COMPRAR AGORA" ---
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      alert("Você precisa estar logado para comprar.");
      return navigate('/login');
    }
    if (user.type === 'producer') {
      return alert("Produtores não podem realizar pedidos.");
    }
    if (quantity > product.stock) {
      return alert("Quantidade solicitada indisponível.");
    }

    // Hardcodamos 'Retirada' para manter a UI limpa
    const deliveryMethod = 'Retirada'; 
    
    if (!window.confirm(`Confirmar pedido de ${quantity}x ${product.name} com ${deliveryMethod}?`)) {
       return;
    }

    try {
      const orderData = {
        consumerId: user.id,
        productId: product._id,
        quantity: quantity,
        deliveryMethod: deliveryMethod, // Usamos o valor hardcoded
      };
      await axios.post(ORDERS_API_URL, orderData);
      alert("Pedido realizado com sucesso! Você será redirecionado para 'Meus Pedidos'.");
      navigate('/meus-pedidos'); // Redireciona o usuário
    } catch (err) {
      alert("Ocorreu um erro ao criar o pedido. Tente novamente.");
      console.error(err);
    }
  };


  if (loading) return <div className="main-content card"><h2>Carregando produto...</h2></div>;
  if (error || !product) return <div className="main-content card"><h2>{error || 'Produto não encontrado.'}</h2></div>;

  const profileLink = product.producerId ? `/produtor/${product.producerId}` : '#';

  return (
    <div className="main-content">
      {/* Layout (Mercado Livre) */}
      <div className="product-page-layout">
        
        {/* Card 1: Imagem */}
        <div className="card product-visuals">
          <img src={product.imageUrl} alt={product.name} />
        </div>

        {/* Card 2: Informações e Ações */}
        <div className="card product-info-actions">
          <h2>{product.name}</h2>
          <p className="price">R$ {product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>
          <p className="stock">Estoque: {product.stock > 0 ? `${product.stock} unidades` : 'Esgotado'}</p>
          
          <Link to={profileLink} className="store-name-link">
            <p className="store-name">Vendido por: {product.storeName}</p>
          </Link>
          
          <hr style={{margin: '2rem 0'}} />

          {/* Formulário de Ação */}
          <div className="order-form">
            <div className="form-group">
              <label htmlFor="quantity">Quantidade:</label>
              <input
                id="quantity" type="number" value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), product.stock)))}
                min="1" max={product.stock} className="form-control"
                style={{width: '100px'}} disabled={product.stock === 0}
              />
            </div>
          </div>

          {/* --- 4. BOTÕES ATUALIZADOS --- */}
          {product.stock > 0 ? (
            <div className="product-page-buttons"> 
              <button onClick={handleBuyNow} className="btn btn-primary">
                Comprar Agora
              </button>
              <button onClick={handleAddToCart} className="btn btn-secondary">
                Adicionar à Sacola
              </button>
            </div>
          ) : (
            <p>Produto esgotado.</p>
          )}
        </div>
      </div>
      {/* Fim do product-page-layout */}


      {/* --- SEÇÃO: Avaliações (Permanece igual) --- */}
      <div className="card feedback-section">
        <h3>Avaliações ({feedbacks.length})</h3>
        {feedbacks.length === 0 ? (
          <p>Este produto ainda não possui avaliações.</p>
        ) : (
          <div className="feedback-list">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="feedback-item">
                <div className="feedback-header">
                  <strong>{fb.consumerName}</strong>
                  <span style={{ marginLeft: '10px' }}> - {new Date(fb.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <StarDisplay rating={fb.rating} />
                <p className="feedback-comment">{fb.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos para a página (antigos + novos)
const pageStyles = `
/* Layout novo (Mercado Livre) */
.product-page-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: flex-start;
}
.product-visuals {
  flex: 1.5;
  padding: 0;
  overflow: hidden;
}
.product-visuals img {
  width: 100%;
  height: auto;
  display: block;
}
.product-info-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.product-info-actions .price {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0.5rem 0;
}
.product-info-actions .description {
  font-size: 1rem;
  margin-top: 1rem;
}
.product-info-actions .stock {
  font-size: 0.9rem;
  color: #555;
}
.store-name-link {
  text-decoration: none;
}
.store-name {
  color: var(--primary-color);
  font-weight: 600;
  margin-top: 0.5rem;
}
.store-name:hover {
  text-decoration: underline;
}

/* Responsivo para celular */
@media (max-width: 768px) {
  .product-page-layout {
    flex-direction: column;
  }
}

/* --- 5. NOVOS ESTILOS PARA OS BOTÕES --- */
.product-page-buttons {
  display: flex;
  flex-direction: column; /* Botões empilhados */
  gap: 10px;
  margin-top: 1rem;
  width: 100%;
}

.product-page-buttons .btn-primary,
.product-page-buttons .btn-secondary {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  box-sizing: border-box; 
  text-align: center;
  text-decoration: none;
}
/* Assumindo que .btn-secondary (do Header) 
  tenha fundo branco e borda verde. 
  Se não tiver, adicione este CSS:
*/
/*
.btn-secondary {
  background-color: #fff;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 5px;
}
.btn-secondary:hover {
  background-color: var(--primary-color-light, #f0eada);
}
*/
/* --- FIM DOS NOVOS ESTILOS --- */


/* Estilos de Feedback (Antigos) */
.feedback-section { margin-top: 2rem; }
.feedback-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
.feedback-item { padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); }
.feedback-item:last-child { border-bottom: none; }
.feedback-header { margin-bottom: 0.5rem; }
.feedback-comment { margin-top: 0.5rem; }
.form-group { margin-bottom: 1rem; }
`;
let pageStyleSheet = document.getElementById("productPageStyle");
if (!pageStyleSheet) {
  pageStyleSheet = document.createElement("style");
  pageStyleSheet.id = "productPageStyle";
  pageStyleSheet.innerText = pageStyles;
  document.head.appendChild(pageStyleSheet);
}

export default ProductPage;