import { ReactNode, createContext, useContext, useRef } from "react";
import { createStore, StoreApi, useStore as useZustandStore } from "zustand";
import { persist } from "zustand/middleware";

interface AuthSlice {
  session: any | null;
  user: any | null;
  role: string | null;
  setSession: (session: any | null) => void;
  setUser: (user: any | null) => void;
  setRole: (role: string | null) => void;
}

interface UiSlice {
  modals: Record<string, boolean>;
  breadcrumbs: string[];
  loading: boolean;
  showModal: (key: string, value: boolean) => void;
  setBreadcrumbs: (crumbs: string[]) => void;
  setLoading: (flag: boolean) => void;
}

interface JobSlice {
  currentJobId: string | null;
  jobCache: Record<string, any>;
  setCurrentJob: (id: string | null) => void;
  cacheJob: (id: string, data: any) => void;
}

export type GlobalState = AuthSlice & UiSlice & JobSlice;

const createAuthSlice = (
  set: StoreApi<GlobalState>["setState"],
): AuthSlice => ({
  session: null,
  user: null,
  role: null,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
});

const createUiSlice = (
  set: StoreApi<GlobalState>["setState"],
  get: StoreApi<GlobalState>["getState"],
): UiSlice => ({
  modals: {},
  breadcrumbs: [],
  loading: false,
  showModal: (key, value) => set({ modals: { ...get().modals, [key]: value } }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
  setLoading: (flag) => set({ loading: flag }),
});

const createJobSlice = (
  set: StoreApi<GlobalState>["setState"],
  get: StoreApi<GlobalState>["getState"],
): JobSlice => ({
  currentJobId: null,
  jobCache: {},
  setCurrentJob: (id) => set({ currentJobId: id }),
  cacheJob: (id, data) => set({ jobCache: { ...get().jobCache, [id]: data } }),
});

const StoreContext = createContext<StoreApi<GlobalState> | null>(null);

export function GlobalStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<GlobalState>>();
  if (!storeRef.current) {
    storeRef.current = createStore<GlobalState>(
      persist(
        (set, get) => ({
          ...createAuthSlice(set),
          ...createUiSlice(set, get),
          ...createJobSlice(set, get),
        }),
        { name: "global-store" },
      ),
    );
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore<T>(selector: (state: GlobalState) => T): T {
  const store = useContext(StoreContext);
  if (!store)
    throw new Error("useStore must be used within GlobalStoreProvider");
  return useZustandStore(store, selector);
}
