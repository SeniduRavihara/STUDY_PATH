import React from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./components/pages/Dashboard";
import DatabaseOverview from "./components/pages/DatabaseOverview";
import FeedPostManager from "./components/pages/FeedPostManager";
import Login from "./pages/auth/Login";
import MCQManager from "./pages/mcqs/MCQManager";
import QuizPackDetail from "./pages/quiz-packs/QuizPackDetail";
import QuizPackManager from "./pages/quiz-packs/QuizPackManager";
import Settings from "./pages/settings/Settings";
import Signup from "./pages/auth/Signup";
import StudyPackManager from "./pages/study-packs/StudyPackManager";
import SubjectBuilder from "./pages/subjects/SubjectBuilder";
import SubjectManager from "./pages/subjects/SubjectManager";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { ModalProvider } from "./contexts/ModalContext";
import "./index.css";
import TestContentBlocks from "./pages/TestContentBlocks";
import "./utils/sessionDebug"; // Import debug utility

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only allow users with the admin role to access admin routes
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-2">
            Access denied
          </h2>
          <p className="text-sm text-dark-300 mb-4">
            You need admin privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Admin Routes Component
const AdminRoutes: React.FC = () => {
  return (
    <SidebarProvider>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subjects" element={<SubjectManager />} />
          <Route
            path="/chapters"
            element={
              <div className="text-white text-center py-20">
                Chapters Management - Coming Soon
              </div>
            }
          />
          <Route
            path="/lessons"
            element={
              <div className="text-white text-center py-20">
                Lessons Management - Coming Soon
              </div>
            }
          />
          <Route path="/mcqs" element={<MCQManager />} />
          <Route path="/feed-posts" element={<FeedPostManager />} />
          <Route path="/quiz-packs" element={<QuizPackManager />} />
          <Route path="/quiz-pack/:quizPackId" element={<QuizPackDetail />} />
          <Route path="/study-packs" element={<StudyPackManager />} />
          <Route
            path="/subject-builder/:subjectId"
            element={<SubjectBuilder />}
          />
          <Route path="/database" element={<DatabaseOverview />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test-blocks" element={<TestContentBlocks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminLayout>
    </SidebarProvider>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/admin" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/admin" replace /> : <Signup />}
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ModalProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ModalProvider>
  );
};

export default App;
