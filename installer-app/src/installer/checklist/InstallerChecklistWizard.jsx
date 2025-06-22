import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import CheckInStep from "./steps/CheckInStep";
import PreexistingStep from "./steps/PreexistingStep";
import MeasurementsStep from "./steps/MeasurementsStep";
import InstallStep from "./steps/InstallStep";
import MaterialsStep from "./steps/MaterialsStep";
import SatisfactionStep from "./steps/SatisfactionStep";
import CompletionScreen from "./steps/CompletionScreen";

const InstallerChecklistWizard = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  return (
    <Routes>
      <Route index element={<Navigate to="check-in" replace />} />
      <Route
        path="check-in"
        element={
          <CheckInStep
            jobId={jobId}
            step={1}
            onNext={() => navigate("../preexisting-conditions")}
          />
        }
      />
      <Route
        path="preexisting-conditions"
        element={
          <PreexistingStep
            jobId={jobId}
            step={2}
            onNext={() => navigate("../measurements")}
            onBack={() => navigate("../check-in")}
          />
        }
      />
      <Route
        path="measurements"
        element={
          <MeasurementsStep
            jobId={jobId}
            step={3}
            onNext={() => navigate("../install")}
            onBack={() => navigate("../preexisting-conditions")}
          />
        }
      />
      <Route
        path="install"
        element={
          <InstallStep
            jobId={jobId}
            step={4}
            onNext={() => navigate("../materials")}
            onBack={() => navigate("../measurements")}
          />
        }
      />
      <Route
        path="materials"
        element={
          <MaterialsStep
            jobId={jobId}
            step={5}
            onNext={() => navigate("../customer-satisfaction")}
            onBack={() => navigate("../install")}
          />
        }
      />
      <Route
        path="customer-satisfaction"
        element={
          <SatisfactionStep
            jobId={jobId}
            step={6}
            onNext={() => navigate("../complete")}
            onBack={() => navigate("../materials")}
          />
        }
      />
      <Route path="complete" element={<CompletionScreen />} />
    </Routes>
  );
};

export default InstallerChecklistWizard;
