import React from 'react';

const categories = [
  { name: 'Frutas e Legumes', image: '/images/frutas.png' },
  { name: 'Comidas e Doces', image: '/images/comidas.png' },
  { name: 'Laticínios', image: '/images/laticinios.png' },
  { name: 'Artesanato', image: '/images/artesanato.png' },
  { name: 'Carnes e Ovos', image: '/images/carnes.png' },
  { name: 'Farinhas e Temperos', image: '/images/farinhas.png' },
];

// --- ALTERAÇÃO AQUI ---
// 1. Recebemos a prop { onCategorySelect } que veio do Home.jsx
function CategoryBanner({ onCategorySelect }) {
  return (
    <div className="category-banner-wrapper">
      <div className="category-banner">
        {categories.map((category) => (
          
          // --- ALTERAÇÃO AQUI ---
          // 2. Trocamos <a> por <div>
          // 3. Adicionamos o onClick que chama a função
          <div 
            key={category.name} 
            className="category-item"
            onClick={() => onCategorySelect(category.name)}
            style={{ cursor: 'pointer' }} // Adiciona o cursor de "mãozinha"
          >
            <img src={category.image} alt={category.name} className="category-image" />
          </div>
          // --- FIM DA ALTERAÇÃO ---

        ))}
      </div>
    </div>
  );
}

export default CategoryBanner;