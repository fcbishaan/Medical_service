import React from "react";
import PendingRequests from "./PendingRequests";

const AdminDashboard = () =>{
    return (
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1> 
        <PendingRequests/>
        </div>
    );
} ;

export default AdminDashboard;