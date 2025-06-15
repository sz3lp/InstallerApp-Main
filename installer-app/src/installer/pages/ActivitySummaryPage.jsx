import React, { useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideDrawer from '../components/SideDrawer';

const ActivitySummaryPage = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  const withdrawals = [
    {
      id: 'w1',
      date: '2025-06-15',
      items: [
        { name: 'PIR Sensor', quantity: 2 },
        { name: 'Relay Block', quantity: 1 },
      ],
    },
  ];

  const navigate = useNavigate();
  const handleDrawerOpen = () => setShowDrawer(true);
  const handleDrawerClose = () => setShowDrawer(false);
  const handleRefresh = () => navigate(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative">
      <SideDrawer isOpen={showDrawer} onClose={handleDrawerClose} />

      <Header
        title="SentientZone"
        onMenuClick={handleDrawerOpen}
        rightIcon={<FaSyncAlt />}
        onRightIconClick={handleRefresh}
      />

      <main className="flex-grow p-4 space-y-4">
        <h2 className="text-center text-gray-700">
          It is your responsibility to make sure your inventory is accurate.
        </h2>
        <h1 className="text-2xl font-bold text-center">Activity Summary</h1>
        <div className="space-y-4">
          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="border border-gray-300 rounded-md bg-white p-4 shadow-sm"
              >
                <h3 className="text-md font-semibold">
                  Withdrawal – {new Date(withdrawal.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                  {withdrawal.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No withdrawals recorded yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivitySummaryPage;
