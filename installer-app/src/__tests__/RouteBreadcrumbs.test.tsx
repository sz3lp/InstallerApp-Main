import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RouteBreadcrumbs from "../components/navigation/RouteBreadcrumbs";

// Test that breadcrumb labels come from routes config

test("renders labels for current route", () => {
  render(
    <MemoryRouter initialEntries={["/install-manager/calendar"]}>
      <RouteBreadcrumbs />
    </MemoryRouter>,
  );

  // Link for intermediate segment
  const link = screen.getByText("Install Manager Dashboard");
  expect(link.closest("a")).toHaveAttribute("href", "/install-manager");

  // Last segment should not be a link
  const last = screen.getByText("Schedule Calendar");
  expect(last.closest("a")).toBeNull();
});
