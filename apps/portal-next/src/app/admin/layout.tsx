'use client'
// Client-only zone — no SSR, not indexed by search engines
// All routes under /admin require Supabase auth

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // TODO: wrap with Supabase auth guard
  return <div>{children}</div>
}
