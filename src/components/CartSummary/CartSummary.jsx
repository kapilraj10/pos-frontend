import React, { useContext, useState } from "react";
import "./CartSummary.css";
import { AppContext } from "../../context/AppContext";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import { toast } from "react-toastify";
import { createOrder } from "../../Service/OrderService.js";

const CartSummary = ({
  customerName,
  setCustomerName,
  customerMobile,
  setCustomerMobile,
}) => {
  const { cartItems, clearCart } = useContext(AppContext);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isProcessing, setProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const tax = totalAmount * 0.13;
  const grandTotal = totalAmount + tax;

  const clearAll = () => {
    setCustomerName("");
    setCustomerMobile("");
  };

  const completePayment = async (paymentMode) => {
    if (!customerName || !customerMobile) {
      toast.error("Please enter customer details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your Cart is empty");
      return;
    }

    // If Khalti payment selected, start remote checkout flow
    if (paymentMode.toLowerCase() === 'khalti') {
      // Prepare minimal order payload and call backend initiate endpoint
      setProcessing(true);
      try {
        const orderPreview = {
          customerName,
          phoneNumber: customerMobile,
          subTotal: parseFloat(totalAmount.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          grandTotal: parseFloat(grandTotal.toFixed(2)),
          paymentMethod: 'KHALTI',
          cartItems: cartItems.map((item) => ({ 
            name: item.name, 
            quantity: item.quantity, 
            price: item.price 
          }))
        };

        // Store order details in localStorage for callback page
        localStorage.setItem("khalti_order", JSON.stringify({
          customerName,
          phoneNumber: customerMobile,
          subTotal: parseFloat(totalAmount.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          grandTotal: parseFloat(grandTotal.toFixed(2)),
          items: cartItems.map((item) => ({ 
            name: item.name, 
            quantity: item.quantity, 
            price: item.price 
          }))
        }));

        const { initiateKhaltiPayment } = await import("../../Service/PaymentService.js");
        const returnUrl = `${window.location.origin}/payment/callback`;
        const resp = await initiateKhaltiPayment(orderPreview, returnUrl);

        // Expect resp.khalti.payment_url to redirect the user
        const khaltiObj = resp && resp.khalti ? resp.khalti : null;
        const finalUrl = (khaltiObj && (khaltiObj.payment_url || khaltiObj.paymentUrl)) || resp?.payment_url || resp?.paymentUrl || null;

        if (finalUrl) {
          // Clear cart before redirect
          clearCart();
          clearAll();
          
          // redirect to Khalti checkout
          window.location.href = finalUrl;
          return;
        }

        toast.error("Unable to start Khalti checkout. Please try again.");
      } catch (err) {
        console.error("Khalti start error:", err);
        toast.error("Failed to initiate Khalti payment. Please try again.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);

    try {
      console.log("Cart Items at payment:", cartItems);
      
      // Create order details for preview (NOT posting to backend yet)
      const orderPreview = {
        id: `preview-${Date.now()}`,
        customerName,
        customerMobile,
        paymentMode: paymentMode.toLowerCase(),
        items: cartItems.map((item) => ({
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: parseFloat(totalAmount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        totalAmount: parseFloat(grandTotal.toFixed(2)),
      };

      console.log("Order preview created:", orderPreview);

      // Set order details for preview
      setOrderDetails(orderPreview);
      
      // Show receipt popup for review (Cash payment only)
      setShowPopup(true);
    } catch (err) {
      console.error("Payment preview error:", err);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderDetails) {
      toast.error("No order details found");
      return;
    }

    setProcessing(true);

    try {
      // Prepare order data for backend with correct payload format
      const orderData = {
        customerName: orderDetails.customerName,
        phoneNumber: orderDetails.customerMobile,
        subTotal: orderDetails.subtotal,
        tax: orderDetails.tax,
        grandTotal: orderDetails.totalAmount,
        paymentMethod: orderDetails.paymentMode.toUpperCase(),
        cartItems: orderDetails.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Placing order:", JSON.stringify(orderData, null, 2));

      // Post order to backend
      const response = await createOrder(orderData);

      if (response && response.status === 201) {
        // Update order details with real order ID from backend
        const completedOrder = {
          ...orderDetails,
          id: response.data.id || response.data.orderId || orderDetails.id,
        };

        setOrderDetails(completedOrder);
        
        // Clear cart and customer info
        clearCart();
        clearAll();
        
        toast.success("Order placed successfully!");
        
        // Keep showing the receipt popup - don't auto print
        // User can click Print button if needed
      } else {
        toast.error("Failed to place order. Please try again.");
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Order placement error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
      setShowPopup(false);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  

  return (
    <div className="cart-summary p-3 bg-dark rounded">
      <h5 className="text-light mb-3">Cart Summary</h5>

      {cartItems.length === 0 ? (
        <div className="text-center text-secondary mb-3">
          <i className="bi bi-cart3 d-block mb-2" style={{ fontSize: '2rem' }}></i>
          <span>Your cart is empty</span>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-light">Subtotal:</span>
            <span className="text-light">रु{totalAmount.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-light">Tax (13%):</span>
            <span className="text-light">रु{tax.toFixed(2)}</span>
          </div>

          <hr className="border-secondary" />

          <div className="d-flex justify-content-between mb-3">
            <strong className="text-light">Total:</strong>
            <strong className="text-success">रु{grandTotal.toFixed(2)}</strong>
          </div>
        </>
      )}

      <div className="d-flex gap-3">
        <button
          className="btn btn-success flex-grow-1"
          style={{ backgroundColor: "#28a745", color: "white" }}
          onClick={() => completePayment("cash")}
          disabled={isProcessing || cartItems.length === 0}
        >
          {isProcessing ? "Processing..." : " Cash "}
        </button>

        <button
          className="btn flex-grow-1"
          style={{ backgroundColor: "#5D2E8E", color: "white" }}
          onClick={() => completePayment("khalti")}
          disabled={isProcessing || cartItems.length === 0}
        >
          {isProcessing ? "Processing..." : "Khalti"}
        </button>
      </div>

      {showPopup && (
        <ReceiptPopup
          orderDetails={orderDetails}
          onClose={() => setShowPopup(false)}
          onPrint={handlePrintReceipt}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
};

export default CartSummary;