import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

type Customer = {
  id: string;
  name: string;
};

type QuoteItem = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export function NewQuotePage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("0");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const [items, setItems] = useState<QuoteItem[]>([
    {
      description: "",
      quantity: "1",
      unitPrice: "0",
    },
  ]);

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await api.get("/customers");

        setCustomers(
          response.data.customers.map((customer: Customer) => ({
            id: customer.id,
            name: customer.name,
          }))
        );
      } catch {
        setError("Não foi possível carregar os clientes.");
      } finally {
        setLoadingCustomers(false);
      }
    }

    loadCustomers();
  }, []);

  function updateItem(
    index: number,
    field: keyof QuoteItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        description: "",
        quantity: "1",
        unitPrice: "0",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, itemIndex) => itemIndex !== index
      );
    });
  }

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;

      return total + quantity * unitPrice;
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    const discountValue = Number(discount) || 0;

    return Math.max(0, subtotal - discountValue);
  }, [subtotal, discount]);

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!customerId) {
        setError("Selecione um cliente.");
        return;
      }

      const normalizedItems = items.map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }));

      const hasInvalidItem = normalizedItems.some(
        (item) =>
          !item.description ||
          item.quantity <= 0 ||
          item.unitPrice < 0
      );

      if (hasInvalidItem) {
        setError(
          "Preencha corretamente todos os itens do orçamento."
        );

        return;
      }

      await api.post("/quotes", {
        customerId,
        title: title.trim(),
        description: description || null,
        discount: Number(discount) || 0,

        validUntil: validUntil
          ? new Date(
              `${validUntil}T23:59:59.000Z`
            ).toISOString()
          : null,

        notes: notes || null,
        terms: terms || null,

        items: normalizedItems,
      });

      navigate("/app/orcamentos");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        "Não foi possível cadastrar o orçamento.";

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="brand">
            WorldByte Service
          </div>

          <strong>Novo orçamento</strong>
        </div>

        <Link
          to="/app/orcamentos"
          className="secondary-link"
        >
          Voltar
        </Link>
      </header>

      <section className="content">
        <div className="page-heading">
          <div>
            <h1>Novo orçamento</h1>

            <p className="muted">
              Monte os serviços, valores e condições comerciais.
            </p>
          </div>
        </div>

        <form
          className="customer-form"
          onSubmit={handleSubmit}
        >
          <section className="form-card">
            <h2>Dados principais</h2>

            <div className="form-grid">
              <div className="field field-wide">
                <label>Cliente</label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(event.target.value)
                  }
                  disabled={loadingCustomers}
                  required
                >
                  <option value="">
                    {loadingCustomers
                      ? "Carregando clientes..."
                      : "Selecione um cliente"}
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field field-wide">
                <label>Título</label>

                <input
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Ex.: Instalação elétrica residencial"
                  required
                />
              </div>

              <div className="field field-wide">
                <label>Descrição</label>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="form-card">
            <div className="quote-section-heading">
              <div>
                <h2>Itens do orçamento</h2>

                <p className="muted">
                  Adicione os serviços ou materiais.
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={addItem}
              >
                Adicionar item
              </button>
            </div>

            <div className="quote-items">
              {items.map((item, index) => (
                <div
                  className="quote-item-row"
                  key={index}
                >
                  <div className="field quote-item-description">
                    <label>
                      Descrição
                    </label>

                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Descrição do serviço ou material"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Quantidade
                    </label>

                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="field">
                    <label>
                      Valor unitário
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "unitPrice",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>

                  <div className="quote-item-total">
                    <span>Total</span>

                    <strong>
                      {formatCurrency(
                        (Number(item.quantity) || 0) *
                          (Number(item.unitPrice) || 0)
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="quote-remove-button"
                    onClick={() =>
                      removeItem(index)
                    }
                    disabled={items.length === 1}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="form-card">
            <h2>Valores e validade</h2>

            <div className="form-grid">
              <div className="field">
                <label>Desconto</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label>
                  Validade do orçamento
                </label>

                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) =>
                    setValidUntil(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="quote-summary">
              <div>
                <span>Subtotal</span>

                <strong>
                  {formatCurrency(subtotal)}
                </strong>
              </div>

              <div>
                <span>Desconto</span>

                <strong>
                  {formatCurrency(
                    Number(discount) || 0
                  )}
                </strong>
              </div>

              <div className="quote-summary-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(total)}
                </strong>
              </div>
            </div>
          </section>

          <section className="form-card">
            <h2>Condições</h2>

            <div className="field">
              <label>
                Termos e condições
              </label>

              <textarea
                rows={4}
                value={terms}
                onChange={(event) =>
                  setTerms(event.target.value)
                }
              />
            </div>

            <div className="field">
              <label>Observações</label>

              <textarea
                rows={4}
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
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
              to="/app/orcamentos"
              className="secondary-link"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Salvando..."
                : "Salvar orçamento"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}