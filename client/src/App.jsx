import { useEffect } from "react";
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
import Footer from "./components/layout/Footer";
import AuthPage from "./features/auth/AuthPage";
import HomePage from "./features/home/HomePage";
import ProjectDashboard from "./features/projects/ProjectDashboard";
import OAuthCallback from "./features/auth/OAuthCallback";
import ProfileSettings from "./features/profile/ProfileSettings";
import ProfilePage from "./features/profile/ProfilePage";
import RequireAdmin from "./components/RequireAdmin";
import AdminLayout from "./features/admin/AdminLayout";
import UserManagement from "./features/admin/UserManagement";
import AdminProjects from "./features/admin/AdminProjects";
import AdminSubscriptions from "./features/admin/AdminSubscriptions";
import AdminSettings from "./features/admin/AdminSettings";
import EditorPage from "./pages/EditorPage"; // New Editor Page
import { NotificationProvider } from "./context/NotificationContext";
// SubscriptionGuard removed from imports

function AppRoutes() {
  const location = useLocation();

  // Logic: Hide global navbar if user is in the editor to maximize space
  const isEditor = location.pathname.startsWith("/editor/");

  useEffect(() => {
    const titles = {
      '/': 'CodeSync | Home',
      '/login': 'CodeSync | Login',
      '/register': 'CodeSync | Register',
      '/dashboard': 'CodeSync | Dashboard',
      '/settings': 'CodeSync | Settings',
      '/profile': 'CodeSync | Profile',
      '/admin': 'CodeSync | Admin Console',
    };

    if (location.pathname.startsWith('/editor/')) {
      document.title = 'CodeSync | Editor';
    } else if (location.pathname.startsWith('/profile/')) {
      document.title = 'CodeSync | Profile';
    } else if (location.pathname.startsWith('/admin/')) {
      document.title = 'CodeSync | Admin Console';
    } else {
      document.title = titles[location.pathname] || 'CodeSync';
    }
  }, [location.pathname]);

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


            {/* Private Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              }
            />

            {/* Private Profile Settings Route */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />

            {/* Private Profile Page Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* NEW: Private Code Editor Route */}
            <Route
              path="/editor/:projectId"
              element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route path="/admin" element={<ProtectedRoute><RequireAdmin /></ProtectedRoute>}>
              <Route element={<AdminLayout />}>
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {!isEditor && <Footer />}
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