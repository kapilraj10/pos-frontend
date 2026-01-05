import React, { useEffect } from 'react'
import './ReceiptPopup.css'

const ReceiptPopup = ({ orderDetails, onClose, onPlaceOrder, autoShowPrint = false }) => {

  // Calculate totals if not provided
  const subtotal = orderDetails?.subtotal || orderDetails?.items?.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0) || 0;
  const tax = orderDetails?.tax || subtotal * 0.13;
  const totalAmount = orderDetails?.totalAmount || subtotal + tax;

  // Get payment method details - SAME FORMAT for Cash and Khalti
  const paymentMethod = (orderDetails?.paymentMode || 'CASH').toUpperCase();
  let paymentIcon = '💵';
  let paymentLabel = 'CASH';
  let paymentClass = 'payment-cash';

  if (paymentMethod.includes('KHALTI')) {
    paymentIcon = '📱';
    paymentLabel = 'KHALTI';
    paymentClass = 'payment-khalti';
  } else if (paymentMethod.includes('CARD')) {
    paymentIcon = '💳';
    paymentLabel = 'CARD';
    paymentClass = 'payment-card';
  }

  // Handle print - Generate print window with SAME format for both methods
  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=700,width=450');
    printWindow.document.write('<html><head><title>Receipt - ' + (orderDetails.id || 'ORDER') + '</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Courier New', monospace; 
        padding: 20px; 
        max-width: 400px; 
        margin: 0 auto;
        background: white;
        color: #000;
      }
      .receipt-header { 
        text-align: center; 
        border-bottom: 2px dashed #000; 
        padding-bottom: 15px; 
        margin-bottom: 20px; 
      }
      .receipt-header h1 { 
        margin: 5px 0 10px 0; 
        font-size: 24px; 
        font-weight: bold;
        letter-spacing: 2px;
      }
      .receipt-header p { 
        margin: 3px 0; 
        font-size: 13px; 
      }
      .divider { 
        border-bottom: 1px dashed #666; 
        margin: 15px 0; 
      }
      .order-info { 
        margin-bottom: 20px; 
        font-size: 13px; 
        line-height: 1.8;
      }
      .order-info p { 
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
      }
      .order-info strong { 
        font-weight: bold; 
        min-width: 100px;
      }
      .payment-badge {
        display: inline-block;
        padding: 4px 10px;
        background: #f0f0f0;
        border-radius: 4px;
        font-weight: bold;
        border: 1px solid #ddd;
      }
      .payment-cash { background: #d4edda; color: #155724; border-color: #c3e6cb; }
      .payment-khalti { background: #e7d4f5; color: #5b2c91; border-color: #d4b0f0; }
      .payment-card { background: #cce5ff; color: #004085; border-color: #b8daff; }
      .items-section { margin: 20px 0; }
      .items-section h3 { 
        font-size: 14px; 
        margin-bottom: 10px;
        border-bottom: 2px solid #000;
        padding-bottom: 5px;
      }
      .items-table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 10px 0; 
      }
      .items-table th { 
        text-align: left; 
        border-bottom: 2px solid #000; 
        padding: 8px 2px; 
        font-size: 11px;
        font-weight: bold;
      }
      .items-table td { 
        padding: 8px 2px; 
        font-size: 12px;
        border-bottom: 1px dotted #ccc;
      }
      .items-table tr:last-child td { border-bottom: none; }
      .items-table .text-right { text-align: right; }
      .items-table .text-center { text-align: center; }
      .totals { 
        border-top: 2px solid #000; 
        padding-top: 15px; 
        margin-top: 15px; 
      }
      .totals p { 
        display: flex; 
        justify-content: space-between; 
        margin: 8px 0; 
        font-size: 13px; 
      }
      .grand-total { 
        font-size: 16px; 
        font-weight: bold; 
        border-top: 2px double #000; 
        padding-top: 12px; 
        margin-top: 12px;
      }
      .payment-info {
        margin: 20px 0;
        padding: 12px;
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .payment-info p {
        margin: 5px 0;
        font-size: 12px;
      }
      .footer { 
        text-align: center; 
        margin-top: 25px; 
        border-top: 2px dashed #000; 
        padding-top: 15px; 
        font-size: 12px; 
      }
      .footer p { margin: 5px 0; }
      .footer .bold { font-weight: bold; font-size: 13px; }
      @media print { 
        body { padding: 10px; }
      }
    `);
    printWindow.document.write('</style></head><body>');

    // Header - SAME for both Cash and Khalti
    printWindow.document.write('<div class="receipt-header">');
    printWindow.document.write('<h1>⚡ POS SYSTEM ⚡</h1>');
    printWindow.document.write('<p><strong>OFFICIAL RECEIPT</strong></p>');
    printWindow.document.write('<p>Phone: +977-9704167805</p>');
    printWindow.document.write('<p>Email: kapilraj.devloper@gmail.com</p>');
    printWindow.document.write('</div>');

    // Order Info - SAME format
    const orderDate = orderDetails.createdAt
      ? new Date(orderDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const orderTime = orderDetails.createdAt
      ? new Date(orderDetails.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    printWindow.document.write('<div class="order-info">');
    printWindow.document.write('<p><strong>Order ID:</strong> <span>' + (orderDetails.id || 'ORD-PREVIEW') + '</span></p>');
    printWindow.document.write('<p><strong>Date:</strong> <span>' + orderDate + '</span></p>');
    printWindow.document.write('<p><strong>Time:</strong> <span>' + orderTime + '</span></p>');
    printWindow.document.write('<p><strong>Customer:</strong> <span>' + (orderDetails.customerName || 'Customer') + '</span></p>');
    printWindow.document.write('<p><strong>Phone:</strong> <span>' + (orderDetails.customerMobile || 'N/A') + '</span></p>');
    printWindow.document.write('</div>');

    printWindow.document.write('<div class="divider"></div>');

    // Items - SAME format
    printWindow.document.write('<div class="items-section">');
    printWindow.document.write('<h3>ORDER ITEMS</h3>');
    printWindow.document.write('<table class="items-table">');
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th>Item</th>');
    printWindow.document.write('<th class="text-center">Qty</th>');
    printWindow.document.write('<th class="text-right">Price</th>');
    printWindow.document.write('<th class="text-right">Total</th>');
    printWindow.document.write('</tr></thead><tbody>');

    let totalItems = 0;
    (orderDetails.items || []).forEach(item => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      totalItems += item.quantity || 0;
      printWindow.document.write('<tr>');
      printWindow.document.write('<td>' + item.name + '</td>');
      printWindow.document.write('<td class="text-center">' + item.quantity + '</td>');
      printWindow.document.write('<td class="text-right">Rs. ' + (item.price || 0).toFixed(2) + '</td>');
      printWindow.document.write('<td class="text-right">Rs. ' + itemTotal.toFixed(2) + '</td>');
      printWindow.document.write('</tr>');
    });

    printWindow.document.write('</tbody></table>');
    printWindow.document.write('<p style="text-align: right; font-size: 12px; margin-top: 5px;">Total Items: ' + totalItems + '</p>');
    printWindow.document.write('</div>');

    // Totals - SAME format
    printWindow.document.write('<div class="totals">');
    printWindow.document.write('<p><span>Subtotal:</span><span>Rs. ' + subtotal.toFixed(2) + '</span></p>');
    printWindow.document.write('<p><span>Tax (13%):</span><span>Rs. ' + tax.toFixed(2) + '</span></p>');
    printWindow.document.write('<p class="grand-total"><span>GRAND TOTAL:</span><span>Rs. ' + totalAmount.toFixed(2) + '</span></p>');
    printWindow.document.write('</div>');

    // Payment Details - SAME format, different content
    printWindow.document.write('<div class="divider"></div>');
    printWindow.document.write('<div class="payment-info">');
    printWindow.document.write('<p style="text-align: center; font-weight: bold; margin-bottom: 8px;">PAYMENT DETAILS</p>');
    printWindow.document.write('<p><strong>Method:</strong> <span class="payment-badge payment-' + paymentLabel.toLowerCase() + '">' + paymentIcon + ' ' + paymentLabel + '</span></p>');
    printWindow.document.write('<p><strong>Amount:</strong> <span style="font-weight: bold;">Rs. ' + totalAmount.toFixed(2) + '</span></p>');

    if (paymentLabel === 'KHALTI') {
      printWindow.document.write('<p style="font-size: 11px; color: #666; margin-top: 8px;">Transaction ID: ' + (orderDetails.transactionId || 'KHL' + Date.now()) + '</p>');
      printWindow.document.write('<p style="font-size: 11px; color: #666;">Paid via Khalti Digital Wallet</p>');
    } else if (paymentLabel === 'CASH') {
      printWindow.document.write('<p style="font-size: 11px; color: #666; margin-top: 8px;">Cash payment received</p>');
      printWindow.document.write('<p style="font-size: 11px; color: #666;">Change: Rs. 0.00</p>');
    }

    printWindow.document.write('</div>');

    // Footer - SAME for both
    printWindow.document.write('<div class="footer">');
    printWindow.document.write('<p class="bold">★★★ THANK YOU FOR YOUR ORDER! ★★★</p>');
    printWindow.document.write('<p>We appreciate your business</p>');
    printWindow.document.write('<p style="margin-top: 10px; font-size: 11px;">Please visit us again!</p>');
    printWindow.document.write('<p style="margin-top: 15px; font-size: 10px; color: #666;">This is a computer-generated receipt</p>');
    printWindow.document.write('</div>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Auto-show print dialog when order is successfully placed
  useEffect(() => {
    if (autoShowPrint && orderDetails) {
      // Small delay to ensure receipt is rendered before printing
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoShowPrint]);

  if (!orderDetails) return null;

  return (
    <div className='receipt-overlay' onClick={(e) => {
      if (e.target.classList.contains('receipt-overlay')) onClose();
    }}>
      <div className='receipt-container'>
        {/* Professional Header - SAME for Cash and Khalti */}
        <div className='receipt-header'>
          <h2>⚡ POS SYSTEM ⚡</h2>
          <p className='receipt-subtitle'>OFFICIAL RECEIPT</p>
          <p className='receipt-contact'>Phone: +977-9704167805</p>
          <p className='receipt-contact'>Email: kapilraj.devloper@gmail.com</p>
        </div>

        {/* Receipt Body */}
        <div className='receipt-body'>
          {/* Customer Info - SAME format */}
          <div className='info-section'>
            <div className='info-row'>
              <span>Order ID:</span>
              <strong>#{orderDetails.id || 'PREVIEW'}</strong>
            </div>
            <div className='info-row'>
              <span>Date:</span>
              <strong>
                {orderDetails.createdAt
                  ? new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                  : new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                }
              </strong>
            </div>
            <div className='info-row'>
              <span>Time:</span>
              <strong>
                {orderDetails.createdAt
                  ? new Date(orderDetails.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  : new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              </strong>
            </div>
            <div className='info-row'>
              <span>Customer:</span>
              <strong>{orderDetails.customerName || 'Customer'}</strong>
            </div>
            <div className='info-row'>
              <span>Phone:</span>
              <strong>{orderDetails.customerMobile || 'N/A'}</strong>
            </div>
          </div>

          <hr />

          {/* Items - SAME format */}
          <div className='items-section'>
            <h4>ORDER ITEMS</h4>
            <table className='items-table'>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items && orderDetails.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>रु {Number(item.price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>रु {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontSize: '0.9em', marginTop: '8px', color: '#666' }}>
              Total Items: {orderDetails.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
            </div>
          </div>

          <hr />

          {/* Totals - SAME format */}
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
              <span><strong>GRAND TOTAL:</strong></span>
              <span><strong>रु {totalAmount.toFixed(2)}</strong></span>
            </div>
          </div>

          <hr />

          {/* Payment Details - SAME format for both methods */}
          <div className='payment-section'>
            <h4 style={{ textAlign: 'center', marginBottom: '12px' }}>PAYMENT DETAILS</h4>
            <div className='info-row'>
              <span>Method:</span>
              <strong>
                <span className={`payment-badge ${paymentClass}`}>
                  {paymentIcon} {paymentLabel}
                </span>
              </strong>
            </div>
            <div className='info-row'>
              <span>Amount Paid:</span>
              <strong style={{ color: '#28a745' }}>रु {totalAmount.toFixed(2)}</strong>
            </div>
            {paymentLabel === 'KHALTI' && orderDetails.transactionId && (
              <div className='info-row' style={{ fontSize: '0.85em', color: '#666' }}>
                <span>Transaction ID:</span>
                <span>{orderDetails.transactionId}</span>
              </div>
            )}
            {paymentLabel === 'KHALTI' && !orderDetails.transactionId && (
              <div style={{ fontSize: '0.85em', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                Paid via Khalti Digital Wallet
              </div>
            )}
            {paymentLabel === 'CASH' && (
              <div style={{ fontSize: '0.85em', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                Cash payment received
              </div>
            )}
          </div>

          <div className='footer-text'>
            <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>★★★ THANK YOU FOR YOUR ORDER! ★★★</p>
            <p>We appreciate your business</p>
            <p style={{ fontSize: '0.9em', marginTop: '8px' }}>Please visit us again!</p>
          </div>
        </div>

        {/* Action Buttons - SAME for both */}
        <div className='action-buttons'>
          <button className='btn btn-secondary' onClick={onClose}>
            <i className="bi bi-x-circle"></i> Close
          </button>
          {!autoShowPrint && (
            <button className='btn btn-success' onClick={onPlaceOrder}>
              <i className="bi bi-check-circle"></i> Confirm Order
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiptPopup