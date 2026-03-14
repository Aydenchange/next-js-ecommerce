import Link from "next/link";
import { redirect } from "next/navigation";
import { isAlipayTradePaid, queryAlipayOrder } from "@/lib/alipay";
import { ensurePaidOrderSaved } from "@/lib/payment-order";
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
  searchParams?: Promise<{ out_trade_no?: string; email?: string }>;
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = (await searchParams) ?? {};
  const outTradeNo = params.out_trade_no;
  const email = params.email?.trim().toLowerCase();

  if (!outTradeNo) {
    redirect("/");
  }

  const queryResult = await queryAlipayOrder(outTradeNo);

  if (
    queryResult.code !== "10000" ||
    !isAlipayTradePaid(queryResult.tradeStatus)
  ) {
    return (
      <main className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>支付处理中</CardTitle>
            <CardDescription>
              订单尚未支付成功，请完成付款后重试。
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

  if (!email) {
    return (
      <main className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>支付成功</CardTitle>
            <CardDescription>
              支付成功，但订单信息不完整，请联系客服。
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

  const saveResult = await ensurePaidOrderSaved({
    outTradeNo,
    email,
    totalAmount: queryResult.totalAmount ?? "0",
  });

  if (!saveResult.ok) {
    return (
      <main className="mx-auto w-full max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>订单保存失败</CardTitle>
            <CardDescription>
              支付成功，但订单保存失败（{saveResult.reason}），请联系客服处理。
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

  return (
    <main className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>支付成功</CardTitle>
          <CardDescription>订单已完成，感谢你的购买。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-3">
            <p className="font-medium">订单已写入系统</p>
            <p className="text-sm text-muted-foreground">
              订单号：{outTradeNo}
            </p>
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
