import React, { useContext } from 'react'
import './item.css'
import { AppContext } from '../../context/AppContext'

const Item = ({ itemName, itemImage, itemPrice, itemId }) => {
    const { addToCart } = useContext(AppContext);
    
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
    <div className="p-3 bg-dark rounded shadow-sm h-100 d-flex align-items-center item-card">
      <div style={{ position: 'relative', marginRight: "15px" }}>
        <img src={itemImage || 'https://placehold.co/80x80'} alt={itemName} className="item-image" />
      </div>
      <div className="flex-grow-1 ms-2">
        <h6 className="text-white mb-1">{itemName}</h6>
        <p className="text-white-50 mb-0">रु {itemPrice}</p>
      </div>
      <div className="d-flex flex-column justify-content-between align-items-center ms-3" style={{ height: "100%" }}>
        <i className='bi bi-cart-plus ps-4 text-warning fs-4'></i>
        <button className='btn btn-success btn-sm mt-2' onClick={handleAddToCart}>
          <i className='bi bi-plus'></i> 
        </button>
      </div>
    </div>
  )
}

export default Item