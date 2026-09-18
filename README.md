# FELINE INDIA

FELINE INDIA is a responsive pharmaceutical e-commerce demo built with React, Tailwind CSS, Express, and SQLite via Prisma.

## Prerequisites

- Node.js 18+
- npm 9+

## Install

1. Open the project folder in VS Code.
2. Run:
   ```bash
   npm install
   ```
3. Create a local environment file:
   ```bash
   copy .env.example .env
   ```
   On Linux/macOS use:
   ```bash
   cp .env.example .env
   ```
4. Update the values in `.env` if needed.

## Run the app

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Seeded admin login

The seed script creates the default admin account automatically when the app is started or when you run:

```bash
npm run seed
```

Login credentials:

- Email: `admin@felineindia.com`
- Password: `admin123`

## Seed data included

- 1 demo medicine: `Paracetamol 500mg`
- 1 demo category: `Pain Relief`
- 1 homepage banner
- 1 sample coupon code: `FIRST10`
- Admin account

## Notes

- SQLite is the default database for local development.
- Products, banners, coupons, messages, reviews, and orders are stored locally in `server/prisma/dev.db`.
- The app includes a non-intrusive disclaimer banner reminding users to consult a medical practitioner before taking medicines.

## Admin panel

Visit `http://localhost:5173/admin` and log in with the admin credentials above to add medicines, categories, coupons, banners, and manage orders.

## Free public deployment

The repository includes `render.yaml` for a free Render web service. Create a GitHub repository from this folder, connect it to Render, and choose **Blueprint** deployment. Render will build and serve both the storefront and API from one service.

The free service may sleep when unused, and its local SQLite database is suitable for a demo but may reset when the service is redeployed. The backend source and admin panel remain under your control in this repository.
