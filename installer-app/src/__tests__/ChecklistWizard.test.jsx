import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import InstallerChecklistWizard from "../installer/checklist/InstallerChecklistWizard";
import { render, screen } from "@testing-library/react";

test("renders check-in step", () => {
  render(
    <MemoryRouter initialEntries={["/job/1/checklist"]}>
      <Routes>
        <Route
          path="/job/:jobId/checklist/*"
          element={<InstallerChecklistWizard />}
        />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText(/Check-In/i)).toBeInTheDocument();
});
