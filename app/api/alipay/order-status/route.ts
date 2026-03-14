import { NextResponse } from "next/server";
import { isAlipayTradePaid, queryAlipayOrder } from "@/lib/alipay";
import { ensurePaidOrderSaved } from "@/lib/payment-order";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const outTradeNo = searchParams.get("out_trade_no")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  if (!outTradeNo) {
    return NextResponse.json(
      { error: "missing_out_trade_no" },
      { status: 400 },
    );
  }

  try {
    const result = await queryAlipayOrder(outTradeNo);
    if (result.code !== "10000") {
      return NextResponse.json(
        {
          paid: false,
          status: result.tradeStatus ?? "UNKNOWN",
          code: result.code,
          message: result.subMsg ?? result.msg,
        },
        { status: 200 },
      );
    }

    const paid = isAlipayTradePaid(result.tradeStatus);
    let orderSaved = false;
    let saveReason: string | undefined;

    if (paid && email) {
      const saveResult = await ensurePaidOrderSaved({
        outTradeNo,
        email,
        totalAmount: result.totalAmount ?? "0",
      });
      orderSaved = saveResult.ok;
      if (!saveResult.ok) {
        saveReason = saveResult.reason;
      }
    }

    return NextResponse.json(
      {
        paid,
        status: result.tradeStatus ?? "UNKNOWN",
        orderSaved,
        saveReason,
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ paid: false, status: "ERROR" }, { status: 500 });
  }
}
