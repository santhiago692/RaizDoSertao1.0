import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  // Agora usamos o producerId que vem da API
  const profileLink = product.producerId ? `/produtor/${product.producerId}` : '#'; // Fallback para '#' se não houver ID

  return (
    <div className="product-card">
      {/* Link para a página do produto */}
      <Link to={`/products/${product._id}`}>
        <img src={product.imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
      </Link>
      <div className="product-card-info">
         {/* Link para a página do produto */}
         <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{product.name}</h3>
         </Link>
         <p className="price">R$ {product.price.toFixed(2)}</p>
         {/* Link para a página do produtor */}
         <Link to={profileLink} className="store-name-link">
            <p className="store-name">{product.storeName}</p>
         </Link>
      </div>
    </div>
  );
}

export default ProductCard;