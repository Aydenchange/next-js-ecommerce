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

async function getUsersWithStats() {
  const [users, orderGroups] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.order.groupBy({
      by: ["userId"],
      _count: {
        _all: true,
      },
      _sum: {
        pricePaidInCents: true,
      },
      _max: {
        createdAt: true,
      },
    }),
  ]);

  const statsMap = new Map(
    orderGroups.map((group) => [
      group.userId,
      {
        orderCount: group._count._all,
        spentInCents: group._sum.pricePaidInCents ?? 0,
        lastOrderAt: group._max.createdAt,
      },
    ]),
  );

  const rows = users.map((user) => {
    const stats = statsMap.get(user.id);
    return {
      ...user,
      orderCount: stats?.orderCount ?? 0,
      spentInCents: stats?.spentInCents ?? 0,
      lastOrderAt: stats?.lastOrderAt ?? null,
    };
  });

  const summary = rows.reduce(
    (acc, user) => {
      acc.totalCustomers += 1;
      if (user.orderCount > 0) {
        acc.payingCustomers += 1;
      }
      acc.totalSpentInCents += user.spentInCents;
      return acc;
    },
    {
      totalCustomers: 0,
      payingCustomers: 0,
      totalSpentInCents: 0,
    },
  );

  return { rows, summary };
}

export default async function AdminUsersPage() {
  const { rows, summary } = await getUsersWithStats();
  const averageSpentPerCustomer =
    summary.totalCustomers === 0
      ? 0
      : summary.totalSpentInCents / summary.totalCustomers / 100;

  return (
    <div className="space-y-6">
      <PageHeader>Customers</PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatNumber(summary.totalCustomers)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paying Customers</CardTitle>
            <CardDescription>
              Users with at least one paid order
            </CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatNumber(summary.payingCustomers)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Spend / Customer</CardTitle>
            <CardDescription>Based on all customers</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(averageSpentPerCustomer)}
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableCaption>Customer List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Last Purchase</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No customers yet.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdAt.toLocaleString()}</TableCell>
                <TableCell>{formatNumber(user.orderCount)}</TableCell>
                <TableCell>{formatCurrency(user.spentInCents / 100)}</TableCell>
                <TableCell>
                  {user.lastOrderAt ? user.lastOrderAt.toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
