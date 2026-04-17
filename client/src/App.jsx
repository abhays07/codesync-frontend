import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

// Temporary Dashboard Component
const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#070F2B] text-white p-8">
            <h1 className="text-3xl font-bold text-[#9290C3]">CodeSync Dashboard</h1>
            <p className="mt-4 text-gray-400">Authenticated successfully. Microservice connectivity active.</p>
            <button 
                onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
                className="mt-6 bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded hover:bg-red-500/30 transition-all"
            >
                Logout
            </button>
        </div>
    );
}

export default App;