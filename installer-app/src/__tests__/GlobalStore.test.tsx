import React from "react";
import { renderHook, act } from "@testing-library/react";
import { GlobalStoreProvider, useStore } from "../lib/state";

test("updates state via store action", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GlobalStoreProvider>{children}</GlobalStoreProvider>
  );
  const { result } = renderHook(() => useStore((s) => [s.role, s.setRole]), {
    wrapper,
  });
  act(() => {
    result.current[1]("Admin");
  });
  expect(result.current[0]).toBe("Admin");
});
