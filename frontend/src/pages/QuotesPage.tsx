import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

type Quote = {
  id: string;
  number: string;
  title: string;
  status:
    | "DRAFT"
    | "SENT"
    | "APPROVED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELED";
  total: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
};

function statusLabel(status: Quote["status"]) {
  const labels: Record<Quote["status"], string> = {
    DRAFT: "Rascunho",
    SENT: "Enviado",
    APPROVED: "Aprovado",
    REJECTED: "Recusado",
    EXPIRED: "Expirado",
    CANCELED: "Cancelado",
  };

  return labels[status];
}

function formatCurrency(value: string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQuotes(term = "") {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/quotes", {
        params: term ? { search: term } : undefined,
      });

      setQuotes(response.data.quotes);
    } catch {
      setError("Não foi possível carregar os orçamentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuotes();
  }, []);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await loadQuotes(search);
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">WorldByte Service</div>
          <strong>Orçamentos</strong>
        </div>

        <Link
          to="/app/orcamentos/novo"
          className="primary-link"
        >
          Novo orçamento
        </Link>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <h1>Orçamentos</h1>
            <p className="muted">
              Crie, acompanhe e gerencie seus orçamentos.
            </p>
          </div>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por número, título ou cliente"
          />

          <button type="submit">
            Buscar
          </button>
        </form>

        {loading && (
          <p className="muted">
            Carregando orçamentos...
          </p>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && quotes.length === 0 && (
          <section className="empty-state">
            <h2>Nenhum orçamento encontrado</h2>

            <p className="muted">
              Crie seu primeiro orçamento para começar.
            </p>

            <Link
              to="/app/orcamentos/novo"
              className="primary-link"
            >
              Criar orçamento
            </Link>
          </section>
        )}

        {!loading && quotes.length > 0 && (
          <section className="quote-grid">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                to={`/app/orcamentos/${quote.id}`}
                className="quote-card"
              >
                <div className="quote-card-top">
                  <div>
                    <strong>
                      {quote.number}
                    </strong>

                    <span className="quote-title">
                      {quote.title}
                    </span>
                  </div>

                  <span
                    className={`quote-status quote-status-${quote.status.toLowerCase()}`}
                  >
                    {statusLabel(quote.status)}
                  </span>
                </div>

                <div className="quote-info">
                  <span>
                    Cliente: {quote.customer.name}
                  </span>

                  <strong>
                    {formatCurrency(quote.total)}
                  </strong>
                </div>
              </Link>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}