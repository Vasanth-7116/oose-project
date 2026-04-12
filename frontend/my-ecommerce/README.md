# ShopEase Frontend

React + Vite frontend for the ShopEase e-commerce project.

## Features

- Product listing and product details pages
- Cart and checkout flow
- Login and registration
- Profile management with saved delivery addresses
- Order history for customers
- Admin product and order management

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build locally

## Environment

Create a `.env` file in this folder if you want to override the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Notes

- The frontend expects the backend API to be running.
- Authentication state and cart data are currently stored in the browser.
