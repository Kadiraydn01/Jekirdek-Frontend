import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element: Component }) => {
  const token = localStorage.getItem("token");

  return token ? Component : <Navigate to="/" />;
};

export default PrivateRoute;
