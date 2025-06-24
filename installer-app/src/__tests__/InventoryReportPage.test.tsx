import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InventoryReportPage from "../app/inventory/InventoryReportPage";

const mockOrder = jest.fn();
const mockSelect = jest.fn(() => ({ order: mockOrder }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock("../lib/hooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ role: "Admin", loading: false }),
}));

jest.mock("../lib/supabaseClient", () => {
  return {
    __esModule: true,
    default: { from: (...args: any[]) => mockFrom(...args) },
  };
});

mockOrder.mockResolvedValue({ data: null, error: { message: "failed" } });

test("displays error message when fetch fails", async () => {
  render(
    <MemoryRouter>
      <InventoryReportPage />
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByText("failed")).toBeInTheDocument());
});
