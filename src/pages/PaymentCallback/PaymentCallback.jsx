import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { lookupKhaltiPayment } from "../../Service/PaymentService";
import { toast } from "react-toastify";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup";
import "./PaymentCallback.css";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const txnId = searchParams.get("transaction_id");

    if (!pidx) {
      setStatus("failed");
      toast.error("Payment callback missing pidx. Please contact support.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await lookupKhaltiPayment(pidx);
        console.log("Payment lookup response:", response);

        // Check if payment status is Completed
        if (response && response.status === "Completed") {
          // Get order data from localStorage (stored before redirect)
          const storedOrder = JSON.parse(localStorage.getItem("khalti_order") || "{}");
          
          // Build order details in ReceiptPopup format
          const details = {
            id: response.orderId || storedOrder.orderId || `KH-${Date.now()}`,
            customerName: storedOrder.customerName || "Customer",
            customerMobile: storedOrder.phoneNumber || "N/A",
            items: storedOrder.items || [],
            subtotal: storedOrder.subTotal || (response.total_amount / 100 / 1.13),
            tax: storedOrder.tax || ((response.total_amount / 100) * 0.13 / 1.13),
            totalAmount: storedOrder.grandTotal || (response.total_amount / 100),
            paymentMode: "Khalti",
            transactionId: response.transaction_id || txnId,
            createdAt: new Date().toISOString()
          };

          setOrderDetails(details);
          setStatus("success");
          toast.success("Payment verified successfully!");
          
          // Clear stored order data
          localStorage.removeItem("khalti_order");
        } else if (response && response.status === "Pending") {
          setStatus("pending");
          toast.info("Payment is pending. Please wait.");
        } else {
          setStatus("failed");
          toast.error("Payment verification failed.");
        }
      } catch (error) {
        setStatus("failed");
        toast.error("Error verifying payment. Please try again.");
        console.error("Payment verification error:", error);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  // Component JSX needs to be returned
  return (
    <div className="payment-callback-container">
      <div className="payment-status-card">
        {status === "processing" && (
          <div className="processing-status">
            <div className="spinner"></div>
            <h2>Verifying Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        )}

        {status === "success" && orderDetails && (
          <div className="success-status">
            <div className="checkmark">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your payment has been confirmed</p>
            
            <div className="order-summary-preview">
              <h3>Order Summary</h3>
              <div className="preview-details">
                <div className="preview-row">
                  <span>Order ID:</span>
                  <strong>{orderDetails.id}</strong>
                </div>
                <div className="preview-row">
                  <span>Amount:</span>
                  <strong>रु {orderDetails.totalAmount}</strong>
                </div>
                <div className="preview-row">
                  <span>Date:</span>
                  <strong>{new Date(orderDetails.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => setShowPrintSlip(true)}
              >
                📄 View & Print Receipt
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate("/orders")}
              >
                View Orders
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate("/explore")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="pending-status">
            <div className="clock-icon">⏳</div>
            <h2>Payment Pending</h2>
            <p>Your payment is being processed. Please wait or contact support.</p>
            
            <div className="action-buttons">
              <button 
                className="btn btn-outline" 
                onClick={() => navigate("/explore")}
              >
                Return to Store
              </button>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="failed-status">
            <div className="crossmark">✗</div>
            <h2>Payment Failed</h2>
            <p>We couldn't verify your payment. Please try again.</p>
            
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate("/explore")}
              >
                Try Again
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate("/explore")}
              >
                Return to Store
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Print Slip Modal - Using ReceiptPopup Component */}
      {showPrintSlip && orderDetails && (
        <ReceiptPopup
          orderDetails={orderDetails}
          onClose={() => setShowPrintSlip(false)}
          onPrint={handlePrint}
          onPlaceOrder={() => {
            toast.success("Order already placed!");
            setShowPrintSlip(false);
            navigate("/orders");
          }}
        />
      )}
    </div>
  );
};

export default PaymentCallback;