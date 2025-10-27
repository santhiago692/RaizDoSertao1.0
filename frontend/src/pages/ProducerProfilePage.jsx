import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Reutilizaremos o card de produto

const USERS_API_URL = 'http://localhost:5000/api/users';
const PRODUCTS_API_URL = 'http://localhost:5000/api/products';
const FEEDBACK_API_URL = 'http://localhost:5000/api/feedbacks'; // Para a seção de avaliação futura

function ProducerProfilePage() {
  const { producerId } = useParams(); // Pega o ID do produtor da URL
  const [producerInfo, setProducerInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]); // Para avaliações futuras
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Busca as informações públicas do produtor (inclui avatarUrl)
        const infoRes = await axios.get(`${USERS_API_URL}/producer/${producerId}`);
        setProducerInfo(infoRes.data);

        // Busca os produtos do produtor
        const productsRes = await axios.get(`${PRODUCTS_API_URL}/producer/${producerId}`);
        setProducts(productsRes.data);
        
        // Busca feedbacks (futura implementação)
        // const feedbackRes = await axios.get(`${FEEDBACK_API_URL}/producer/${producerId}/feedbacks`);
        // setFeedbacks(feedbackRes.data);

      } catch (err) {
        setError("Erro ao carregar dados do produtor.");
        console.error("Erro no fetch:", err);
        if (err.response?.status === 404) {
             setError(err.response.data.message || "Produtor não encontrado.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducerData();
  }, [producerId]); // Executa sempre que o ID na URL mudar

  if (loading) return <div className="main-content card"><h2>Carregando perfil do produtor...</h2></div>;
  if (error) return <div className="main-content card"><h2>{error}</h2></div>;
  if (!producerInfo) return <div className="main-content card"><h2>Produtor não encontrado.</h2></div>;

  // --- LÓGICA DO AVATAR ---
  // Define qual URL usar: a salva no usuário ou a padrão do DiceBear
  const displayAvatarUrl = producerInfo.avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${producerInfo.name}`;

  return (
    <div className="main-content producer-profile-page">
      {/* Cabeçalho do Perfil */}
      <div className="card producer-profile-header">
        {/* Usando a URL correta (salva ou DiceBear) */}
        <img 
          src={displayAvatarUrl} 
          alt={`Avatar de ${producerInfo.name}`} 
          className="profile-icon large" 
        />
        <div className="producer-info">
          <h1>{producerInfo.storeName}</h1>
          <p>Vendido por: {producerInfo.name}</p>
          <p>Localização: {producerInfo.city}</p>
          {/* Adicionar a média de avaliações aqui no futuro */}
        </div>
      </div>

      {/* Lista de Produtos */}
      <h2 className="section-title" style={{ marginTop: '2rem' }}>Produtos de {producerInfo.storeName}</h2>
      {products.length === 0 ? (
        <p>Este produtor ainda não cadastrou produtos.</p>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
      
      {/* Seção de Avaliações (Futura implementação) */}
      {/* <h2 className="section-title" style={{ marginTop: '2rem' }}>Avaliações da Loja</h2>
      {feedbacks.length === 0 ? (
        <p>Ainda sem avaliações.</p>
      ) : (
          <div className="feedback-list">
              {/* Renderizar feedbacks aqui... */ /*}
          </div>
      )} */}

    </div>
  );
}

// Estilos básicos para a página de perfil (injetados)
const profileStyles = `
.producer-profile-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; }
.profile-icon.large { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
.producer-info h1 { margin: 0 0 0.5rem; font-size: 2.5rem; }
.producer-info p { margin: 0.25rem 0; color: #555; }
`;
let profileStyleSheet = document.getElementById("producerProfileStyle");
if (!profileStyleSheet) {
    profileStyleSheet = document.createElement("style");
    profileStyleSheet.id = "producerProfileStyle";
    profileStyleSheet.innerText = profileStyles;
    document.head.appendChild(profileStyleSheet);
}

export default ProducerProfilePage;