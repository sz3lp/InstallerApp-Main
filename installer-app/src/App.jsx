import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GlobalLayout from "./components/navigation/GlobalLayout";
import { ROUTES } from "./routes";
import { AuthProvider } from "./lib/hooks/useAuth";
import { RequireAuth as RequireAuthOutlet } from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";

const App = () => {
  const publicRoutes = ROUTES.filter((r) => !r.role);
  const protectedRoutes = ROUTES.filter((r) => r.role);

  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {publicRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            <Route element={<RequireAuthOutlet />}>
              <Route element={<GlobalLayout />}>
                {protectedRoutes.map(({ path, element, role }) => {
                  const allowed = Array.isArray(role) ? role : [role];
                  return (
                    <Route
                      key={path}
                      path={path}
                      element={<RequireRole allowed={allowed}>{element}</RequireRole>}
                    />
                  );
                })}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
