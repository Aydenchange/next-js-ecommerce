import { notFound } from "next/navigation";
import { db } from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "./_action/checkout";

type PurchasePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; canceled?: string }>;
};

export default async function PurchasePage({
  params,
  searchParams,
}: PurchasePageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};

  const product = await db.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      priceInCents: true,
      isAvailableForPurchase: true,
    },
  });

  if (!product) notFound();

  if (!product.isAvailableForPurchase) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        This product is currently unavailable.
      </p>
    );
  }

  const action = createCheckoutSession.bind(null, product.id);

  return (
    <main className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Order</CardTitle>
          <CardDescription>Pay with Stripe to complete your purchase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(query.error === "invalid_email" || query.error === "session_failed") && (
            <p className="text-sm text-destructive">
              {query.error === "invalid_email"
                ? "Please enter a valid email address."
                : "Unable to start checkout. Please try again."}
            </p>
          )}
          {query.canceled === "1" && (
            <p className="text-sm text-muted-foreground">
              Payment was canceled. You can try again anytime.
            </p>
          )}
          <div className="rounded-lg border p-3">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(product.priceInCents / 100)}
            </p>
          </div>
          <form action={action} className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full">
              Pay Now
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          You will be redirected to Stripe Checkout.
        </CardFooter>
      </Card>
    </main>
  );
}
