// Modal.jsx
import React from 'react';
import './Modal.css'; // Import your CSS file here

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
