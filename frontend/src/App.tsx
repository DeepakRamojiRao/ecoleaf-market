import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/common/ProtectedRoute";
import { AppHeader } from "@/components/layout/AppHeader";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import HomePage from "@/features/home/pages/HomePage";
import OnboardingPage from "@/features/onboarding/pages/OnboardingPage";
import ProductsBrowsePage from "@/features/products/pages/ProductsBrowsePage";

import AddCategoryPage from "@/features/admin/pages/AddCategoryPage";
import {
  InvoicesPage,
  PurchaseOrdersPage,
  RetailSalesPage,
  SalesOrdersPage,
} from "@/features/admin/pages/ComingSoonPage";
import CustomersPage from "@/features/admin/pages/CustomersPage";
import DashboardPage from "@/features/admin/pages/DashboardPage";
import InventoryPage from "@/features/admin/pages/InventoryPage";
import ManageCategoryPage from "@/features/admin/pages/ManageCategoryPage";
import ProductsPage from "@/features/admin/pages/ProductsPage";
import SuppliersPage from "@/features/admin/pages/SuppliersPage";

// Auth pages own their full-screen layouts; the global header would clutter.
// Admin pages have their own shell with its own sidebar/header.
const HEADERLESS_PREFIXES = ["/login", "/signup", "/admin"];

function ConditionalHeader() {
  const { pathname } = useLocation();
  const hide = HEADERLESS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  return hide ? null : <AppHeader />;
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
        {/* Auth pages — only reachable while *signed out*. */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Customer area — every page requires a valid session. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsBrowsePage />} />
          <Route path="/cart" element={<ComingSoon title="Cart" />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Admin area — additionally requires is_staff=True. */}
        <Route element={<ProtectedRoute requireStaff />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="sales-orders" element={<SalesOrdersPage />} />
            <Route path="retail-sales" element={<RetailSalesPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="categories" element={<ManageCategoryPage />} />
            <Route path="categories/new" element={<AddCategoryPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
          </Route>
          {/* Legacy route kept for the existing navigation. */}
          <Route
            path="/dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>

        {/* Anything unmatched goes through the auth gate too. */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="*"
            element={<ComingSoon title="Page not found" />}
          />
        </Route>
      </Routes>
    </>
  );
}
