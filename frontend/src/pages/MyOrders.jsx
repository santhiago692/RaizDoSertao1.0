import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/orders';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/my-orders/${user.id}`);
        setOrders(response.data);
        setError(null);
      } catch (err) {
        setError("Não foi possível carregar seus pedidos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="main-content card"><h2>Carregando seus pedidos...</h2></div>;
  }

  if (error) {
    return <div className="main-content card"><h2>{error}</h2></div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <h2>Meus Pedidos</h2>
        {orders.length === 0 ? (
          <p>Você ainda não fez nenhum pedido.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-item">
                <img src={order.productDetails?.imageUrl || '/images/placeholder.png'} alt={order.productDetails?.name || 'Produto'} className="order-item-image" />
                <div className="order-item-details">
                  <h4>{order.productDetails?.name || 'Nome Indisponível'}</h4>
                  <p><strong>Status:</strong> <span className="order-status">{order.status}</span></p>
                  <p><strong>Valor Total:</strong> R$ {order.totalPrice.toFixed(2)}</p>
                  <p><strong>Pedido em:</strong> {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                {/* LINK ATUALIZADO */}
                <Link to={`/pedidos/${order._id}`} className="btn btn-primary">Ver Conversa</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos básicos para a lista de pedidos (colocados aqui para simplicidade)
const styles = `
.orders-list { display: flex; flex-direction: column; gap: 1.5rem; }
.order-item { display: flex; align-items: center; gap: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); }
.order-item:last-child { border-bottom: none; }
.order-item-image { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.order-item-details { flex-grow: 1; }
.order-item-details h4 { margin: 0 0 0.5rem; }
.order-item-details p { margin: 0.25rem 0; font-size: 0.9rem; }
.order-status { font-weight: 600; }
`;
// Injeta os estilos no <head> - idealmente mover para App.css
let styleSheet = document.getElementById("myOrdersStyle");
if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = "myOrdersStyle";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default MyOrders;