import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router';
import Navbar from './components/Navbar';
import StarParticles from './components/StarParticles';
import BackgroundGlow from './components/BackgroundGlow';
import Footer from './components/Footer';
import CompanyBanner from './components/CompanyBanner';
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";
import ProtectedRoute from "./components/protectedRoute";

// Lazy load pages for performance optimization
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProblemsPage = lazy(() => import('./pages/ProblemsPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const VisualizerPage = lazy(() => import('./pages/VisualizerPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const DiscussionPage = lazy(() => import('./pages/DiscussionPage'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const ContestPage = lazy(() => import('./pages/ContestPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0B0B0E]">
    <div className="w-12 h-12 border-4 border-[#E63946]/20 border-t-[#E63946] rounded-full animate-spin"></div>
  </div>
);


function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/problems" element={<ProblemsPage />} />
              <Route path="/problems/:id" element={<EditorPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/discussions" element={<DiscussionPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/contests" element={<ContestPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/visualizer" element={<VisualizerPage />} />
              </Route>
          </Routes>
        </Suspense>
      </div>
      {isLandingPage && (
        <>
          <CompanyBanner />
          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <>
        <StarParticles />
        <BackgroundGlow />
        <Navbar />
        <AppContent />
        </>
  );
}

export default App;
