import React, { useState } from "react";
import { FaArrowLeft, FaFan } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerPreviewModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<0 | 1>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <button
        aria-label="Close manager preview"
        onClick={onClose}
        className="absolute top-4 left-4 text-gray-600"
      >
        <FaArrowLeft size={20} />
      </button>

      <div className="pt-12 px-4 pb-10">
        <div className="flex border-b mb-4">
          <button
            aria-label="Overview tab"
            className={`flex-1 py-2 ${
              tab === 0 ? "border-b-2 border-green-600 font-semibold" : ""
            }`}
            onClick={() => setTab(0)}
          >
            Overview
          </button>
          <button
            aria-label="Zone detail tab"
            className={`flex-1 py-2 ${
              tab === 1 ? "border-b-2 border-green-600 font-semibold" : ""
            }`}
            onClick={() => setTab(1)}
          >
            Zone Detail
          </button>
        </div>

        {tab === 0 && (
          <div className="space-y-6" aria-label="Overview panel">
            <div className="grid grid-cols-2 gap-4">
              <div
                aria-label="upcoming changes scheduled"
                className="bg-gray-100 p-4 rounded text-center"
              >
                6 upcoming changes scheduled
              </div>
              <div
                aria-label="energy savings"
                className="bg-gray-100 p-4 rounded text-center"
              >
                $23 saved this month ($724 all time)
              </div>
            </div>

            <section>
              <h2 className="text-lg font-semibold mb-2">Space Overview</h2>
              <ul className="space-y-2">
                <li
                  aria-label="Front Entry 68 degrees warning"
                  className="flex justify-between bg-white shadow p-3 rounded"
                >
                  <span>Front Entry</span>
                  <span className="text-orange-600">68° – Warning</span>
                </li>
                <li
                  aria-label="Office 1 70 degrees off"
                  className="flex justify-between bg-white shadow p-3 rounded text-gray-500"
                >
                  <span>Office 1</span>
                  <span>70° – OFF – Vacant</span>
                </li>
                <li
                  aria-label="Office 2 71 degrees off"
                  className="flex justify-between bg-white shadow p-3 rounded text-gray-500"
                >
                  <span>Office 2</span>
                  <span>71° – OFF – Vacant</span>
                </li>
                <li
                  aria-label="Office 3 76 degrees cooling"
                  className="flex justify-between bg-white shadow p-3 rounded text-blue-600"
                >
                  <span>Office 3</span>
                  <span>76° – Cooling</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Upcoming Changes</h2>
              <ul className="space-y-1">
                <li aria-label="Office 2 to Chasa H 73 degrees in 15 minutes">
                  Office 2 → Chasa H. → 73° in 15 mins
                </li>
                <li aria-label="Office 1 to June Q 70 degrees in 30 minutes">
                  Office 1 → June Q. → 70° in 30 mins
                </li>
              </ul>
            </section>
          </div>
        )}

        {tab === 1 && (
          <div className="space-y-6" aria-label="Zone detail panel">
            <div className="flex justify-center mt-4">
              <div
                aria-label="current temperature"
                className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold"
              >
                70° <FaFan className="ml-2" aria-hidden="true" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                aria-label="actions taken today"
                className="bg-gray-100 p-4 rounded text-center"
              >
                12 actions taken today
              </div>
              <div
                aria-label="savings"
                className="bg-gray-100 p-4 rounded text-center"
              >
                $23 saved this month ($724 all time)
              </div>
            </div>
            <section>
              <h2 className="text-lg font-semibold mb-2">Schedule</h2>
              <ul className="space-y-1">
                <li aria-label="10am Tina S">10:00am – Tina S.</li>
                <li aria-label="1pm Joan F">1:00pm – Joan F.</li>
                <li aria-label="4pm John C">4:00pm – John C.</li>
                <li aria-label="6pm System Off">6:00pm – System Off</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerPreviewModal;
