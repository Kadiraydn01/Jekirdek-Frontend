import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return Component;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
