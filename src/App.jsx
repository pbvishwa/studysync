import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Groups from './pages/Groups'
import Planner from './pages/Planner'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚡</div>
          <p className="text-muted text-sm">Loading StudySync...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute><Groups /></ProtectedRoute>
        } />
        <Route path="/planner" element={
          <ProtectedRoute><Planner /></ProtectedRoute>
        } />
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
