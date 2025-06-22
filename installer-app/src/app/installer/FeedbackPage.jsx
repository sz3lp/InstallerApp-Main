import React, { useState } from 'react';
import Header from './components/Header';
import SideDrawer from './components/SideDrawer';
import InstallerFeedbackForm from './components/InstallerFeedbackForm';

const FeedbackPage = () => {
  const [showDrawer, setShowDrawer] = useState(false);

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
