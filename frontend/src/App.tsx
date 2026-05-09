import { Route, Routes, useLocation } from "react-router-dom";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AppHeader } from "@/components/layout/AppHeader";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import HomePage from "@/features/home/pages/HomePage";
import OnboardingPage from "@/features/onboarding/pages/OnboardingPage";

// Auth pages own their full-screen layouts; the global header would clutter.
const HEADERLESS = new Set(["/login", "/signup"]);

function ConditionalHeader() {
  const { pathname } = useLocation();
  return HEADERLESS.has(pathname) ? null : <AppHeader />;
}

// Phase B / C placeholders — real pages land in the next two modules.
function ComingSoon({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
      <p className="mt-3 text-stone-500">
        Coming in the next module. Hang tight.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <ConditionalHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/products" element={<ComingSoon title="Products" />} />
        <Route path="/cart" element={<ComingSoon title="Cart" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/dashboard"
            element={<ComingSoon title="Admin Dashboard" />}
          />
        </Route>
      </Routes>
    </>
  );
}
