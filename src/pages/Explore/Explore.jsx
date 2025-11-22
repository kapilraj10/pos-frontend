import React from "react";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import "./Explore.css";

const Explore = () => {
  const {categories} = useContext(AppContext);
  console.log(categories);
  return (
    <div className="explore-container text-light container-fluid py-3">
      <div className="row">
        {/* Left Column */}
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="left-column bg-dark border border-light rounded-3">
            <div className="first-row">
              <h5 className="fw-bold mb-2">Categories</h5>
              <div className="cart-item mb-2">Category item</div>
              <div className="cart-item">Another category</div>
            </div>

            <hr className="horizontal-line" />

            <div className="second-row">
              <h6 className="fw-semibold mb-2">Second Row Content</h6>
              <div className="cart-item">Any content here…</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-8">
          <div className="right-column bg-dark border border-light rounded-3">
            {/* Customer Form */}
            <div className="p-3 border-bottom border-secondary">
              <h5 className="fw-bold m-0">Customer Form</h5>
            </div>

            {/* Cart Items */}
            <div className="flex-grow-1 p-3 overflow-auto">
              <h6 className="fw-semibold mb-2">Cart Items</h6>
              <div className="cart-item mb-2">Item #1</div>
              <div className="cart-item mb-2">Item #2</div>
              <div className="cart-item">Item #3</div>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary-container p-3">
              <h6 className="fw-semibold mb-2">Cart Summary</h6>
              <div>Total: Rs. 0.00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;