"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { stripe } from "@/lib/stripe";

function getBaseUrlFromHeaders(headersList: Headers) {
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (!host) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

export async function createCheckoutSession(productId: string, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    redirect(`/products/${productId}/purchase?error=invalid_email`);
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      priceInCents: true,
      isAvailableForPurchase: true,
    },
  });

  if (!product || !product.isAvailableForPurchase) {
    redirect(`/products/${productId}/purchase?error=not_available`);
  }

  const baseUrl = getBaseUrlFromHeaders(await headers());

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: product.priceInCents,
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
      },
    ],
    metadata: {
      productId: product.id,
      email,
    },
    success_url: `${baseUrl}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/products/${product.id}/purchase?canceled=1`,
  });

  if (!session.url) {
    redirect(`/products/${product.id}/purchase?error=session_failed`);
  }

  redirect(session.url);
}
