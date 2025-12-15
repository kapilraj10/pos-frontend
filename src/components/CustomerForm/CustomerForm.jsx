// Updated CustomerForm.jsx
import React from 'react'
import './CustomerForm.css'

const CustomerForm = ({customerName, setCustomerName, customerMobile, setCustomerMobile}) => {
  return (
    <div className='customer-form-container'>
      <h3>Customer Information</h3>
      
      <div className='customer-form-row'>
        <label htmlFor='customerName' className='customer-form-label'>
          Customer Name:
        </label>
        <div className='customer-form-input-container'>
          <input
            type='text'
            id='customerName'
            className='customer-form-input'
            placeholder='Enter customer name'
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      <div className='customer-form-row'>
        <label htmlFor='customerMobile' className='customer-form-label'>
          Mobile Number:
        </label>
        <div className='customer-form-input-container'>
          <input
            type='tel'
            id='customerMobile'
            className='customer-form-input'
            placeholder='98XXXXXXXX'
            pattern='[0-9]{10}'
            maxLength={10}
            value={customerMobile}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, '');
              setCustomerMobile(value);
            }}
          />
          <small className='customer-form-hint'>10-digit Nepal mobile number</small>
        </div>
      </div>
    </div>
  )
}

export default CustomerForm