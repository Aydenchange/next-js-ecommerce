import { db } from "@/db/db";

function extractProductId(outTradeNo: string) {
  const [productId] = outTradeNo.split("__");
  return productId?.trim() || null;
}

export async function ensurePaidOrderSaved(input: {
  outTradeNo: string;
  email: string;
  totalAmount: string;
}) {
  const email = input.email.trim().toLowerCase();
  const productId = extractProductId(input.outTradeNo);

  if (!email || !productId) {
    return { ok: false as const, reason: "invalid_order_context" };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      priceInCents: true,
    },
  });

  if (!product) {
    return { ok: false as const, reason: "product_not_found" };
  }

  const paidAmountInCents = Math.round(Number(input.totalAmount) * 100);
  if (
    !Number.isFinite(paidAmountInCents) ||
    paidAmountInCents !== product.priceInCents
  ) {
    return { ok: false as const, reason: "paid_amount_mismatch" };
  }

  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const now = new Date();
  const windowStart = new Date(now.getTime() - 1000 * 60 * 20);

  const recentOrder = await db.order.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      pricePaidInCents: product.priceInCents,
      createdAt: {
        gte: windowStart,
        lte: now,
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

  return { ok: true as const };
}
