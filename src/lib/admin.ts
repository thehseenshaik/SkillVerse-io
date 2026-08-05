/**
 * Admin bootstrap allowlist — the FIRST time an email from this list signs in,
 * their Firestore doc is auto-promoted to `role: "admin"`. After that, admins
 * are managed inside the app (Admin → Users → Toggle admin).
 *
 * Keep this list tight. Anyone here effectively owns the whole database.
 */
export const BOOTSTRAP_ADMIN_EMAILS: string[] = ["thehseenshaik@gmail.com"];

export type UserRole = "user" | "admin";

export function isBootstrapAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return BOOTSTRAP_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(
    email.toLowerCase(),
  );
}
