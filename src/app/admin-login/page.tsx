"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });

    if (response.ok) {
      window.location.assign("/admin");
      return;
    }

    setSubmitting(false);
    setError("인증 정보를 확인해 주세요.");
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-6">
      <section className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">RacketLab Ops</p>
        <h1 className="mt-2 text-2xl font-bold">관리자 로그인</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium" htmlFor="admin-secret">관리자 키</label>
          <input
            id="admin-secret"
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--color-text)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "확인 중…" : "로그인"}
          </button>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      </section>
    </main>
  );
}
