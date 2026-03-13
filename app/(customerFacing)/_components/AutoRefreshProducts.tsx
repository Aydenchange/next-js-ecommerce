"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 10000;

export default function AutoRefreshProducts() {
  const router = useRouter();

  useEffect(() => {
    const refreshProducts = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const intervalId = window.setInterval(refreshProducts, REFRESH_INTERVAL_MS);

    window.addEventListener("focus", refreshProducts);
    document.addEventListener("visibilitychange", refreshProducts);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshProducts);
      document.removeEventListener("visibilitychange", refreshProducts);
    };
  }, [router]);

  return null;
}
