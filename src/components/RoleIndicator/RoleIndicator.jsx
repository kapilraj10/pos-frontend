import React, { useState, useEffect } from 'react';

const RoleIndicator = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('role') || 'GUEST';
    setRole(userRole);
  }, []);

  const isAdmin = role === 'ADMIN' || role === 'admin' || role === 'ROLE_ADMIN';

  return (
    <div className={`badge ${isAdmin ? 'bg-success' : 'bg-warning text-dark'} position-fixed`} 
         style={{ top: '10px', right: '10px', zIndex: 1000, padding: '8px 12px', fontSize: '12px' }}>
      <i className={`bi ${isAdmin ? 'bi-shield-check' : 'bi-person'} me-1`}></i>
      Role: {role}
      {!isAdmin && (
        <small className="d-block mt-1" style={{ fontSize: '10px' }}>
          (ADMIN required for add/delete)
        </small>
      )}
    </div>
  );
};

export default RoleIndicator;
