import React, { useState } from 'react';
import { submitInstallerFeedback } from '../hooks/useInstallerData';

const issueOptions = [
  'Missing inventory',
  'Customer unavailable',
  'Hardware defect',
  'Software sync issue',
  'Other',
];

const InstallerFeedbackForm = () => {
  const [installerName, setInstallerName] = useState('');
  const [jobNumber, setJobNumber] = useState('SEA#1042');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState(0);
  const [issues, setIssues] = useState(() => issueOptions.map(() => false));
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleIssue = (index) => {
    setIssues((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const isValid = installerName.trim() && jobNumber.trim() && score >= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    const payload = {
      installerName,
      jobNumber,
      date,
      score,
      issues: issueOptions.filter((_, idx) => issues[idx]),
      notes,
    };
    submitInstallerFeedback(payload);
    setInstallerName('');
    setJobNumber('SEA#1042');
    setDate(new Date().toISOString().slice(0, 10));
    setScore(0);
    setIssues(issueOptions.map(() => false));
    setNotes('');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 max-w-md w-full space-y-4"
      >
        <h2 className="text-xl font-semibold mb-2">Installer Feedback</h2>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="installerName">
            Installer Name
          </label>
          <input
            id="installerName"
            type="text"
            value={installerName}
            onChange={(e) => setInstallerName(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="jobNumber">
            Job Number
          </label>
          <input
            id="jobNumber"
            type="text"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="score">
            Friction Score: <span className="font-semibold">{score}</span>
          </label>
          <input
            id="score"
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            className="w-full"
            required
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium mb-1">Issues Encountered</legend>
          <div className="space-y-1">
            {issueOptions.map((option, idx) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={issues[idx]}
                  onChange={() => toggleIssue(idx)}
                  className="form-checkbox text-green-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-green-600 text-white py-2 rounded hover:opacity-90 active:scale-95 disabled:opacity-50 transition"
        >
          Submit Feedback
        </button>
        {submitted && (
          <p className="text-green-600 font-semibold text-center mt-2">Thank you!</p>
        )}
      </form>
    </div>
  );
};

export default InstallerFeedbackForm;
