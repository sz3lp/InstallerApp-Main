import React from 'react';

const Unauthorized: React.FC = () => (
  <div className="p-4 text-center">
    <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
    <p className="text-gray-600">You do not have access to this page.</p>
  </div>
);

export default Unauthorized;
