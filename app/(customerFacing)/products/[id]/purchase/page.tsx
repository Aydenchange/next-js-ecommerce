import { notFound } from "next/navigation";
import QRCode from "qrcode";
import Image from "next/image";
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
import Link from "next/link";
import { createCheckoutSession } from "./_action/checkout";
import AlipayStatusWatcher from "./_components/AlipayStatusWatcher";

type PurchasePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string;
    canceled?: string;
    reason?: string;
    email?: string;
    out_trade_no?: string;
    qr_code?: string;
  }>;
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
  const qrCodeUrl = query.qr_code;
  const outTradeNo = query.out_trade_no;
  const email = query.email;
  const isSandbox = (process.env.ALIPAY_GATEWAY ?? "")
    .toLowerCase()
    .includes("sandbox");
  const qrCodeImage = qrCodeUrl
    ? await QRCode.toDataURL(qrCodeUrl, {
        margin: 1,
        width: 260,
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>支付宝付款</CardTitle>
          <CardDescription>请使用支付宝扫码完成支付。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(query.error === "invalid_email" ||
            query.error === "session_failed") && (
            <p className="text-sm text-destructive">
              {query.error === "invalid_email"
                ? "请输入有效邮箱。"
                : "创建支付宝订单失败，请稍后重试。"}
            </p>
          )}
          {query.error === "session_failed" && query.reason && (
            <p className="text-xs text-destructive/80 break-all">
              错误详情：{query.reason}
            </p>
          )}
          {query.canceled === "1" && (
            <p className="text-sm text-muted-foreground">
              支付已取消，可重新发起支付。
            </p>
          )}
          {isSandbox && (
            <p className="text-xs text-amber-600">
              当前为支付宝沙箱环境，请使用“支付宝沙箱版”APP和沙箱买家账号扫码；普通支付宝扫码常会提示二维码过期。
            </p>
          )}
          <div className="rounded-lg border p-3">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(product.priceInCents / 100)}
            </p>
          </div>
          {!qrCodeUrl || !outTradeNo || !email ? (
            <form action={action} className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                defaultValue={email}
                required
              />
              <Button type="submit" className="w-full">
                生成支付宝二维码
              </Button>
            </form>
          ) : (
            <>
              <AlipayStatusWatcher
                outTradeNo={outTradeNo}
                email={email}
                intervalMs={3000}
                successPath="/orders/success"
              />
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  订单号：
                  <span className="font-mono text-foreground">
                    {outTradeNo}
                  </span>
                </p>
                <Image
                  src={qrCodeImage ?? ""}
                  alt="Alipay QR Code"
                  width={260}
                  height={260}
                  unoptimized
                  className="mx-auto h-65 w-65 rounded border"
                />
                <p className="text-center text-sm text-muted-foreground">
                  打开支付宝扫码完成支付，支付成功后将自动跳转。
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href={qrCodeUrl} target="_blank" rel="noreferrer">
                    手机端打开支付宝链接
                  </Link>
                </Button>
                <form action={action} className="pt-1">
                  <input type="hidden" name="email" value={email} />
                  <Button type="submit" className="w-full">
                    重新生成二维码
                  </Button>
                </form>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          仅支持支付宝支付。
        </CardFooter>
      </Card>
    </main>
  );
}
