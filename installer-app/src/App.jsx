import React, { Suspense } from "react";
import { GlobalLoading } from "./components/global-states";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GlobalLayout from "./components/navigation/GlobalLayout";
import { ROUTES } from "./routes";
import { AuthProvider } from "./lib/hooks/useAuth";
import { GlobalStoreProvider } from "./lib/state";
import { RequireAuth as RequireAuthOutlet } from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";

const App = () => {
  const publicRoutes = ROUTES.filter((r) => !r.roles);
  const protectedRoutes = ROUTES.filter((r) => r.roles);

  return (
    <Router>
      <AuthProvider>
        <GlobalStoreProvider>
          <Suspense fallback={<GlobalLoading />}>
            <Routes>
              {publicRoutes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
              <Route element={<RequireAuthOutlet />}>
                <Route element={<GlobalLayout />}>
                  {protectedRoutes.map(({ path, element, roles }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <RequireRole allowed={roles}>{element}</RequireRole>
                      }
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </GlobalStoreProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
