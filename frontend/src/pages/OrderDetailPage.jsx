import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Modal from '../components/Modal'; // Importa o Modal base
import FeedbackModal from '../components/FeedbackModal'; // Importa o Modal de Feedback
import './OrderDetailPage.css'; // Importa o CSS específico

const ORDERS_API_URL = 'http://localhost:5000/api/orders';
const MESSAGES_API_URL = 'http://localhost:5000/api/messages';

function OrderDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null); // Ref para rolar para o final

  // Estado para controlar o modal de feedback
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Função para rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Função para buscar os dados do pedido e as mensagens
  const fetchData = useCallback(async () => {
    console.log("OrderDetailPage: Iniciando fetchData...");
    if (!user || !orderId) {
      console.log("OrderDetailPage: User ou orderId ausente, abortando fetch.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log(`OrderDetailPage: Buscando pedido ${orderId}...`);

      // Busca os detalhes REAIS do pedido
      const orderRes = await axios.get(`${ORDERS_API_URL}/${orderId}`);
      console.log("OrderDetailPage: Resposta do pedido recebida:", orderRes.data);
      setOrder(orderRes.data);

      console.log(`OrderDetailPage: Buscando mensagens para o pedido ${orderId}...`);
      // Busca as mensagens
      const messagesRes = await axios.get(`${MESSAGES_API_URL}/${orderId}`);
      console.log("OrderDetailPage: Resposta das mensagens recebida:", messagesRes.data);
      setMessages(messagesRes.data);

      setError(null);
      console.log("OrderDetailPage: Fetch concluído com sucesso.");
    } catch (err) {
      setError("Erro ao carregar os detalhes do pedido ou mensagens.");
      console.error("!!! Erro em fetchData:", err);
      if (err.response) {
        console.error("!!! Detalhes da resposta de erro:", err.response.data);
      }
    } finally {
      setLoading(false);
      console.log("OrderDetailPage: setLoading(false) executado.");
    }
  }, [orderId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- FUNÇÕES DE AÇÃO COMPLETAS ---
  const handleAcceptOrder = async () => {
    console.log("Tentando aceitar pedido...");
    try {
      await axios.put(`${ORDERS_API_URL}/${orderId}/accept`);
      alert("Pedido aceito!");
      fetchData(); // Recarrega os dados para atualizar o status
    } catch (err) {
       console.error("Erro ao aceitar:", err.response || err);
       alert("Erro ao aceitar o pedido.");
    }
  };

  const handleRefuseOrder = async () => {
    console.log("Tentando recusar pedido...");
    if (window.confirm("Tem certeza que deseja recusar este pedido?")) {
      try {
        await axios.put(`${ORDERS_API_URL}/${orderId}/refuse`);
        alert("Pedido recusado.");
        navigate('/panel'); // Volta para o painel após recusar
      } catch (err) {
        console.error("Erro ao recusar:", err.response || err);
        alert("Erro ao recusar o pedido.");
      }
    }
  };

  const handleFinalizeOrder = async () => {
    console.log("Tentando finalizar pedido...");
    if (window.confirm("Confirmar a finalização deste pedido?")) {
      try {
        await axios.put(`${ORDERS_API_URL}/${orderId}/finalize`);
        alert("Pedido finalizado!");
        fetchData();
      } catch (err) {
        console.error("Erro ao finalizar:", err.response || err);
        alert("Erro ao finalizar o pedido.");
      }
    }
  };

  const handleCancelOrder = async () => {
    console.log("Tentando cancelar pedido...");
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        await axios.put(`${ORDERS_API_URL}/${orderId}/cancel`);
        alert("Pedido cancelado.");
        fetchData();
      } catch (err) {
        console.error("Erro ao cancelar:", err.response || err);
        alert("Erro ao cancelar o pedido.");
      }
    }
  };

  const handleConfirmDelivery = async () => {
    console.log("Tentando confirmar entrega...");
    if (window.confirm("Confirmar que você recebeu/retirou o produto?")) {
      try {
        await axios.put(`${ORDERS_API_URL}/${orderId}/confirm-delivery`);
        alert("Recebimento confirmado! Obrigado.");
        fetchData();
        // ***** CORREÇÃO AQUI: Ativa a abertura do modal *****
        setIsFeedbackModalOpen(true);
        // ***** FIM DA CORREÇÃO *****
      } catch (err) {
        console.error("Erro ao confirmar entrega:", err.response || err);
        alert("Erro ao confirmar o recebimento.");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    console.log("Tentando enviar mensagem...");
    if (!newMessage.trim() || !user || !order) {
        alert("Não foi possível determinar o destinatário. Dados do pedido incompletos.");
        return;
    };
    // Garante que estamos pegando o _id corretamente
    const receiverId = user.id === order.consumerId._id ? order.producerId._id : order.consumerId._id;
    try {
      await axios.post(MESSAGES_API_URL, { orderId, senderId: user.id, receiverId, content: newMessage });
      setNewMessage('');
      fetchData(); // Recarrega mensagens após enviar
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err.response || err);
      alert("Erro ao enviar mensagem.");
    }
  };
  // --- FIM DAS FUNÇÕES DE AÇÃO ---


  console.log(`OrderDetailPage: Renderizando. Loading: ${loading}, Error: ${error}, Order: ${!!order}`);

  if (loading) {
     console.log("OrderDetailPage: Renderizando estado de Loading.");
    return <div className="main-content card"><h2>Carregando conversa...</h2></div>;
  }
  if (error || !order) {
    console.log(`OrderDetailPage: Renderizando estado de Erro ou Pedido Nulo. Error: ${error}, Order: ${!!order}`);
    return <div className="main-content card"><h2>{error || 'Não foi possível carregar os dados do pedido.'}</h2></div>;
  }

  const isProducer = user && user.id === order.producerId._id;
  const isConsumer = user && user.id === order.consumerId._id;
  const isAwaitingConfirmation = order.status === "Aguardando confirmação do produtor";
  const isChatActive = order.status === "Aceito pelo produtor" || order.status === "Em andamento";
  const canBeManaged = order.status === "Aceito pelo produtor" || order.status === "Em andamento";
  const isFinalized = order.status === "Finalizado";
  const isDelivered = order.status === "Entregue";

  console.log("OrderDetailPage: Renderizando conteúdo principal.");
  return (
    <>
      <div className="main-content">
        <div className="card chat-card">
          <h2>Conversa do Pedido #{orderId.slice(-6)}</h2>
          <Link to={isProducer ? "/panel" : "/meus-pedidos"}>← Voltar</Link>
          <p>Status atual: <strong>{order.status}</strong></p>

          {/* Botões do Produtor */}
          {isProducer && isAwaitingConfirmation && (
            <div className="producer-actions">
              <button onClick={handleRefuseOrder} className="btn btn-danger">Recusar Pedido</button>
              <button onClick={handleAcceptOrder} className="btn btn-success">Aceitar Pedido</button>
            </div>
          )}
          {isProducer && canBeManaged && (
            <div className="order-management-actions">
              <button onClick={handleFinalizeOrder} className="btn btn-success">Finalizar Pedido</button>
              <button onClick={handleCancelOrder} className="btn btn-danger">Cancelar Pedido</button>
            </div>
          )}

          {/* Botões do Consumidor */}
          {isConsumer && canBeManaged && (
             <div className="order-management-actions">
               <button onClick={handleCancelOrder} className="btn btn-danger">Cancelar Pedido</button>
             </div>
          )}
          {isConsumer && isFinalized && !isDelivered && (
            <div className="consumer-actions">
              <button onClick={handleConfirmDelivery} className="btn btn-success">Confirmar Recebimento</button>
            </div>
          )}

          {/* Mensagem se já foi entregue */}
          {isDelivered && <p style={{color: 'green', fontWeight: 'bold'}}>Você confirmou o recebimento deste pedido.</p>}

          {/* Área de Mensagens */}
          <div className="messages-container">
            {messages.length === 0 && !loading && !error && ( <p>Nenhuma mensagem nesta conversa ainda.</p> )}
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message-bubble ${msg.senderId === user.id ? 'sent' : 'received'} ${msg.isSystemMessage ? 'system' : ''}`}
              >
                <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulário de Envio de Mensagem */}
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isChatActive ? "Digite sua mensagem..." : "O chat não está ativo para este pedido."}
              className="form-control"
              disabled={!isChatActive}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isChatActive}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>

      {/* Renderiza o Modal de Feedback */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        order={order} // Passa os dados do pedido para o modal
      />
    </>
  );
}

export default OrderDetailPage;