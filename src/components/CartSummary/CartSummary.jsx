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
  const { cartItems, clearCart, refreshItems } = useContext(AppContext);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const [isProcessing, setProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [autoShowPrint, setAutoShowPrint] = useState(false);

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
            itemId: item.id,
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
            itemId: item.id,
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

    // For Cash payment - place order directly without preview popup
    setProcessing(true);

    try {
      console.log("Cart Items at payment:", cartItems);

      // Prepare order data for backend
      const orderData = {
        customerName: customerName,
        phoneNumber: customerMobile,
        subTotal: parseFloat(totalAmount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        paymentMethod: paymentMode.toUpperCase(),
        cartItems: cartItems.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log("Placing Cash order directly:", JSON.stringify(orderData, null, 2));

      // Post order to backend
      const response = await createOrder(orderData);

      if (response && response.status === 201) {
        // Create completed order details for receipt display
        const completedOrder = {
          id: response.data.id || response.data.orderId || 'ORD-' + Date.now(),
          customerName: customerName,
          customerMobile: customerMobile,
          paymentMode: paymentMode.toUpperCase(),
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: parseFloat(totalAmount.toFixed(2)),
          tax: parseFloat(tax.toFixed(2)),
          totalAmount: parseFloat(grandTotal.toFixed(2)),
          createdAt: new Date().toISOString(),
        };

        setOrderDetails(completedOrder);

        // Clear cart and customer info
        clearCart();
        clearAll();
        // Refresh items to reflect decremented stock after order
        try { await refreshItems(); } catch (e) { console.error('Failed to refresh items after order', e); }

        toast.success("Order placed successfully!");

        // Show receipt popup and auto-trigger print
        setShowPopup(true);
        setAutoShowPrint(true);
      } else {
        toast.error("Failed to place order. Please try again.");
        console.error("Unexpected response:", response);
      }
    } catch (err) {
      console.error("Order placement error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to place order. Please try again.");
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
          itemId: item.itemId || item.itemId,
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
        // Refresh items to reflect decremented stock after order
        try { await refreshItems(); } catch (e) { console.error('Failed to refresh items after order', e); }

        toast.success("Order placed successfully!");

        // Auto-show print dialog after successful order placement
        setAutoShowPrint(true);
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
          onClose={() => {
            setShowPopup(false);
            setAutoShowPrint(false);
          }}
          onPrint={handlePrintReceipt}
          onPlaceOrder={handlePlaceOrder}
          autoShowPrint={autoShowPrint}
        />
      )}
    </div>
  );
};

export default CartSummary;