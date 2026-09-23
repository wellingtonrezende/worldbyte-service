import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import axios from "axios";

type CustomerType = "INDIVIDUAL" | "BUSINESS";

type Customer = {
  id: string;
  type: CustomerType;
  name: string;
  cpf?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  cep?: string | null;
  address?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
};

export function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/customers/${id}`);
        setForm(response.data.customer);
      } catch {
        setError("Não foi possível carregar o cliente.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCustomer();
    }
  }, [id]);

  function update(field: keyof Customer, value: string) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form || !id) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await api.put(`/customers/${id}`, {
        type: form.type,
        name: form.name,
        cpf: form.cpf ?? "",
        cnpj: form.cnpj ?? "",
        phone: form.phone ?? "",
        whatsapp: form.whatsapp ?? "",
        email: form.email ?? "",
        cep: form.cep ?? "",
        address: form.address ?? "",
        number: form.number ?? "",
        complement: form.complement ?? "",
        neighborhood: form.neighborhood ?? "",
        city: form.city ?? "",
        state: form.state ?? "",
        notes: form.notes ?? "",
      });

      setForm(response.data.customer);
      setSuccess("Cliente atualizado com sucesso.");
   } catch (err) {
  if (axios.isAxiosError(err)) {
    console.error("ERRO AO ATUALIZAR CLIENTE:", err.response?.data);

    const apiMessage =
      err.response?.data?.message ||
      err.response?.data?.error;

    setError(
      apiMessage
        ? `Erro: ${apiMessage}`
        : `Erro HTTP ${err.response?.status ?? "desconhecido"} ao atualizar o cliente.`
    );
  } else {
    console.error(err);
    setError("Erro inesperado ao atualizar o cliente.");
  }
} finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;

    const confirmed = window.confirm(
      "Deseja realmente excluir este cliente?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/customers/${id}`);

      navigate("/app/clientes", {
        replace: true,
      });
    } catch {
      setError("Não foi possível excluir o cliente.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard">
        <section className="content">
          <p className="muted">Carregando cliente...</p>
        </section>
      </main>
    );
  }

  if (error && !form) {
    return (
      <main className="dashboard">
        <section className="content">
          <div className="error">{error}</div>

          <br />

          <Link to="/app/clientes" className="secondary-link">
            Voltar
          </Link>
        </section>
      </main>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">WorldByte Service</div>
          <strong>{form.name}</strong>
        </div>

        <Link to="/app/clientes" className="secondary-link">
          Voltar
        </Link>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <h1>Dados do cliente</h1>
            <p className="muted">
              Consulte e altere as informações cadastradas.
            </p>
          </div>
        </div>

        <form className="customer-form" onSubmit={handleSubmit}>
          <section className="form-card">
            <h2>Dados principais</h2>

            <div className="form-grid">
              <div className="field">
                <label>Tipo</label>

                <select
                  value={form.type}
                  onChange={(event) =>
                    update("type", event.target.value)
                  }
                >
                  <option value="INDIVIDUAL">
                    Pessoa física
                  </option>

                  <option value="BUSINESS">
                    Pessoa jurídica
                  </option>
                </select>
              </div>

              <div className="field field-wide">
                <label>
                  {form.type === "INDIVIDUAL"
                    ? "Nome"
                    : "Razão social / Nome"}
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    update("name", event.target.value)
                  }
                  required
                />
              </div>

              {form.type === "INDIVIDUAL" ? (
                <div className="field">
                  <label>CPF</label>

                  <input
                    value={form.cpf ?? ""}
                    onChange={(event) =>
                      update("cpf", event.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="field">
                  <label>CNPJ</label>

                  <input
                    value={form.cnpj ?? ""}
                    onChange={(event) =>
                      update("cnpj", event.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </section>

          <section className="form-card">
            <h2>Contato</h2>

            <div className="form-grid">
              <div className="field">
                <label>Telefone</label>

                <input
                  value={form.phone ?? ""}
                  onChange={(event) =>
                    update("phone", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>WhatsApp</label>

                <input
                  value={form.whatsapp ?? ""}
                  onChange={(event) =>
                    update("whatsapp", event.target.value)
                  }
                />
              </div>

              <div className="field field-wide">
                <label>E-mail</label>

                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(event) =>
                    update("email", event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="form-card">
            <h2>Endereço</h2>

            <div className="form-grid">
              <div className="field">
                <label>CEP</label>

                <input
                  value={form.cep ?? ""}
                  onChange={(event) =>
                    update("cep", event.target.value)
                  }
                />
              </div>

              <div className="field field-wide">
                <label>Endereço</label>

                <input
                  value={form.address ?? ""}
                  onChange={(event) =>
                    update("address", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Número</label>

                <input
                  value={form.number ?? ""}
                  onChange={(event) =>
                    update("number", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Complemento</label>

                <input
                  value={form.complement ?? ""}
                  onChange={(event) =>
                    update("complement", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Bairro</label>

                <input
                  value={form.neighborhood ?? ""}
                  onChange={(event) =>
                    update("neighborhood", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Cidade</label>

                <input
                  value={form.city ?? ""}
                  onChange={(event) =>
                    update("city", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Estado</label>

                <input
                  maxLength={2}
                  value={form.state ?? ""}
                  onChange={(event) =>
                    update(
                      "state",
                      event.target.value.toUpperCase()
                    )
                  }
                />
              </div>
            </div>
          </section>

          <section className="form-card">
            <h2>Observações</h2>

            <div className="field">
              <textarea
                rows={5}
                value={form.notes ?? ""}
                onChange={(event) =>
                  update("notes", event.target.value)
                }
              />
            </div>
          </section>

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="details-actions">
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? "Excluindo..."
                : "Excluir cliente"}
            </button>

            <div className="details-actions-right">
              <Link
                to="/app/clientes"
                className="secondary-link"
              >
                Cancelar
              </Link>

              <button type="submit" disabled={saving}>
                {saving
                  ? "Salvando..."
                  : "Salvar alterações"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}