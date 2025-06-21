import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaRegCircle,
} from 'react-icons/fa';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/hooks/useAuth';
import Header from '../components/Header';
import SideDrawer from '../components/SideDrawer';
import { useAppointments } from '../hooks/useInstallerData';

const AppointmentSummaryPage = ({ jobs }) => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const { session, isAuthorized, loading: authLoading } = useAuth();

  const { appointments, loading, error } = useAppointments();
  const data = jobs || appointments;

  if (authLoading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized('Installer')) return <Navigate to="/unauthorized" replace />;

  const handleDrawerOpen = () => setShowDrawer(true);
  const handleDrawerClose = () => setShowDrawer(false);
  const handleInfoOpen = () => setShowInfo(true);
  const handleInfoClose = () => setShowInfo(false);
  const openAppointment = (id) => navigate(`/job/${id}`);

  const computeStatus = (job) => {
    if (job.signatureCaptured && job.checklistStatus === 'complete') {
      return 'complete';
    }
    const today = new Date().toISOString().slice(0, 10);
    if (job.dueDate < today) {
      return 'pastDue';
    }
    return job.checklistStatus;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'complete':
        return {
          bg: 'bg-green-100',
          badge: 'bg-green-600 text-white',
          icon: <FaCheckCircle />,
        };
      case 'pastDue':
        return {
          bg: 'bg-red-100',
          badge: 'bg-red-600 text-white',
          icon: <FaTimesCircle />,
        };
      default:
        return {
          bg: 'bg-gray-100',
          badge: 'bg-gray-400 text-white',
          icon: <FaRegCircle />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={handleDrawerClose} />

      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-md w-full relative">
            <button
              aria-label="Close"
              className="absolute top-2 right-2 text-gray-600"
              onClick={handleInfoClose}
            >
              <FaTimes />
            </button>
            <div className="space-y-2 text-gray-800">
              <p>
                The appointment summary screen lists all appointments that have been
                assigned to you within the previous week. You can tap on an appointment
                in the list to view its details, such as labor information and directions
                to the customer's location.
              </p>
              <p>Appointment Status Key:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="text-green-600">&#x2705;</span> Green Highlight = Completed
                </li>
                <li>
                  <span className="text-red-600">&#x274C;</span> Red Highlight = Past Due
                </li>
                <li>
                  <span className="text-gray-600">&#x2B55;</span> No Highlight = Open
                </li>
              </ul>
            </div>
            <div className="text-right mt-4">
              <button
                onClick={handleInfoClose}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        title="SentientZone"
        onMenuClick={handleDrawerOpen}
        rightIcon={<FaInfoCircle className="text-green-500" />}
        onRightIconClick={handleInfoOpen}
      />

      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Appointment Summary</h1>
        <div className="space-y-4">
          {loading && !jobs ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            data.map((job) => {
              const status = computeStatus(job);
              const { bg, icon, badge } = getStatusStyles(status);
              return (
                <button
                  key={job.jobNumber}
                  onClick={() => openAppointment(job.jobNumber)}
                  className={`${bg} w-full p-4 rounded shadow relative text-left`}
                >
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-semibold ${badge}`}
                    aria-label={status}
                  >
                    {icon}
                  </span>
                  <p className="font-semibold">{job.clientName}</p>
                  <p className="text-sm text-gray-600">{job.jobNumber}</p>
                </button>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

AppointmentSummaryPage.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      jobNumber: PropTypes.string.isRequired,
      clientName: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
      checklistStatus: PropTypes.string.isRequired,
      signatureCaptured: PropTypes.bool.isRequired,
    })
  ),
};

export default AppointmentSummaryPage;
