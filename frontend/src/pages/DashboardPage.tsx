import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

type OrganizationResponse = {
  organization: {
    id: string;
    legalName: string;
    tradeName?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    city?: string | null;
    state?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
  membership: {
    role: string;
  };
};

export function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<OrganizationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrganization() {
      try {
        const response = await api.get<OrganizationResponse>(
          "/organizations/me"
        );

        setData(response.data);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("organizationName");

        setError("Sua sessão expirou. Faça login novamente.");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      } finally {
        setLoading(false);
      }
    }

    loadOrganization();
  }, [navigate]);

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("organizationName");

    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <main className="dashboard">
        <section className="content">
          <p className="muted">Carregando sua empresa...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard">
        <section className="content">
          <div className="error">{error}</div>
        </section>
      </main>
    );
  }

  const organizationName =
    data?.organization.tradeName ??
    data?.organization.legalName ??
    "Sua empresa";

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">WorldByte Service</div>
          <strong>{organizationName}</strong>
        </div>

        <button
          onClick={logout}
          style={{
            width: "auto",
            margin: 0,
            padding: "10px 16px",
          }}
        >
          Sair
        </button>
      </header>

      <section className="content">
        <h1>Olá 👋</h1>

        <p className="muted">
          Sua conta está conectada à organização correta.
        </p>

        <div className="grid">
          <article className="metric">
            <span>Orçamentos</span>
            <strong>0</strong>
          </article>

          <article className="metric">
            <span>Clientes</span>
            <strong>0</strong>
          </article>

          <article className="metric">
            <span>Serviços hoje</span>
            <strong>0</strong>
          </article>

          <article className="metric">
            <span>A receber</span>
            <strong>R$ 0,00</strong>
          </article>
        </div>

        <section className="panel">
          <h2>Empresa</h2>

          <p>
            <strong>Nome:</strong> {organizationName}
          </p>

          <p>
            <strong>Perfil:</strong> {data?.membership.role}
          </p>
        </section>
      </section>
    </main>
  );
}