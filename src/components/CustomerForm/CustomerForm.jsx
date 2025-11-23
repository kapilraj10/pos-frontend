import React from 'react'
import './CustomerForm.css'

const CustomerForm = ({customerName, setCustomerName, customerMobile, setCustomerMobile}) => {
  return (
    <div className='p-3'>
      <div className='mb-3 row align-items-center'>
        <label htmlFor='customerName' className='col-4 col-form-label'>
          Customer Name:
        </label>
        <div className='col-8'>
          <input
            type='text'
            id='customerName'
            className='form-control'
            placeholder='Enter customer name'
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      <div className='mb-3 row align-items-center'>
        <label htmlFor='customerMobile' className='col-4 col-form-label'>
          Mobile Number:
        </label>
        <div className='col-8'>
          <input
            type='text'
            id='customerMobile'
            className='form-control'
            placeholder='Enter mobile number'
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default CustomerForm
