import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InventoryAlertsPage from "../app/manager/InventoryAlertsPage";

jest.mock("../lib/hooks/useInventoryLevels", () => ({
  __esModule: true,
  default: () => ({
    alerts: [],
    loading: false,
    error: "Failed to load",
    fetchAlerts: jest.fn(),
    markResolved: jest.fn(),
  }),
}));

test("displays error message when inventory hook fails", () => {
  render(
    <MemoryRouter>
      <InventoryAlertsPage />
    </MemoryRouter>,
  );
  expect(screen.getByText("Failed to load")).toBeInTheDocument();
});
