"use client";
import { useState } from "react";
export function TeacherAccessForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return <section className="learning-card"><h2>Teacher access</h2><p>Grant access to a verified account, or remove its teacher permissions. The account will need to sign in again. Classes and learning records are retained.</p>
    <form className="learning-form" onSubmit={async event => {
      event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
      setBusy(true); setError(""); setMessage("");
      try {
        const response = await fetch("/api/admin/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), role: data.get("role") }) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "Unable to change this role.");
        setMessage("Permissions updated. Ask the account holder to sign in again."); form.reset();
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to save. Please try again."); }
      finally { setBusy(false); }
    }}><label>Verified account email<input name="email" type="email" autoComplete="off" required maxLength={254} /></label>
      <label>Account permissions<select name="role"><option value="teacher">Teacher</option><option value="student">Learner only</option></select></label>
      <label className="checkbox-label"><input name="confirmed" type="checkbox" required />I have checked the account holder’s identity and intended role.</label>
      <button className="learning-primary" disabled={busy}>{busy ? "Saving…" : "Update permissions"}</button>
      {error && <p role="alert" className="form-error">{error}</p>}{message && <p role="status" className="form-notice">{message}</p>}
    </form></section>;
}
