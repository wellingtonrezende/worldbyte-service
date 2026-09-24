import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";

import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";

import { CustomersPage } from "./pages/CustomersPage";
import { NewCustomerPage } from "./pages/NewCustomerPage";
import { CustomerDetailsPage } from "./pages/CustomerDetailsPage";

import { QuotesPage } from "./pages/QuotesPage";
import { NewQuotePage } from "./pages/NewQuotePage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/cadastro"
        element={<RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/app"
          element={<DashboardPage />}
        />

        <Route
          path="/app/clientes"
          element={<CustomersPage />}
        />

        <Route
          path="/app/clientes/novo"
          element={<NewCustomerPage />}
        />

        <Route
          path="/app/clientes/:id"
          element={<CustomerDetailsPage />}
        />

        <Route
          path="/app/orcamentos"
          element={<QuotesPage />}
        />
      </Route>

      <Route
  path="/app/orcamentos/novo"
  element={<NewQuotePage />}
/>

      <Route
        path="*"
        element={<Navigate to="/app" replace />}
      />
    </Routes>
  );
}