// utils/logout.js
export const adminLogout = () => {
 
    localStorage.removeItem('adminToken');
    
    localStorage.removeItem('adminData');
  };
  