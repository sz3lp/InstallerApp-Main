; import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const inventoryList = [
  'PIR Motion Detector',
  'DHT22 Sensor',
  'Relay Block',
  'Power Supply',
];

const InstallerChecklistWizard = ({ isOpen, onClose, onSubmit, job }) => {
  const [step, setStep] = useState(0);

  const [customerPresent, setCustomerPresent] = useState('');
  const [absenceReason, setAbsenceReason] = useState('');

  const salesTotals = {};
  job?.zones?.forEach((zone) => {
    zone.components?.forEach((comp) => {
      salesTotals[comp.name] = (salesTotals[comp.name] || 0) + comp.quantity;
    });
  });

  const [installCounts, setInstallCounts] = useState(() => {
    const obj = {};
    Object.keys(salesTotals).forEach((k) => {
      obj[k] = '';
    });
    return obj;
  });
  const [contactedIM, setContactedIM] = useState(() => {
    const obj = {};
    Object.keys(salesTotals).forEach((k) => {
      obj[k] = false;
    });
    return obj;
  });

  const [materialsUsed, setMaterialsUsed] = useState(() => {
    const obj = {};
    inventoryList.forEach((item) => {
      obj[item] = 0;
    });
    return obj;
  });
  const [photo, setPhoto] = useState(null);

  const [fullName, setFullName] = useState('');
  const [paymentCollected, setPaymentCollected] = useState('');
  const [confirm, setConfirm] = useState(false);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDraw = () => {
    setDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stepValid = () => {
    if (step === 0) {
      return (
        customerPresent &&
        (customerPresent === 'yes' || absenceReason.trim() !== '')
      );
    }
    if (step === 1) {
      return Object.entries(salesTotals).every(([name, qty]) => {
        const val = installCounts[name];
        if (val === '') return false;
        if (Number(val) > qty) return contactedIM[name];
        return true;
      });
    }
    if (step === 2) {
      return inventoryList.every((item) => materialsUsed[item] !== '');
    }
    if (step === 3) {
      return fullName.trim() !== '' && paymentCollected && confirm;
    }
    return true;
  };

  const nextStep = () => {
    if (stepValid()) setStep((prev) => prev + 1);
  };

  const handleSubmit = () => {
    if (!stepValid()) return;
    onSubmit({
      customerPresent,
      absenceReason,
      installCounts,
      materialsUsed,
      photo,
      fullName,
      paymentCollected,
      signature: canvasRef.current?.toDataURL(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Installer Close-Out Checklist
        </h2>

        {step === 0 && (
          <div>
            <h3 className="font-bold mb-2">Confirm Customer Presence</h3>
            <div className="space-x-4 mb-2">
              <label>
                <input
                  type="radio"
                  name="cust"
                  value="yes"
                  checked={customerPresent === 'yes'}
                  onChange={() => setCustomerPresent('yes')}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  name="cust"
                  value="no"
                  checked={customerPresent === 'no'}
                  onChange={() => setCustomerPresent('no')}
                />
                <span className="ml-1">No</span>
              </label>
            </div>
            {customerPresent === 'no' && (
              <textarea
                className="border p-2 w-full"
                placeholder="Explain why customer is not present"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
              />
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="font-bold mb-2">Verify Sales Scope</h3>
            {Object.entries(salesTotals).map(([name, qty]) => {
              const over = Number(installCounts[name]) > qty;
              return (
                <div key={name} className="mb-4">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-gray-600 mb-1">
                    Sales Planned: {qty}
                  </p>
                  <input
                    type="number"
                    min="0"
                    className={`w-full border rounded p-2 ${over ? 'border-yellow-500' : ''}`}
                    value={installCounts[name]}
                    onChange={(e) =>
                      setInstallCounts({
                        ...installCounts,
                        [name]: e.target.value,
                      })
                    }
                  />
                  {over && (
                    <>
                      <p className="text-yellow-600 text-sm mt-1">
                        ⚠️ You have entered more than what sales scoped. Contact
                        Install Manager before proceeding.
                      </p>
                      <label className="flex items-center text-sm mt-1">
                        <input
                          type="checkbox"
                          checked={contactedIM[name]}
                          onChange={(e) =>
                            setContactedIM({
                              ...contactedIM,
                              [name]: e.target.checked,
                            })
                          }
                        />
                        <span className="ml-2">I contacted IM</span>
                      </label>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-bold mb-2">Record Materials Used</h3>
            {inventoryList.map((item) => (
              <div key={item} className="mb-2">
                <label className="block text-sm font-medium mb-1" htmlFor={item}>
                  {item}
                </label>
                <input
                  id={item}
                  type="number"
                  min="0"
                  value={materialsUsed[item]}
                  onChange={(e) =>
                    setMaterialsUsed({
                      ...materialsUsed,
                      [item]: e.target.value,
                    })
                  }
                  className="w-full border rounded p-2"
                />
              </div>
            ))}
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">
                Upload Photo (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-bold mb-2">Finalize Job</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Signature
              </label>
              <canvas
                ref={canvasRef}
                width={300}
                height={100}
                className="border w-full mb-2 touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-gray-600 mb-2"
              >
                Clear
              </button>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
            </div>
            <div className="mb-4">
              <p className="font-medium mb-1">Was payment collected?</p>
              <label className="mr-4">
                <input
                  type="radio"
                  name="payment"
                  value="yes"
                  checked={paymentCollected === 'yes'}
                  onChange={() => setPaymentCollected('yes')}
                />
                <span className="ml-1">Yes</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="no"
                  checked={paymentCollected === 'no'}
                  onChange={() => setPaymentCollected('no')}
                />
                <span className="ml-1">No</span>
              </label>
            </div>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
              />
              <span className="ml-2">
                I certify that this job was completed to the best of my ability
                and all listed items were installed or noted otherwise.
              </span>
            </label>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-gray-500"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button
              onClick={nextStep}
              disabled={!stepValid()}
              className="bg-gray-800 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!stepValid()}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Complete Installation
            </button>
          )}
          <button onClick={onClose} className="text-sm text-red-600">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

InstallerChecklistWizard.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  job: PropTypes.shape({
    zones: PropTypes.arrayOf(
      PropTypes.shape({
        components: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            quantity: PropTypes.number.isRequired,
          })
        ),
      })
    ),
  }),
};

export default InstallerChecklistWizard;
