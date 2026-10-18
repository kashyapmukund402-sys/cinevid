import Link from "next/link"; import { redirect } from "next/navigation"; import { isAdmin } from "@/lib/session";
export default async function A({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin-login");
  return (<div className="md:flex min-h-[80vh]"><aside className="md:w-52 bg-zinc-950 p-4 flex md:flex-col gap-4 text-sm overflow-x-auto">
    <Link href="/admin">Dashboard</Link><Link href="/admin">Episodes</Link><Link href="/admin/new" className="text-brand font-semibold">+ Add Episode</Link>
    <Link href="/admin/requests">Requests</Link><Link href="/admin/reach">Reach</Link><Link href="/admin/premium">Premium Users</Link><Link href="/admin/free">Free Access</Link>
    <form action="/api/logout" method="post"><button>Logout</button></form></aside><div className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</div></div>);
}
