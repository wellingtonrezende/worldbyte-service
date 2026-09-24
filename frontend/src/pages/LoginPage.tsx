import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3333/api";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("organizationName");

    try {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: normalizedEmail,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      localStorage.setItem(
        "refreshToken",
        data.refreshToken
      );

      localStorage.setItem(
        "organizationName",
        data.organization.name
      );

      navigate("/app", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "LOGIN ERROR:",
          error.response?.status,
          error.response?.data
        );

        setMessage(
          error.response?.data?.message ??
            `Erro ${error.response?.status ?? ""} ao entrar.`
        );
      } else {
        console.error(error);

        setMessage(
          "Não foi possível entrar."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          WorldByte Service
        </div>

        <h1>Entrar</h1>

        <p className="muted">
          Acesse sua empresa e continue seus atendimentos.
        </p>

        <form onSubmit={submit}>
          <label>E-mail</label>

          <input
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            type="email"
            autoComplete="email"
            required
          />

          <label>Senha</label>

          <input
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            type="password"
            autoComplete="current-password"
            required
          />

          {message && (
            <div className="error">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        <p className="muted center">
          Ainda não tem conta?{" "}
          <Link to="/cadastro">
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}