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

The shopping assistant calls the backend. To enable a free LLM-backed chatbot, add these variables to `backend/.env`:

```env
HF_API_TOKEN=your_huggingface_token
HF_CHAT_MODEL=google/gemma-2-2b-it
```

If `HF_API_TOKEN` is not set, the assistant still works with a local recommendation fallback based on your catalog, price, rating, and keyword matching.

## Notes

- The frontend expects the backend API to be running.
- Authentication state and cart data are currently stored in the browser.
