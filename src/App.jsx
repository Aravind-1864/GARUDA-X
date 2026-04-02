import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AwarenessPage from './pages/AwarenessPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppLayout = ({ children, hideSidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useApp();

  const isSidebarVisible = !hideSidebar && user && sidebarOpen;
  const isSidebarCompact = !hideSidebar && user && !sidebarOpen;

  return (
    <div className="app-layout">
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} menuOpen={sidebarOpen} />
      {(!hideSidebar && user) && <Sidebar isOpen={sidebarOpen} />}
      <main className={`main-content ${(hideSidebar || !user || !sidebarOpen) ? 'no-sidebar' : ''}`} style={{ paddingTop: 64 }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={
              <AppLayout hideSidebar={true}>
                <LandingPage />
              </AppLayout>
            } />
            <Route path="/login" element={
              <LoginPage />
            } />
            <Route path="/analyze" element={
              <AppLayout>
                <AnalyzePage />
              </AppLayout>
            } />
            <Route path="/dashboard" element={
              <AppLayout>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/history" element={
              <AppLayout>
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/awareness" element={
              <AppLayout>
                <AwarenessPage />
              </AppLayout>
            } />
            <Route path="/settings" element={
              <AppLayout>
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              </AppLayout>
            } />
            <Route path="/profile" element={
              <AppLayout>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </AppLayout>
            } />
          </Routes>
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
