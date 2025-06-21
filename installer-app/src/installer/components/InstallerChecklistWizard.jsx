import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

const inventoryList = [
  "PIR Motion Detector",
  "DHT22 Sensor",
  "Relay Block",
  "Power Supply",
];

const InstallerChecklistWizard = ({ isOpen, onClose, onSubmit, job }) => {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState({});
  const handlePhotoUpload = (stepId, file) => {
    setPhotos((prev) => ({ ...prev, [stepId]: file }));
  };

  const [customerPresent, setCustomerPresent] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");

  const salesTotals = {};
  job?.zones?.forEach((zone) => {
    zone.components?.forEach((comp) => {
      salesTotals[comp.name] = (salesTotals[comp.name] || 0) + comp.quantity;
    });
  });

  const [installCounts, setInstallCounts] = useState(() => {
    const obj = {};
    Object.keys(salesTotals).forEach((k) => {
      obj[k] = "";
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
  const [fullName, setFullName] = useState("");
  const [paymentCollected, setPaymentCollected] = useState("");
  const [confirm, setConfirm] = useState(false);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.moveTo(offsetX, offsetY);
  };
  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };
  const endDraw = () => setDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stepValid = () => {
    if (step === 0)
      return (
        customerPresent &&
        (customerPresent === "yes" || absenceReason.trim() !== "")
      );
    if (step === 1)
      return Object.entries(salesTotals).every(([name, qty]) => {
        const val = installCounts[name];
        if (val === "") return false;
        if (Number(val) > qty) return contactedIM[name];
        return true;
      });
    if (step === 2)
      return inventoryList.every((item) => materialsUsed[item] !== "");
    if (step === 3)
      return fullName.trim() !== "" && paymentCollected && confirm;
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
      photo: photos,
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

        {/* Step Content Conditional */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="font-semibold">Was the customer present?</p>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="yes"
                  checked={customerPresent === "yes"}
                  onChange={() => setCustomerPresent("yes")}
                  className="mr-1"
                />
                Yes
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="no"
                  checked={customerPresent === "no"}
                  onChange={() => setCustomerPresent("no")}
                  className="mr-1"
                />
                No
              </label>
            </div>
            {customerPresent === "no" && (
              <div>
                <label
                  className="block text-sm font-semibold"
                  htmlFor="absence"
                >
                  Reason for absence
                </label>
                <input
                  id="absence"
                  type="text"
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
                />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {Object.entries(salesTotals).map(([name, qty]) => (
              <div key={name}>
                <label
                  className="block text-sm font-semibold mb-1"
                  htmlFor={name}
                >
                  {name} Installed (sold: {qty})
                </label>
                <input
                  id={name}
                  type="number"
                  value={installCounts[name]}
                  onChange={(e) =>
                    setInstallCounts((prev) => ({
                      ...prev,
                      [name]: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
                />
                {Number(installCounts[name]) > qty && (
                  <label className="block text-xs mt-1">
                    <input
                      type="checkbox"
                      checked={contactedIM[name]}
                      onChange={(e) =>
                        setContactedIM((prev) => ({
                          ...prev,
                          [name]: e.target.checked,
                        }))
                      }
                      className="mr-1"
                    />
                    Contacted install manager about overage
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {inventoryList.map((item) => (
              <div key={item}>
                <label
                  className="block text-sm font-semibold mb-1"
                  htmlFor={item}
                >
                  {item}
                </label>
                <input
                  id={item}
                  type="number"
                  value={materialsUsed[item]}
                  onChange={(e) =>
                    setMaterialsUsed((prev) => ({
                      ...prev,
                      [item]: e.target.value,
                    }))
                  }
                  className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
                />
              </div>
            ))}
            <div>
              <label
                className="block text-sm font-semibold mb-1"
                htmlFor="step-photo"
              >
                Upload Photo
              </label>
              <input
                id="step-photo"
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(2, e.target.files?.[0])}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-semibold mb-1"
                htmlFor="name"
              >
                Your Full Name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold mb-1"
                htmlFor="payment"
              >
                Payment Collected
              </label>
              <select
                id="payment"
                value={paymentCollected}
                onChange={(e) => setPaymentCollected(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-green-200"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Customer Signature</p>
              <canvas
                ref={canvasRef}
                width={300}
                height={100}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                className="border w-full"
              />
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-gray-500 mt-1"
              >
                Clear
              </button>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="mr-2"
              />
              I confirm the job is complete
            </label>
          </div>
        )}

        {/* Update step === 2 to include step photo upload and step === 3 to remove separate photo */}
        {/* Buttons */}
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
          }),
        ),
      }),
    ),
  }),
};

export default InstallerChecklistWizard;
