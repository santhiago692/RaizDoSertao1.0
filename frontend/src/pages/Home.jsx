import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearch } from '../contexts/SearchContext';
import ProductCard from '../components/ProductCard';
import CategoryBanner from '../components/CategoryBanner';
import { FiTrendingUp, FiStar } from 'react-icons/fi';

const PRODUCTS_API_URL = 'http://localhost:5000/api/products';

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm } = useSearch();

  // NOVO ESTADO para controlar a categoria
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Usamos Promise.all para carregar tudo em paralelo
        const [
          allProductsRes,
          topRatedRes,
          bestSellingRes
        ] = await Promise.all([
          axios.get(PRODUCTS_API_URL),
          axios.get(`${PRODUCTS_API_URL}/top-rated`),
          axios.get(`${PRODUCTS_API_URL}/best-selling`)
        ]);

        setAllProducts(allProductsRes.data);
        setTopRatedProducts(topRatedRes.data);
        setBestSellingProducts(bestSellingRes.data);
        
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os produtos do servidor.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // NOVA FUNÇÃO para o CategoryBanner chamar
  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  // --- Listas de Produtos ---
  const newProducts = allProducts.slice(0, 8); 

  const searchResults = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // NOVA LISTA para produtos da categoria
  const categoryResults = selectedCategory
    ? allProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : [];

  // --- Renderização ---
  if (loading) return <div className="main-content"><h2>Carregando produtos da feira...</h2></div>;
  if (error) return <div className="main-content"><h2>Erro: {error}</h2></div>;

  return (
    <div className="home-page">
      {/* Passamos a nova função como prop para o banner */}
      <CategoryBanner onCategorySelect={handleCategorySelect} />

      <div className="main-content">
        {searchTerm ? (
          // --- 1. Seção: RESULTADOS DA BUSCA ---
          <>
            <h2 className="section-title">Resultados da Busca</h2>
            <div className="product-list">
              {searchResults.length > 0 ?
                searchResults.map(product => <ProductCard key={product._id} product={product} />) :
                <p>Nenhum produto encontrado para "{searchTerm}".</p>
              }
            </div>
          </>

      ) : selectedCategory ? (
          // --- 2. NOVA Seção: RESULTADOS DA CATEGORIA ---
          <>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Categoria: {selectedCategory}</span>
              <button 
                onClick={() => setSelectedCategory(null)} 
                style={{fontSize: '0.9rem', padding: '5px 10px', border: 'none', borderRadius: '5px', backgroundColor: '#8B4513', color: 'white', cursor: 'pointer'}}
              >
                Mostrar todas
              </button>
            </h2>
            <div className="product-list">
              {categoryResults.length > 0 ?
                categoryResults.map(product => <ProductCard key={product._id} product={product} />) :
                <p>Nenhum produto encontrado nesta categoria.</p>
              }
            </div>
          </>

      ) : (
          // --- 3. Seção: PÁGINA INICIAL PADRÃO (sem busca ou categoria) ---
          <>
            {/* --- SEÇÃO: MELHOR AVALIADOS (Corrigido) --- */}
            {topRatedProducts.length > 0 && (
                <>
                    <h2 className="section-title">
                      <FiStar style={{ marginRight: '10px', verticalAlign: 'bottom' }} /> 
                      Melhor Avaliados
                    </h2>
                    <div className="product-list">
                      {topRatedProducts.map(product => <ProductCard key={product._id} product={product} />)}
                    </div>
                </>
            )}
            {/* --- FIM MELHOR AVALIADOS --- */}

            {/* --- SEÇÃO: PRODUTOS EM ALTA (MAIS VENDIDOS) --- */}
            {bestSellingProducts.length > 0 && (
              <>
                <h2 className="section-title">
                  <FiTrendingUp style={{ marginRight: '10px', verticalAlign: 'bottom', color: 'var(--primary-color)' }} />
                  Produtos em alta
                </h2>
                <div className="product-list">
                  {bestSellingProducts.map(product => <ProductCard key={product._id} product={product} />)}
                </div>
              </>
            )}
            {/* --- FIM PRODUTOS EM ALTA --- */}
            
            {/* --- SEÇÃO: NOVIDADES --- */}
            {newProducts.length > 0 && (
              <>
                <h2 className="section-title">Novidades na Feira</h2>
                <div className="product-list">
                  {newProducts.map(product => <ProductCard key={product._id} product={product} />)}
                </div>
              </>
            )}
            {/* --- FIM NOVIDADES --- */}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;