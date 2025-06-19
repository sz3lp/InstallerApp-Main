import React from 'react';
import ModalWrapper from './ModalWrapper';

export interface Stat {
  label: string;
  value: string | number;
}

export interface Zone {
  id: string | number;
  name: string;
  temp: string;
  hvac: string;
  occupancy: string;
  warning?: boolean;
}

export interface UpcomingChange {
  id: string | number;
  zone: string;
  user: string;
  setpoint: string;
  time: string;
}

interface ManagerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleBack?: () => void;
  stats: Stat[];
  zones: Zone[];
  upcoming: UpcomingChange[];
}

const ManagerPreviewModal: React.FC<ManagerPreviewModalProps> = ({
  isOpen,
  onClose,
  handleBack,
  stats,
  zones,
  upcoming,
}) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-[90vh] w-screen max-w-md">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <button
            className="text-blue-500 font-medium min-h-[44px]"
            onClick={handleBack}
          >
            ← Back
          </button>
          <div className="text-sm text-gray-700 font-semibold">Overview</div>
          <div className="w-10" />
        </div>

        <div className="overflow-y-scroll h-full pb-10 px-4 space-y-6">
          <section>
            <h3 className="text-gray-500 uppercase text-xs tracking-wide pb-1">
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[44px]"
                >
                  <p className="font-semibold text-lg">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-gray-500 uppercase text-xs tracking-wide pb-1">
              Space Overview
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between rounded-lg px-4 py-2 min-h-[44px] ${zone.warning ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'}`}
                >
                  <span className="text-gray-700">{zone.name}</span>
                  <span className="text-sm text-gray-500">
                    {zone.temp} – {zone.hvac} – {zone.occupancy}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-gray-500 uppercase text-xs tracking-wide pb-1">
              Upcoming Changes
            </h3>
            <div className="space-y-1">
              {upcoming.map((u) => (
                <div
                  key={u.id}
                  className="text-sm text-gray-700 min-h-[44px] flex items-center"
                >
                  {u.zone} → {u.user} → {u.setpoint} {u.time}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ManagerPreviewModal;
