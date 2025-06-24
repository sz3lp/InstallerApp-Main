import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import crypto from "crypto";
import { TextEncoder } from "util";
import ICSLink from "../components/calendar/ICSLink";

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", {
    value: crypto.webcrypto,
  });
  (global as any).TextEncoder = TextEncoder;
});

test("generates download button", async () => {
  process.env.VITE_CALENDAR_TOKEN_SECRET = "secret";
  render(<ICSLink installerId="abc" />);
  const btn = await screen.findByRole("button");
  await waitFor(() => expect(btn).not.toBeDisabled());
});
