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
import EditorPage from "./pages/EditorPage"; // New Editor Page
import Subscribe from "./pages/Subscribe";
import { NotificationProvider } from "./context/NotificationContext";
import SubscriptionGuard from "./components/SubscriptionGuard";

function AppRoutes() {
  const location = useLocation();

  // Logic: Hide global navbar if user is in the editor to maximize space
  const isEditor = location.pathname.startsWith("/editor/");

  return (
    <>
      {/* Show Navbar only when NOT in the editor */}
      {!isEditor && <StickyNavbar />}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: isEditor ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isEditor ? 0 : -8 }}
          transition={{ duration: 0.2 }}
          // Ensure the container fills the screen if in editor mode
          className={isEditor ? "h-screen" : ""}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/oauth-success" element={<OAuthCallback />} />

            {/* NEW: Subscribe Route */}
            <Route
              path="/subscribe"
              element={
                <ProtectedRoute>
                  <Subscribe />
                </ProtectedRoute>
              }
            />

            {/* Private Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <ProjectDashboard />
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />

            {/* Private Profile Route */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />

            {/* NEW: Private Code Editor Route */}
            <Route
              path="/editor/:projectId"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <EditorPage />
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Configuration */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #535C91",
            background: "#1B1A55",
            color: "#E8E8FF",
          },
        }}
        containerStyle={{ zIndex: 100 }} // Ensure it stays above everything
      />
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </BrowserRouter>
  );
}