import "../css/UserAuthForm.css";
import { useState } from "react";
import apiClient from "../api/client";

interface UserAuthFormProps {
  onClose: () => void;
  setIsLoggedIn: (value: boolean) => void;
}

interface AuthResponse {
  message: string;
  user?: {
    id: number;
    email: string;
  };
}

const UserAuthForm = ({ onClose, setIsLoggedIn }: UserAuthFormProps) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

const endpoint = isRegister ? "/register" : "/login";

    try {
      const res = await apiClient.post<AuthResponse>(endpoint, {
        email,
        password,
      });

      const userEmail = res.data.user?.email || email;
      setMessage(`Welcome, ${userEmail}!`);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <h2>{isRegister ? "Create Account" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Sign Up" : "Login"}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
      <span
        className="toggle-link"
        onClick={() => {
          setIsRegister((prev) => !prev);
          setError(null);
        }}
      >
        {isRegister ? "Already have an account? Log in" : "New user? Sign up"}
      </span>
    </div>
  );
};

export default UserAuthForm;
