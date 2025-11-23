import React from 'react'
import './ReceiptPopup.css'

const ReceiptPopup = ({ orderDetails, onClose, onPrint, onPlaceOrder }) => {
  if (!orderDetails) return null;

  return (
    <div className='recipt-popup-overlay text-dark'>
      <div className='receipt-popup'>
        <div className='text-center mb-4'>
          <i className='bi bi-check-circle-fill text-success fs-1'></i>
        </div>
        <h3 className='text-center mb-4'>Order Receipt</h3>
        
        <p>
          <strong>Order ID: </strong>{orderDetails.id}
        </p>
        <p>
          <strong>Name: </strong>{orderDetails.customerName}
        </p>
        <p>
          <strong>Phone: </strong>{orderDetails.customerMobile}
        </p>
        
        <div className='my-3'>
          <div className='mb-3'>
            <div className='cart-items-scrollable'>
              {orderDetails.items && orderDetails.items.map((item, index) => (
                <div key={index} className='d-flex justify-content-between mb-2'>
                  <span>{item.name} x {item.quantity}</span>
                  <span>रु {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <hr className='my-3' />
            
            <div className='d-flex justify-content-between mb-2'>
              <span><strong>Subtotal:</strong></span>
              <span className='ms-2'>रु {orderDetails.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className='d-flex justify-content-between mb-2'>
              <span><strong>Tax (13%):</strong></span>
              <span className='ms-2'>रु {orderDetails.tax?.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className='d-flex justify-content-between mt-2'>
              <span><strong>Total:</strong></span>
              <span className='ms-2'>रु {orderDetails.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <p>
            <strong>Payment Method: </strong>{orderDetails.paymentMode}
          </p>

          <div className='d-flex justify-content-end gap-3 mt-4'>
            <button className='btn btn-warning' onClick={onPrint}>
              <i className='bi bi-printer me-2'></i>
              Print
            </button>
            <button className='btn btn-danger' onClick={onClose}>
              Close
            </button>
            <button className='btn btn-success' onClick={onPlaceOrder}>
              <i className='bi bi-check-circle me-2'></i>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceiptPopup