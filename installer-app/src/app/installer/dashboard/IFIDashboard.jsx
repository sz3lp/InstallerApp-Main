import React from 'react';
import { useIFIScores } from '../hooks/useInstallerData';


const IFIDashboard = () => {
  const { data, loading } = useIFIScores();

  if (loading || !data) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const {
    averageScore,
    totalSubmissions,
    belowThresholdCount,
    tableData,
  } = data;

  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Installation Friction Index (IFI) Dashboard
        </h1>
        <input
          type="text"
          placeholder="Select date range"
          className="border rounded p-2 text-sm"
        />
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Average IFI Score</p>
          <p className="text-2xl font-semibold">{averageScore}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Number of Submissions</p>
          <p className="text-2xl font-semibold">{totalSubmissions} this week</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <p className="text-sm text-gray-500">Jobs Below Threshold</p>
          <p className="text-2xl font-semibold">{belowThresholdCount} under 90</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-lg font-semibold mb-2">IFI Scores Over Time</h2>
        <div className="h-40 bg-gray-200 rounded flex items-center justify-center text-gray-500">
          Chart Placeholder
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="py-2 pr-4">Job Number</th>
              <th className="py-2 pr-4">Installer Name</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Issues</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tableData.map((row) => (
              <tr
                key={row.jobNumber}
                className={row.score < 90 ? 'bg-red-100' : ''}
              >
                <td className="py-2 pr-4 font-medium">{row.jobNumber}</td>
                <td className="py-2 pr-4">{row.installer}</td>
                <td className="py-2 pr-4">{row.score}</td>
                <td className="py-2 pr-4">{row.date}</td>
                <td className="py-2 pr-4">{row.issues}</td>
                <td className="py-2">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IFIDashboard;
