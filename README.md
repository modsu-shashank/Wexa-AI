# StockFlow — Inventory Management System

StockFlow is a full-stack inventory management application built for small businesses and sellers. It helps users manage products, track stock levels, record inventory changes, and identify products that need restocking.

The application supports multiple organizations, with each organization having its own products, inventory records, and workspace settings.

## Features

### Dashboard
- View the total number of active products and units in stock.
- Track the total cost and selling value of inventory.
- Identify products that are out of stock or running low.
- View recent stock movements and products that need restocking.

### Product Management
- Add, view, edit, and delete products.
- Store product names, SKUs, descriptions, quantities, and prices.
- Search products by SKU, name, or description.
- Filter products by stock status.
- Sort products by name, SKU, quantity, cost, and selling price.
- Prevent duplicate SKUs within the same organization.

### Stock Management
- **Receive stock:** Increase inventory when new stock arrives.
- **Dispatch stock:** Reduce inventory when products are sold, shipped, or damaged.
- **Set stock quantity:** Update inventory after a physical stock count.
- Preview quantity changes before saving.
- Prevent stock quantities from becoming negative.
- Record each adjustment with its reason and timestamp.

### Stock History
- View previous stock movements.
- Track the quantity before and after each adjustment.
- Record the quantity change, reason, timestamp, and associated user.

### CSV Export
- Export the inventory list to a CSV file for reporting, accounting, or stocktaking.

### Organization Settings
- Update the organization name.
- Configure the default low-stock threshold.

## Technology Stack

**Frontend**
- React 19
- Vite
- Lucide React
- CSS for responsive layouts and styling

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs for password hashing

**Security and data management**
- Organization-scoped database queries
- SKU uniqueness within each organization
- Password hashing
- Authentication middleware
- CORS and security headers

## Project Structure

```text
StockFlow/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── seed.js
│       └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── services/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- MongoDB running locally or a MongoDB Atlas database

### 1. Set up the backend

Open a terminal and run:

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example` and configure the database connection, JWT secret, and other required environment variables.

If the project includes a working demo-data seeder, run:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API should be available at `http://localhost:5000`, provided the server is configured to use that port.

### 2. Set up the frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal. The development server uses port 3000 if configured accordingly.

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register an organization and its owner.
- `POST /api/auth/login` — Sign in.
- `GET /api/auth/me` — Get the current user's profile and organization.

### Products
- `GET /api/products` — List and search products, with filtering, sorting, and pagination.
- `POST /api/products` — Create a product.
- `GET /api/products/:id` — Get product details and stock history.
- `PUT /api/products/:id` — Update product information.
- `DELETE /api/products/:id` — Delete a product.
- `POST /api/products/:id/adjust-stock` — Receive, dispatch, or set stock quantity.

### Dashboard
- `GET /api/dashboard/stats` — Retrieve inventory statistics, stock alerts, and recent activity.

### Organization Settings
- `GET /api/organization` — Retrieve organization settings.
- `PUT /api/organization` — Update organization settings.

## Future Improvements

Potential additions include supplier management, purchase orders, barcode scanning, automated email alerts, and more detailed inventory reports.

## Author

**Shashank Reddy**
