
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Claims from "./pages/Claims";
import Compare from "./pages/Compare";
import Vault from "./pages/Vault";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Upgrade from "./pages/Upgrade";
import Services from "./pages/Services";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const SkipLink = () => (
  <a 
    href="#main-content" 
    className="skip-link"
    aria-label="Skip to main content"
  >
    Skip to main content
  </a>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/lovable-uploads/1c0eaed1-c937-427a-b6ca-e8201b38014e.png" 
              alt="Padlock Logo" 
              className="w-8 h-8 object-contain"
              loading="eager"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
          <span className="sr-only">Loading application, please wait</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  useEffect(() => {
    // Set document language
    document.documentElement.lang = 'en';
    
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
      document.head.appendChild(viewport);
    }
  }, []);

  return (
    <>
      <SkipLink />
      <BrowserRouter>
        <main id="main-content" role="main">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/claims" 
              element={
                <ProtectedRoute>
                  <Claims />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compare" 
              element={
                <ProtectedRoute>
                  <Compare />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vault" 
              element={
                <ProtectedRoute>
                  <Vault />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <ProtectedRoute>
                  <Upgrade />
                </ProtectedRoute>
              } 
            />
            <Route path="/services" element={<Services />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={300}>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
