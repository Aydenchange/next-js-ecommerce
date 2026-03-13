import Link from "next/link";
import { db } from "@/db/db";
import { formatCurrency } from "@/lib/formatters";

type OrdersPageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) ?? {};
  const email = params.email?.trim().toLowerCase() ?? "";

  if (!email) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          Add your email in the URL to view orders, for example: /orders?email=you@example.com
        </p>
      </div>
    );
  }

  const orders = await db.order.findMany({
    where: {
      user: {
        email,
      },
    },
    select: {
      id: true,
      createdAt: true,
      pricePaidInCents: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Orders</h1>
      <p className="text-sm text-muted-foreground">{email}</p>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{order.product.name}</p>
              <p className="text-muted-foreground">
                Paid {formatCurrency(order.pricePaidInCents / 100)} on{" "}
                {order.createdAt.toLocaleString()}
              </p>
              <Link
                href={`/products/${order.product.id}/purchase`}
                className="text-primary underline-offset-4 hover:underline"
              >
                Buy again
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
