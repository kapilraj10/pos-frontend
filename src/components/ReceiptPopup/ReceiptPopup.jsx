import React from 'react'
import './ReceiptPopup.css'

const ReceiptPopup = ({ orderDetails, onClose, onPrint, onPlaceOrder }) => {
  if (!orderDetails) return null;

  // Calculate totals if not provided
  const subtotal = orderDetails.subtotal || orderDetails.items?.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0) || 0;
  const tax = orderDetails.tax || subtotal * 0.13;
  const totalAmount = orderDetails.totalAmount || subtotal + tax;

  // Handle print - hide overlay and buttons, then trigger print
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className='receipt-overlay' onClick={(e) => {
      if (e.target.classList.contains('receipt-overlay')) onClose();
    }}>
      <div className='receipt-container'>
        {/* Simple Header */}
        <div className='receipt-header'>
          <h2> POS Store</h2>
          <p className='receipt-subtitle'>Order Receipt</p>
        </div>

        {/* Receipt Body */}
        <div className='receipt-body'>
          {/* Customer Info */}
          <div className='info-section'>
            <div className='info-row'>
              <span>Order ID:</span>
              <strong>#{orderDetails.id || 'ORD-001'}</strong>
            </div>
            <div className='info-row'>
              <span>Customer:</span>
              <strong>{orderDetails.customerName || 'Customer'}</strong>
            </div>
            <div className='info-row'>
              <span>Phone:</span>
              <strong>{orderDetails.customerMobile || 'N/A'}</strong>
            </div>
            <div className='info-row'>
              <span>Date & Time:</span>
              <strong>
                {orderDetails.createdAt 
                  ? new Date(orderDetails.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : new Date().toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                }
              </strong>
            </div>
            <div className='info-row'>
              <span>Payment Method:</span>
              <strong>{orderDetails.paymentMode === 'cash' ? '💵 Cash' : '💳 ' + orderDetails.paymentMode}</strong>
            </div>
            {orderDetails.transactionId && (
              <div className='info-row'>
                <span>Transaction ID:</span>
                <strong>{orderDetails.transactionId}</strong>
              </div>
            )}
          </div>

          <hr />

          {/* Items */}
          <div className='items-section'>
            <h4>Items</h4>
            <table className='items-table'>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items && orderDetails.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>रु {Number(item.price).toFixed(2)}</td>
                    <td>रु {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <hr />

          {/* Totals */}
          <div className='totals-section'>
            <div className='total-row'>
              <span>Subtotal:</span>
              <span>रु {subtotal.toFixed(2)}</span>
            </div>
            <div className='total-row'>
              <span>Tax (13%):</span>
              <span>रु {tax.toFixed(2)}</span>
            </div>
            <div className='total-row grand-total'>
              <span>Total:</span>
              <span>रु {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className='footer-text'>
            <p>Thank you for your purchase!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='action-buttons'>
          <button className='btn btn-secondary' onClick={onClose}>Cancel</button>
          <button className='btn btn-primary' onClick={handlePrint}>Print</button>
          <button className='btn btn-success' onClick={onPlaceOrder}>Confirm Order</button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptPopup