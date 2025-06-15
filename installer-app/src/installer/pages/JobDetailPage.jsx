import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import InstallerChecklistWizard from '../components/InstallerChecklistWizard';

import DocumentViewerModal from '../components/DocumentViewerModal';
import Header from '../components/Header';
import SideDrawer from '../components/SideDrawer';

const JobDetailPage = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { jobId } = useParams();
  const [showWizard, setShowWizard] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [checklistResults, setChecklistResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const installerId = 'user_345';

  // Mock job data using the route param for id
  const job = {
    id: jobId,
    jobNumber: jobId?.replace(/[^0-9]/g, ''),
    clientName: 'Sarah Lee',
    installDate: '2025-06-18',
    location: '1234 Solar Lane, Phoenix, AZ',
    installer: 'Connor Preble',
    zones: [
      {
        zoneName: 'Zone 1 – Admin',
        systemType: 'HVAC Retrofit',
        components: [
          { name: 'Panel', quantity: 6 },
          { name: 'Sensor', quantity: 2 },
        ],
      },
      {
        zoneName: 'Zone 2 – Gym',
        systemType: 'HVAC Retrofit',
        components: [
          { name: 'Panel', quantity: 6 },
          { name: 'Sensor', quantity: 2 },
        ],
      },
    ],
  };

  const componentMap = new Map();
  job.zones?.forEach((zone) => {
    zone.components.forEach((comp) => {
      const key = comp.name;
      const qty = componentMap.get(key) ?? 0;
      componentMap.set(key, qty + comp.quantity);
    });
  });

  const rateMap = {
    Controller: 50,
    'PIR Sensor': 25,
    'DHT22 Sensor': 20,
    'Relay Block': 30,
  };

  const payMap = new Map();
  job.zones?.forEach((zone) => {
    zone.components.forEach((comp) => {
      if (comp.reusable) return;
      const qty = payMap.get(comp.name) ?? 0;
      payMap.set(comp.name, qty + comp.quantity);
    });
  });

  const calculatedLineItems = [...payMap.entries()].map(([name, quantity]) => {
    const rate = rateMap[name] ?? 0;
    return {
      name,
      quantity,
      rate,
      total: quantity * rate,
    };
  });

  const totalPay = calculatedLineItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  const handleDrawerOpen = () => setShowDrawer(true);
  const handleDrawerClose = () => setShowDrawer(false);
  const handleChecklistOpen = () => {
    setStartTime(new Date());
    setShowWizard(true);
  };
  const handleWizardSubmit = (results) => {
    setChecklistResults(results);
    setEndTime(new Date());
    setShowWizard(false);
  };
  const handleSubmitChecklist = () => {
    if (!checklistResults) return;
    setSubmitLoading(true);
    setSubmitMessage('');
    fetch(`/api/jobs/${jobId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId,
        installerId,
        checklistResults,
        startTime: startTime?.toISOString(),
        endTime: endTime?.toISOString(),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Request failed');
        }
        setSubmitMessage('Checklist submitted successfully');
      })
      .catch(() => {
        setSubmitMessage('Failed to submit checklist');
      })
      .finally(() => setSubmitLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={handleDrawerClose} />

      <InstallerChecklistWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleWizardSubmit}
        job={job}
      />

      <DocumentViewerModal
        isOpen={showDocuments}
        onClose={() => setShowDocuments(false)}
        documents={[
          {
            id: 1,
            name: 'permit.pdf',
            type: 'pdf',
            url: '#',
          },
          {
            id: 2,
            name: 'blueprints.pdf',
            type: 'pdf',
            url: '#',
          },
          {
            id: 3,
            name: 'site-photo.jpg',
            type: 'image',
            url: '#',
          },
        ]}
      />

      <Header
        title={`SEA#${job.jobNumber ?? job.id}`}
        onMenuClick={handleDrawerOpen}
      />

      <main className="flex-grow p-4 relative">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {job.clientName}
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-semibold">Install Date</p>
            <p>{job.installDate}</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>{job.location}</p>
          </div>
          <div>
            <p className="font-semibold">Installer</p>
            <p>{job.installer}</p>
          </div>
          <div>
            <p className="font-semibold">System Type</p>
            {job.zones?.length ? (
              <div className="space-y-1">
                {job.zones.map((zone, idx) => (
                  <p key={idx}>
                    <strong>{zone.zoneName}:</strong> {zone.systemType}
                  </p>
                ))}
              </div>
            ) : (
              <p>System Type: Unassigned</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Job Summary</h2>
          <ul className="list-disc pl-5">
            {[...componentMap.entries()].map(([name, qty]) => (
              <li key={name}>
                {qty}x {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Labor Bill</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {calculatedLineItems.map((item) => (
              <li key={item.name}>
                {item.quantity}x {item.name} @ ${item.rate} = ${item.total}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-bold text-md">
            Total Installer Pay: ${totalPay}
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-lg font-semibold">Install Scope</h2>
          <ul className="list-disc pl-5">
            {[...componentMap.entries()].map(([name, qty]) => (
              <li key={name}>
                {qty}x {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-4 right-4 space-x-2">
          <button
            onClick={handleChecklistOpen}
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
          >
            Checklist
          </button>
          <button
            onClick={() => setShowDocuments(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90 active:scale-95"
          >
            Documents
          </button>
          <button
            onClick={handleSubmitChecklist}
            disabled={submitLoading || !checklistResults}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:opacity-90 active:scale-95"
          >
            {submitLoading ? 'Submitting...' : 'Submit Checklist'}
          </button>
        </div>
        {submitMessage && (
          <p className="absolute bottom-2 left-4 text-sm">
            {submitMessage}
          </p>
        )}
      </main>
    </div>
  );
};

export default JobDetailPage;
