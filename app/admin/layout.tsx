import { Nav, NavLink } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/_action/auth";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
      </Nav>
      <div className="container mt-4 flex justify-start">
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Logout
          </Button>
        </form>
      </div>
      <div className="container my-6">{children}</div>
    </>
  );
}
