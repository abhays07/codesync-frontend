import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import StickyNavbar from "./components/layout/StickyNavbar";
import AuthPage from "./features/auth/AuthPage";
import HomePage from "./features/home/HomePage";
import ProjectDashboard from "./features/projects/ProjectDashboard";
import OAuthCallback from "./features/auth/OAuthCallback";
import ProfileSettings from "./features/profile/ProfileSettings";

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <StickyNavbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/oauth-success" element={<OAuthCallback />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #535C91",
            background: "#1B1A55",
            color: "#E8E8FF",
          },
        }}
        containerStyle={{ zIndex: 70 }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}
