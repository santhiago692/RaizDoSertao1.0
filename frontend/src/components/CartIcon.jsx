import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

function CartIcon() {
  const { getTotalItemsCount } = useCart();
  const totalItems = getTotalItemsCount();

  // Estilo CSS (pode colocar num arquivo .css se preferir)
  const cartIconStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-color)', // Herda a cor do header
    textDecoration: 'none',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-10px',
    backgroundColor: 'var(--highlight-color)', // Cor de destaque
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  };

  return (
    // No futuro, este link levará para a página da sacola
    <Link to="/sacola" style={cartIconStyle} title="Ver sacola"> 
      <FiShoppingBag size={24} />
      {totalItems > 0 && (
        <span style={badgeStyle}>
          {totalItems}
        </span>
      )}
    </Link>
  );
}

export default CartIcon;