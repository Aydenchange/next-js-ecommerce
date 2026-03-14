"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/db";
import { createAlipayPrecreateOrder } from "../../../../../../lib/alipay";

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

export async function createCheckoutSession(
  productId: string,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

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
  const outTradeNo = `${product.id}__${Date.now()}`;

  let qrCode = "";
  try {
    qrCode = await createAlipayPrecreateOrder({
      outTradeNo,
      totalAmount: (product.priceInCents / 100).toFixed(2),
      subject: product.name,
      body: product.description,
      notifyUrl: `${baseUrl}/api/alipay/notify`,
    });
  } catch (error) {
    const reason =
      error instanceof Error && error.message
        ? error.message.slice(0, 300)
        : "unknown_error";
    const params = new URLSearchParams({
      error: "session_failed",
      reason,
    });
    redirect(`/products/${product.id}/purchase?${params.toString()}`);
  }

  const params = new URLSearchParams({
    email,
    out_trade_no: outTradeNo,
    qr_code: qrCode,
  });

  redirect(`/products/${product.id}/purchase?${params.toString()}`);
}
