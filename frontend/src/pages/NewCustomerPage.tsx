import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

type CustomerType = "INDIVIDUAL" | "BUSINESS";

type FormState = {
  type: CustomerType;
  name: string;
  cpf: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
};

const initialState: FormState = {
  type: "INDIVIDUAL",
  name: "",
  cpf: "",
  cnpj: "",
  phone: "",
  whatsapp: "",
  email: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  notes: "",
};

export function NewCustomerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post("/customers", form);

      navigate("/app/clientes");
    } catch {
      setError("Não foi possível cadastrar o cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">WorldByte Service</div>
          <strong>Novo cliente</strong>
        </div>

        <Link to="/app/clientes" className="secondary-link">
          Voltar
        </Link>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <h1>Novo cliente</h1>
            <p className="muted">
              Cadastre os dados do cliente.
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
                    update(
                      "type",
                      event.target.value as CustomerType
                    )
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
                    value={form.cpf}
                    onChange={(event) =>
                      update("cpf", event.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="field">
                  <label>CNPJ</label>

                  <input
                    value={form.cnpj}
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
                  value={form.phone}
                  onChange={(event) =>
                    update("phone", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>WhatsApp</label>

                <input
                  value={form.whatsapp}
                  onChange={(event) =>
                    update("whatsapp", event.target.value)
                  }
                />
              </div>

              <div className="field field-wide">
                <label>E-mail</label>

                <input
                  type="email"
                  value={form.email}
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
                  value={form.cep}
                  onChange={(event) =>
                    update("cep", event.target.value)
                  }
                />
              </div>

              <div className="field field-wide">
                <label>Endereço</label>

                <input
                  value={form.address}
                  onChange={(event) =>
                    update("address", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Número</label>

                <input
                  value={form.number}
                  onChange={(event) =>
                    update("number", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Complemento</label>

                <input
                  value={form.complement}
                  onChange={(event) =>
                    update("complement", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Bairro</label>

                <input
                  value={form.neighborhood}
                  onChange={(event) =>
                    update("neighborhood", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Cidade</label>

                <input
                  value={form.city}
                  onChange={(event) =>
                    update("city", event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>Estado</label>

                <input
                  maxLength={2}
                  value={form.state}
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
                value={form.notes}
                onChange={(event) =>
                  update("notes", event.target.value)
                }
                placeholder="Informações importantes sobre o cliente"
              />
            </div>
          </section>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <Link
              to="/app/clientes"
              className="secondary-link"
            >
              Cancelar
            </Link>

            <button type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : "Cadastrar cliente"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}