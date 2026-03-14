import { AlipaySdk } from "alipay-sdk";

type AlipayKeyType = "PKCS1" | "PKCS8";

type AlipayTradePrecreateResult = {
  code: string;
  msg?: string;
  subCode?: string;
  subMsg?: string;
  qrCode?: string;
  outTradeNo?: string;
};

type AlipayTradeQueryResult = {
  code: string;
  msg?: string;
  subCode?: string;
  subMsg?: string;
  outTradeNo?: string;
  tradeStatus?: string;
  totalAmount?: string;
};

function getAlipayConfig() {
  const appId = process.env.ALIPAY_APP_ID?.trim();
  const privateKey = normalizePem(process.env.ALIPAY_PRIVATE_KEY);
  const alipayPublicKey = normalizePem(process.env.ALIPAY_PUBLIC_KEY);

  if (!appId || !privateKey || !alipayPublicKey) {
    throw new Error(
      "Missing Alipay config. Please set ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY and ALIPAY_PUBLIC_KEY.",
    );
  }

  return {
    appId,
    privateKey,
    alipayPublicKey,
    gateway: process.env.ALIPAY_GATEWAY?.trim(),
    keyType: detectPrivateKeyType(privateKey),
  };
}

function normalizePem(value?: string) {
  if (!value) return value;
  return value.replace(/\\n/g, "\n").trim();
}

function detectPrivateKeyType(privateKey: string): AlipayKeyType {
  if (privateKey.includes("BEGIN PRIVATE KEY")) {
    return "PKCS8";
  }
  return "PKCS1";
}

function getAlipayClient() {
  const config = getAlipayConfig();
  return new AlipaySdk({
    appId: config.appId,
    privateKey: config.privateKey,
    alipayPublicKey: config.alipayPublicKey,
    gateway: config.gateway,
    keyType: config.keyType,
  });
}

export async function createAlipayPrecreateOrder(input: {
  outTradeNo: string;
  totalAmount: string;
  subject: string;
  body?: string;
  notifyUrl?: string;
}) {
  const alipay = getAlipayClient();

  const result = (await alipay.exec("alipay.trade.precreate", {
    notifyUrl: input.notifyUrl,
    bizContent: {
      outTradeNo: input.outTradeNo,
      totalAmount: input.totalAmount,
      subject: input.subject,
      body: input.body,
      timeoutExpress: "90m",
    },
  })) as AlipayTradePrecreateResult;

  if (result.code !== "10000" || !result.qrCode) {
    throw new Error(
      `[${result.code}] ${result.subMsg ?? result.msg ?? "Failed to create Alipay order"}`,
    );
  }

  return result.qrCode;
}

export async function queryAlipayOrder(outTradeNo: string) {
  const alipay = getAlipayClient();

  const result = (await alipay.exec("alipay.trade.query", {
    bizContent: {
      outTradeNo,
    },
  })) as AlipayTradeQueryResult;

  return result;
}

export function isAlipayTradePaid(tradeStatus?: string) {
  return tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED";
}
