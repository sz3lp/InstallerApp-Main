import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => (
  <div className="p-4 text-center">
    <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
    <p className="mb-4">You do not have permission to view this page.</p>
    <Link to="/login" className="text-blue-500 underline">
      Go to Login
    </Link>
  </div>
);

export default Unauthorized;
