import React from 'react';
import PropTypes from 'prop-types';

const ActivityCard = ({ activity, onToggle }) => {
  const { id, timestamp, item, qty, reason, confirmed } = activity;
  const checkboxId = `confirm-${id}`;
  return (
    <div
      className={`bg-white rounded shadow p-4 flex items-center justify-between border-l-4 transition-colors duration-200 ${
        confirmed ? 'border-transparent' : 'border-yellow-400'
      }`}
    >
      <div className="pr-4">
        <p className="font-semibold text-lg">{item}</p>
        <p className="text-sm text-gray-600">{timestamp}</p>
        <p className="text-sm text-gray-600">
          Qty Change: {qty > 0 ? '+' : ''}
          {qty}
        </p>
        <p className="text-xs text-gray-500">Reason: {reason}</p>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id={checkboxId}
          type="checkbox"
          checked={confirmed}
          onChange={() => onToggle(id)}
          className="form-checkbox text-green-600 h-5 w-5 transition-transform duration-200 transform hover:scale-105 active:scale-95 focus:ring focus:ring-green-200"
        />
        <label htmlFor={checkboxId} className="text-sm cursor-pointer">
          Confirm
        </label>
      </div>
    </div>
  );
};

ActivityCard.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    qty: PropTypes.number.isRequired,
    reason: PropTypes.string.isRequired,
    confirmed: PropTypes.bool.isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ActivityCard;
