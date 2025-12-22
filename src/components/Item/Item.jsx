import React, { useContext } from 'react'
import './item.css'
import { AppContext } from '../../context/AppContext'

const Item = ({ itemName, itemImage, itemPrice, itemId, paymentTypes }) => {
  const { addToCart, cart } = useContext(AppContext);
  // Check if item is in cart
  const itemInCart = cart?.find(cartItem => String(cartItem.id) === String(itemId));
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;
  const handleAddToCart = () => {
    addToCart({ 
      name: itemName, 
      imgUrl: itemImage, 
      price: itemPrice, 
      id: itemId,
      quantity: 1
    });
  }
  return (
    <div className={`item-card ${quantityInCart > 0 ? 'item-in-cart' : ''}`}>
      <div className="item-image-wrapper">
        <img 
          src={itemImage || 'https://via.placeholder.com/150'} 
          alt={itemName} 
          className="item-image"
        />
        {quantityInCart > 0 && (
          <div className="item-cart-badge">
            <i className="bi bi-cart-check-fill"></i> {quantityInCart}
          </div>
        )}
      </div>
      <div className="item-content">
        <div className="item-name-section">
          <h6 className="item-name" title={itemName}>{itemName}</h6>
        </div>
        {/* Payment Types */}
        {paymentTypes && Array.isArray(paymentTypes) && paymentTypes.length > 0 && (
          <div className="item-payment-types">
            {paymentTypes.map((type, idx) => (
              <span key={idx} className={`payment-type-badge payment-type-${type.toLowerCase()}`}>{type}</span>
            ))}
          </div>
        )}
        <div className="item-footer">
          <span className="item-price">रु{itemPrice}</span>
          <button className='item-add-btn' onClick={handleAddToCart}>
            <i className='bi bi-plus'></i> Add
          </button>
        </div>
      </div>
    </div>
  )
}

export default Item