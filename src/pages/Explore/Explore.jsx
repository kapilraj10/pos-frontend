import React, { useState } from "react";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import DisplayCategory from '../../components/DisplayCategory/DisplayCategory.jsx';
import DisplayItems from '../../components/DisplayItems/DisplayItems.jsx';
import CustomerForm from '../../components/CustomerForm/CustomerForm.jsx';
import CartItems from '../../components/CartItems/CartItems.jsx';
import CartSummary from '../../components/CartSummary/CartSummary.jsx';
import "./Explore.css";

const Explore = () => {
  const {categories} = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
 
  return (
    <div className="explore-container text-light container-fluid py-3">
      <div className="row">
        {/* Left Column */}
        <div className="col-md-8">
          <div className="left-column bg-dark border border-light rounded-3">
            <div className="first-row">
              <DisplayCategory 
                categories={categories} 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
            <hr className="horizontal-line" />

            <div className="second-row">
              <DisplayItems selectedCategory={selectedCategory} />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="right-column bg-dark border border-light rounded-3">
            {/* Customer Form */}
            <div className="p-3 border-bottom border-secondary">
             <CustomerForm />
            </div>

            {/* Cart Items */}
            <div className="flex-grow-1 p-3 overflow-auto">
              <CartItems />
            </div>

            {/* Cart Summary */}
            <div className="cart-summary-container p-3">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;