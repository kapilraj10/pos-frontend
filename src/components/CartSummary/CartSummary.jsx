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
    clearCart();
  };

  const placeOrder = () => {
    setShowPopup(true);
    clearAll();
  };

  const handlePrintReceipt = () => {
    window.print();
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

    const orderData = {
      customerName,
      customerMobile,
      paymentMode,
      items: cartItems.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: grandTotal,
    };

    setProcessing(true);

    try {
      const response = await createOrder(orderData);

      if (response.status === 201 && paymentMode === "cash") {
        toast.success("Order placed successfully");
        setOrderDetails(response.data);
      } else if (response.status === 201 && paymentMode === "Khalti") {
        toast.success("Please wait, Khalti payment gateway is being integrated");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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

      <div className="d-flex justify-content-between mb-3">
        <strong className="text-light">Total:</strong>
        <strong className="text-light">रु {grandTotal.toFixed(2)}</strong>
      </div>

      <div className="d-flex gap-3">
        <button
          className="btn btn-success flex-grow-1"
          style={{ backgroundColor: "#5D2E8E", color: "white" }}
          onClick={() => completePayment("cash")}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Cash"}
        </button>

        <button
          className="btn flex-grow-1"
          style={{ backgroundColor: "#5D2E8E", color: "white" }}
          onClick={() => completePayment("Khalti")}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Khalti"}
        </button>
      </div>

      <div className="d-flex gap-3 mt-3">
        <button
          className="btn btn-warning flex-grow-1"
          onClick={placeOrder}
          disabled={isProcessing || !orderDetails}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
