"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AlipayStatusWatcherProps = {
  outTradeNo: string;
  email: string;
  successPath: string;
  intervalMs?: number;
};

export default function AlipayStatusWatcher({
  outTradeNo,
  email,
  successPath,
  intervalMs = 3000,
}: AlipayStatusWatcherProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const params = new URLSearchParams({ out_trade_no: outTradeNo, email });
        const response = await fetch(
          `/api/alipay/order-status?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { paid?: boolean };
        if (data.paid && !cancelled) {
          const successParams = new URLSearchParams({
            out_trade_no: outTradeNo,
            email,
          });
          router.push(`${successPath}?${successParams.toString()}`);
        }
      } catch {
        // Ignore transient polling failures and retry at next interval.
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [outTradeNo, email, successPath, intervalMs, router]);

  return null;
}
