import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

const accessCode = "SkyChefs2026";
const accessKey = "ddt.employeeAccess.v1";

type Props = {
  children: React.ReactNode;
};

export function PasswordGate({ children }: Props) {
  const [hasAccess, setHasAccess] = useState(() => sessionStorage.getItem(accessKey) === "granted");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password === accessCode) {
      sessionStorage.setItem(accessKey, "granted");
      setHasAccess(true);
      setError("");
      return;
    }
    setError("Incorrect employee password.");
  };

  if (hasAccess) return <>{children}</>;

  return (
    <main className="password-screen">
      <form className="password-card" onSubmit={submit}>
        <div className="password-mark">
          <LockKeyhole size={24} />
        </div>
        <h1>DDT Tracker</h1>
        <p>Employee access required.</p>
        <div className="password-field">
          <label htmlFor="employee-password">Password</label>
          <div className="password-input-row">
            <input
              id="employee-password"
              autoFocus
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
            />
            <button
              className="icon-button password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        {error && <span className="password-error">{error}</span>}
        <button className="primary-button" type="submit">
          <LockKeyhole size={16} />
          Enter
        </button>
      </form>
    </main>
  );
}
