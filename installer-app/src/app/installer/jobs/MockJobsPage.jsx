import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const jobs = ['SEA1001', 'SEA1002', 'SEA1003', 'SEA1004', 'SEA1024'];

const MockJobsPage = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    <Header title="Mock Jobs" />
    <main className="flex-grow p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Select a Job</h1>
      <ul className="space-y-2 max-w-sm mx-auto">
        {jobs.map((job) => (
          <li key={job}>
            <Link
              to={`/job/${job}`}
              className="block bg-white rounded shadow px-4 py-2 text-green-600 hover:bg-gray-50 text-center"
            >
              {job}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  </div>
);

export default MockJobsPage;
