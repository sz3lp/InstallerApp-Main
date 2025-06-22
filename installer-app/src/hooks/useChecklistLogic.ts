import React from "react";
import Step1 from "../app/installer/checklist/steps/Step1_CheckIn";
import Step2 from "../app/installer/checklist/steps/Step2_PreExisting";
import Step3 from "../app/installer/checklist/steps/Step3_Measurements";
import Step4 from "../app/installer/checklist/steps/Step4_Install";
import Step5 from "../app/installer/checklist/steps/Step5_Materials";
import Step6 from "../app/installer/checklist/steps/Step6_Satisfaction";

export interface ChecklistStep {
  step: number;
  component: React.ReactElement;
}

export function useChecklistLogic(job: any): ChecklistStep[] {
  return [
    { step: 1, component: <Step1 job={job} /> },
    { step: 2, component: <Step2 job={job} /> },
    { step: 3, component: <Step3 job={job} /> },
    { step: 4, component: <Step4 job={job} /> },
    { step: 5, component: <Step5 job={job} /> },
    { step: 6, component: <Step6 job={job} /> },
  ];
}
