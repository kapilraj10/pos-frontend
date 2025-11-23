import React, { useContext } from 'react'
import './CartSummary.css'
import { AppContext } from '../../context/AppContext'
import ReceiptPopup from '../ReceiptPopup/ReceiptPopup.jsx';
const CartSummary = ({ customerName, setCustomerName, customerMobile, setCustomerMobile }) => {
  const { cartItems } = useContext(AppContext);
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const tax = totalAmount * 0.13;
  const grandTotal = totalAmount + tax;
  return (
    <div className="cart-summary p-3 bg-dark rounded">
      <h5 className="text-light mb-3">Cart Summary</h5>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-light">Subtotal:</span>
        <span className="text-light">रु {totalAmount.toFixed(2)}</span>
      </div>
      <div className="d-flex justify-content-between mb-2">
        <span className="text-light">Tax (13%):</span>
        <span className="text-light">रु {tax.toFixed(2)}</span>
      </div>
      <hr className="border-secondary" />
      <div className="d-flex justify-content-between mb-3"></div>
      <strong className="text-light">Total:</strong>
      <strong className="text-light">रु {grandTotal.toFixed(2)}</strong>
      <div className="d-flex gap-3">
        <button className="btn btn-success flex-grow-1">
          Cash
        </button>
        <button
          className="btn flex-grow-1"
          style={{ backgroundColor: "#5D2E8E", color: "white" }}
        >
          Khalti
        </button>

      </div>
      {/* <ReceiptPopup /> */}
      <div className='d-flex gap-3 mt-3'>
        <button className='btn btn-warning flex-grow-1'>
          Place Order
        </button>
      </div>
    </div>


  )
}

export default CartSummary