import React, { useState } from 'react';
import Header from '../components/Header';
import SideDrawer from '../components/SideDrawer';
import InstallerFeedbackForm from '../components/InstallerFeedbackForm';
import { useAuth } from '../../lib/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const FeedbackPage = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { session, isAuthorized, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (!isAuthorized('Installer')) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
      <Header
        title="Installer Feedback"
        onMenuClick={() => setShowDrawer(true)}
      />
      <main className="flex-grow p-4">
        <InstallerFeedbackForm />
      </main>
    </div>
  );
};

export default FeedbackPage;
