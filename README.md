This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Admin Authentication

This project includes a simple admin authentication flow for routes under `/admin`.

Create a `.env` file in the project root and set:

```bash
ADMIN_PASSWORD=your-strong-password
```

If `ADMIN_PASSWORD` is not set, the app falls back to `admin123` for local development.

### Alipay Checkout

To enable "Buy Now" checkout with Alipay QR payment, set the following in `.env`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
# Optional: use sandbox gateway during development
# ALIPAY_GATEWAY=https://openapi-sandbox.dl.alipaydev.com/gateway.do
```

After opening the payment page from "Buy Now", users can generate an Alipay QR code and the page will automatically redirect to the success page once payment is confirmed.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
