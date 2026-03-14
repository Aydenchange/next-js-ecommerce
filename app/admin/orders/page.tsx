import PageHeader from "../_components/PageHeader";
import { db } from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getSalesData() {
  const [orders, aggregate] = await Promise.all([
    db.order.findMany({
      select: {
        id: true,
        createdAt: true,
        pricePaidInCents: true,
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.order.aggregate({
      _count: true,
      _sum: {
        pricePaidInCents: true,
      },
      _avg: {
        pricePaidInCents: true,
      },
    }),
  ]);

  return {
    orders,
    totalSalesCount: aggregate._count,
    totalRevenueInCents: aggregate._sum.pricePaidInCents ?? 0,
    averageOrderInCents: aggregate._avg.pricePaidInCents ?? 0,
  };
}

export default async function AdminOrdersPage() {
  const { orders, totalSalesCount, totalRevenueInCents, averageOrderInCents } =
    await getSalesData();

  return (
    <div className="space-y-6">
      <PageHeader>Sales</PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>All paid orders</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(totalRevenueInCents / 100)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Completed transactions</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatNumber(totalSalesCount)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Revenue divided by order count</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(averageOrderInCents / 100)}
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableCaption>Sales Transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No sales yet.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.createdAt.toLocaleString()}</TableCell>
                <TableCell>{order.user.email}</TableCell>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>
                  {formatCurrency(order.pricePaidInCents / 100)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
