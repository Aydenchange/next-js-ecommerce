import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { stripe } from "@/lib/stripe";
import { sendOrderPaidEmail } from "@/lib/email";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrderSuccessPageProps = {
  searchParams?: Promise<{ session_id?: string }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = (await searchParams) ?? {};
  const sessionId = params.session_id;

  if (!sessionId) {
    redirect("/");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return (
      <main className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Payment Pending</CardTitle>
            <CardDescription>
              Your payment is not completed yet. Please check again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const email =
    session.customer_details?.email ?? session.metadata?.email ?? undefined;
  const productId = session.metadata?.productId;

  if (!email || !productId) {
    return (
      <main className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Payment Successful</CardTitle>
            <CardDescription>
              Payment succeeded, but order details are incomplete.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      priceInCents: true,
    },
  });

  if (!product) {
    redirect("/");
  }

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const sessionCreatedAt = new Date(session.created * 1000);
  const sessionWindowStart = new Date(session.created * 1000 - 1000 * 60 * 15);

  const recentOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      pricePaidInCents: product.priceInCents,
      createdAt: {
        gte: sessionWindowStart,
        lte: sessionCreatedAt,
      },
    },
    select: { id: true },
  });

  if (!recentOrder) {
    await db.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        pricePaidInCents: product.priceInCents,
      },
    });
  }

  await sendOrderPaidEmail({
    to: email,
    productName: product.name,
  });

  return (
    <main className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Payment Successful</CardTitle>
          <CardDescription>
            Your order is confirmed. A confirmation email has been sent to {email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-3">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">Order completed</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/orders">My Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
