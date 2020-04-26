import React from "react";
import useAuth from "../../hooks/useAuth";

const Dashboard = ({ authService }) => {
  useAuth(authService.currentUser?.user?.registrationStatus, ["app"]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Work in progress</p>
    </div>
  );
};

export default Dashboard;
