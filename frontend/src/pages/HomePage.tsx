import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold text-white">
          Face Verification with Liveness Detection
        </h1>
        <p className="max-w-2xl text-slate-300">
          Register a consenting user with a live camera capture, then verify
          identity using a blink-based liveness challenge followed by face
          matching against registered users.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">1. Detect</h2>
          <p className="mt-2 text-sm text-slate-400">
            The camera preview shows live face detection bounding boxes.
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">2. Liveness</h2>
          <p className="mt-2 text-sm text-slate-400">
            Complete a blink challenge to receive a single-use liveness token.
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">3. Verify</h2>
          <p className="mt-2 text-sm text-slate-400">
            Capture a verification photo and match it against registered users.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          to="/register"
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400"
        >
          Register a user
        </Link>
        <Link
          to="/verify"
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
        >
          Verify identity
        </Link>
        <Link
          to="/users"
          className="rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Manage Users
        </Link>
      </section>
    </div>
  );
}
