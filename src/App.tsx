import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "@/components/SiteLayout";
import { AdminLayout } from "@/components/AdminLayout";
import { LandingPage } from "@/pages/LandingPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { BookPage } from "@/pages/BookPage";
import { AccountPage } from "@/pages/AccountPage";
import { AuthPage } from "@/pages/AuthPage";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminSchedule } from "@/pages/admin/AdminSchedule";
import { AdminAppointments } from "@/pages/admin/AdminAppointments";
import { AdminServices } from "@/pages/admin/AdminServices";
import { AdminCustomers } from "@/pages/admin/AdminCustomers";
import { AdminCustomerDetail } from "@/pages/admin/AdminCustomerDetail";
import { AdminEmails } from "@/pages/admin/AdminEmails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="book" element={<BookPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="auth" element={<AuthPage />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="emails" element={<AdminEmails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
