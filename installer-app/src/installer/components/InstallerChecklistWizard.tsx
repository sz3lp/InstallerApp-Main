import React, { useState, useRef } from "react";
import { SZModal } from "../../components/ui/SZModal";
import { SZInput } from "../../components/ui/SZInput";
import { SZCheckbox } from "../../components/ui/SZCheckbox";
import { SZButton } from "../../components/ui/SZButton";

export type JobComponent = {
  name: string;
  quantity: number;
};

export type Job = {
  zones?: { components?: JobComponent[] }[];
};

export type ChecklistPayload = {
  customerPresent: string;
  absenceReason: string;
  installCounts: Record<string, string>;
  contactedManager: Record<string, boolean>;
  materialsUsed: Record<string, string>;
  photos: Record<number, File[]>;
  paymentCollected: string;
  fullName: string;
  signatureData: string;
};

export type InstallerChecklistWizardProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChecklistPayload) => void | Promise<void>;
  job?: Job | null;
};

const inventoryList = [
  "PIR Motion Detector",
  "DHT22 Sensor",
  "Relay Block",
  "Power Supply",
];

const InstallerChecklistWizard: React.FC<InstallerChecklistWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  job,
}) => {
  const [step, setStep] = useState(0);

  const [customerPresent, setCustomerPresent] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");

  const salesTotals: Record<string, number> = {};
  job?.zones?.forEach((z) => {
    z.components?.forEach((c) => {
      salesTotals[c.name] = (salesTotals[c.name] || 0) + c.quantity;
    });
  });

  const [installCounts, setInstallCounts] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    Object.keys(salesTotals).forEach((k) => {
      obj[k] = "";
    });
    return obj;
  });

  const [contactedManager, setContactedManager] = useState<Record<string, boolean>>(() => {
    const obj: Record<string, boolean> = {};
    Object.keys(salesTotals).forEach((k) => {
      obj[k] = false;
    });
    return obj;
  });

  const [materialsUsed, setMaterialsUsed] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    inventoryList.forEach((i) => {
      obj[i] = "";
    });
    return obj;
  });

  const [photos, setPhotos] = useState<Record<number, File[]>>({});
  const handlePhotoChange = (files: FileList | null) => {
    if (!files) return;
    setPhotos((p) => ({ ...p, 2: Array.from(files) }));
  };

  const [fullName, setFullName] = useState("");
  const [paymentCollected, setPaymentCollected] = useState("");
  const [confirm, setConfirm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stepValid = () => {
    if (step === 0) {
      return (
        customerPresent === "yes" ||
        (customerPresent === "no" && absenceReason.trim() !== "")
      );
    }
    if (step === 1) {
      return Object.entries(salesTotals).every(([n, qty]) => {
        const val = installCounts[n];
        if (val === "") return false;
        if (Number(val) > qty) return contactedManager[n];
        return true;
      });
    }
    if (step === 2) {
      return inventoryList.every((i) => materialsUsed[i] !== "");
    }
    if (step === 3) {
      return fullName.trim() !== "" && paymentCollected !== "" && confirm;
    }
    return true;
  };

  const nextStep = () => {
    if (stepValid()) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = () => {
    if (!stepValid()) return;
    const payload: ChecklistPayload = {
      customerPresent,
      absenceReason,
      installCounts,
      contactedManager,
      materialsUsed,
      photos,
      paymentCollected,
      fullName,
      signatureData: canvasRef.current?.toDataURL() || "",
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  const stepTitle = [
    "Customer Presence",
    "Installed Quantities",
    "Materials Used",
    "Final Sign-off",
  ][step];

  return (
    <SZModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Step ${step + 1} of 4: ${stepTitle}`}
      className="max-w-xl"
    >
      {step === 0 && (
        <div className="space-y-4">
          <p className="font-medium">Was the customer present?</p>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="customerPresent"
                value="yes"
                checked={customerPresent === "yes"}
                onChange={() => setCustomerPresent("yes")}
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="radio"
                name="customerPresent"
                value="no"
                checked={customerPresent === "no"}
                onChange={() => setCustomerPresent("no")}
              />
              <span>No</span>
            </label>
          </div>
          {customerPresent === "no" && (
            <SZInput
              id="absenceReason"
              label="Reason for absence"
              value={absenceReason}
              onChange={setAbsenceReason}
            />
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {Object.entries(salesTotals).map(([name, qty]) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium">
                {name} (sold {qty})
              </label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={installCounts[name]}
                onChange={(e) =>
                  setInstallCounts((c) => ({ ...c, [name]: e.target.value }))
                }
              />
              {Number(installCounts[name]) > qty && (
                <SZCheckbox
                  id={`confirm-${name}`}
                  label="Confirmed with manager"
                  checked={contactedManager[name]}
                  onChange={(v) =>
                    setContactedManager((c) => ({ ...c, [name]: v }))
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {inventoryList.map((item) => (
            <div key={item} className="space-y-1">
              <label className="block text-sm font-medium">{item}</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1"
                value={materialsUsed[item]}
                onChange={(e) =>
                  setMaterialsUsed((m) => ({ ...m, [item]: e.target.value }))
                }
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium" htmlFor="photo-upload">
              Upload Photos
            </label>
            <input
              id="photo-upload"
              type="file"
              multiple
              onChange={(e) => handlePhotoChange(e.target.files)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <SZInput id="fullName" label="Full Name" value={fullName} onChange={setFullName} />
          <SZInput
            id="payment"
            label="Payment Collected"
            value={paymentCollected}
            onChange={setPaymentCollected}
          />
          <SZCheckbox
            id="confirm"
            label="I confirm all data is accurate"
            checked={confirm}
            onChange={setConfirm}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Signature</label>
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              className="border w-full h-36"
            />
            <SZButton
              variant="secondary"
              size="sm"
              onClick={clearSignature}
              className="mt-2"
            >
              Clear
            </SZButton>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {step > 0 ? (
          <SZButton variant="secondary" onClick={prevStep}>
            Back
          </SZButton>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <SZButton onClick={nextStep} disabled={!stepValid()}>
            Next
          </SZButton>
        ) : (
          <SZButton onClick={handleSubmit} disabled={!stepValid()}>
            Complete Installation
          </SZButton>
        )}
        <SZButton variant="destructive" onClick={onClose}>
          Cancel
        </SZButton>
      </div>
    </SZModal>
  );
};

export default InstallerChecklistWizard;
