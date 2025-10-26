This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## Environment Setup

1. Copy env example to a local env file:

```bash
cp config/env.example .env.local
```

2. Set your Astra DB credentials in `.env.local`:

- `ASTRA_DB_API_URL` – Astra Data API base (e.g. `https://<id>-<region>.apps.astra.datastax.com`)
- `ASTRA_DB_KEYSPACE` – keyspace name (e.g. `onboarding`)
- `ASTRA_DB_APPLICATION_TOKEN` – Astra application token
- `SESSION_SECRET` – random 32+ chars string for signing cookies

3. (Optional) QA Chat API:

- `QA_API_URL` – defaults to hackathon endpoint provided
- `QA_API_KEY` – your API key (will be sent as `api-key` header)

3. Start the app:

```bash
npm run dev
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
