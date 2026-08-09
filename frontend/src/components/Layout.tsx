import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { healthCheck } from "../api/client";

export function Layout() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const result = await healthCheck();
        if (!cancelled) {
          setBackendOnline(result.status === "ok");
        }
      } catch {
        if (!cancelled) {
          setBackendOnline(false);
        }
      }
    }

    void checkHealth();
    const intervalId = window.setInterval(() => {
      void checkHealth();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-white">
            Secure Face AI
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/register"
              className="text-slate-300 transition hover:text-white"
            >
              Register
            </Link>
            <Link
              to="/verify"
              className="text-slate-300 transition hover:text-white"
            >
              Verify
            </Link>
            <Link
              to="/users"
              className="text-slate-300 transition hover:text-white"
            >
              Users
            </Link>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                backendOnline === null
                  ? "bg-slate-700 text-slate-300"
                  : backendOnline
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {backendOnline === null
                ? "Checking..."
                : backendOnline
                  ? "Backend online"
                  : "Backend offline"}
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
