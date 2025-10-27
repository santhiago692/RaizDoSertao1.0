// src/components/SearchBar.jsx
import React from 'react';

function SearchBar({ searchTerm, setSearchTerm, categories, selectedCategory, setSelectedCategory }) {
    // TODO: Aplicar estilos do PDF aqui (Barra de busca e filtros de categoria)
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Buscar produtos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
        <option value="">Todas as Categorias</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;