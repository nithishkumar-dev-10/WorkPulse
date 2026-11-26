import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/auth/AuthProvider";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AboutPage } from "@/pages/AboutPage";
import { BatchPage } from "@/pages/BatchPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { PredictPage } from "@/pages/PredictPage";
import { SignupPage } from "@/pages/SignupPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <LoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/signup"
                element={
                  <PageTransition>
                    <SignupPage />
                  </PageTransition>
                }
              />
              <Route element={<AppShell />}>
                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/"
                    element={
                      <PageTransition>
                        <PredictPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/batch"
                    element={
                      <PageTransition>
                        <BatchPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <PageTransition>
                        <HistoryPage />
                      </PageTransition>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                <Route
                  path="/about"
                  element={
                    <PageTransition>
                      <AboutPage />
                    </PageTransition>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
