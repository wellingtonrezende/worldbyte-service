import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

type Customer = {
  id: string;
  type: "INDIVIDUAL" | "BUSINESS";
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  city?: string | null;
  state?: string | null;
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCustomers(term = "") {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers", {
        params: term ? { search: term } : undefined,
      });

      setCustomers(response.data.customers);
    } catch {
      setError("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await loadCustomers(search);
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">WorldByte Service</div>
          <strong>Clientes</strong>
        </div>

        <Link to="/app/clientes/novo" className="primary-link">
          Novo cliente
        </Link>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <h1>Clientes</h1>
            <p className="muted">
              Cadastre e consulte seus clientes.
            </p>
          </div>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone, CPF ou CNPJ"
          />

          <button type="submit">
            Buscar
          </button>
        </form>

        {loading && (
          <p className="muted">
            Carregando clientes...
          </p>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && customers.length === 0 && (
          <section className="empty-state">
            <h2>Nenhum cliente encontrado</h2>

            <p className="muted">
              Cadastre seu primeiro cliente para começar.
            </p>

            <Link
              to="/app/clientes/novo"
              className="primary-link"
            >
              Cadastrar cliente
            </Link>
          </section>
        )}

        {!loading && customers.length > 0 && (
          <section className="customer-grid">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                to={`/app/clientes/${customer.id}`}
                className="customer-card"
              >
                <div className="customer-card-top">
                  <div>
                    <strong>{customer.name}</strong>

                    <span className="customer-type">
                      {customer.type === "INDIVIDUAL"
                        ? "Pessoa física"
                        : "Pessoa jurídica"}
                    </span>
                  </div>
                </div>

                <div className="customer-info">
                  {customer.phone && (
                    <span>
                      Telefone: {customer.phone}
                    </span>
                  )}

                  {customer.whatsapp && (
                    <span>
                      WhatsApp: {customer.whatsapp}
                    </span>
                  )}

                  {customer.email && (
                    <span>
                      {customer.email}
                    </span>
                  )}

                  {(customer.city || customer.state) && (
                    <span>
                      {[customer.city, customer.state]
                        .filter(Boolean)
                        .join(" - ")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}