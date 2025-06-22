import React, { useState } from 'react';
import PropTypes from 'prop-types';

const materialKeys = [
  'nodeDevices',
  'hubUnits',
  'wireFt',
  'poeKits',
  'mountingKits',
  'qrTags',
  'spareNodes',
];

function getStatus(type, installed, quoted) {
  if (installed === '') return null;
  const val = Number(installed);
  const quote = Number(quoted);
  if (type === 'wireFt') {
    if (val < quote) return 'under';
    if (val > quote * 1.1) return 'over';
    return 'match';
  }
  if (val < quote) return 'under';
  if (val > quote) return 'over';
  return 'match';
}

function statusMessage(type, status, installed) {
  if (!status) return '';
  if (type === 'spareNodes' && Number(installed) > 0) {
    return 'Explain usage below.';
  }
  if (status === 'over') return 'Over — call manager before proceeding.';
  if (status === 'under') return 'Missing required install — explain below.';
  if (status === 'match') return '✓ Matched expected quantity.';
  return '';
}

const statusStyles = {
  over: 'text-yellow-600',
  under: 'text-red-600',
  match: 'text-green-600',
};

const InstallVerificationStep = ({ salesOrder, onBack, onComplete }) => {
  const { zoneCount, materials } = salesOrder;
  const [installed, setInstalled] = useState(() => {
    const obj = {};
    materialKeys.forEach((k) => {
      obj[k] = '';
    });
    return obj;
  });
  const [notes, setNotes] = useState(() => {
    const obj = {};
    materialKeys.forEach((k) => {
      obj[k] = '';
    });
    return obj;
  });
  const [zonesInstalled, setZonesInstalled] = useState('');

  const handleChange = (key, value) => {
    setInstalled((prev) => ({ ...prev, [key]: value }));
  };

  const handleNoteChange = (key, value) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (Number(zonesInstalled) !== zoneCount) return false;
    return materialKeys.every((k) => installed[k] !== '');
  };

  const handleSubmit = () => {
    if (!canProceed()) return;
    const payload = { ...installed, notes };
    onComplete(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1" htmlFor="zones">
          Zones Installed
        </label>
        <input
          id="zones"
          type="number"
          value={zonesInstalled}
          onChange={(e) => setZonesInstalled(e.target.value)}
          className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
        />
        {zonesInstalled !== '' && (
          <p
            className={`text-sm font-medium ${
              Number(zonesInstalled) === zoneCount
                ? 'text-green-600'
                : Number(zonesInstalled) > zoneCount
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {Number(zonesInstalled) === zoneCount && '✓ Matched expected quantity.'}
            {Number(zonesInstalled) > zoneCount &&
              'Over — call manager before proceeding.'}
            {Number(zonesInstalled) < zoneCount &&
              'Missing required install — explain below.'}
          </p>
        )}
      </div>
      {materialKeys.map((key) => {
        const status = getStatus(key, installed[key], materials[key]);
        const showNotes =
          status === 'under' || status === 'over' || (key === 'spareNodes' && Number(installed[key]) > 0);
        return (
          <div key={key}>
            <label className="block text-sm font-semibold mb-1" htmlFor={key}>
              {key}
            </label>
            <input
              id={key}
              type="number"
              value={installed[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
            />
            {status && (
              <p className={`text-sm font-medium ${statusStyles[status]}`}>{statusMessage(key, status, installed[key])}</p>
            )}
            {showNotes && (
              <textarea
                value={notes[key]}
                onChange={(e) => handleNoteChange(key, e.target.value)}
                rows="2"
                className="w-full border rounded p-2 mt-1 focus:outline-none focus:ring focus:ring-green-200"
              />
            )}
          </div>
        );
      })}
      <div className="flex justify-between pt-2">
        {onBack && (
          <button type="button" onClick={onBack} className="px-4 py-2 rounded bg-gray-200">
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canProceed()}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

InstallVerificationStep.propTypes = {
  salesOrder: PropTypes.shape({
    zoneCount: PropTypes.number.isRequired,
    materials: PropTypes.shape({
      nodeDevices: PropTypes.number.isRequired,
      hubUnits: PropTypes.number.isRequired,
      wireFt: PropTypes.number.isRequired,
      poeKits: PropTypes.number.isRequired,
      mountingKits: PropTypes.number.isRequired,
      qrTags: PropTypes.number.isRequired,
      spareNodes: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  onBack: PropTypes.func,
  onComplete: PropTypes.func.isRequired,
};

export default InstallVerificationStep;
