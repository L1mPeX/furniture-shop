# 🪑 Furniture Shop

A simple furniture store web application built with **Node.js** and **Express.js**, using server-side rendering and session-based cart management.

## 📦 Features

- 🛒 Add/remove items to/from cart
- 🔐 Authentication system
- 📄 Server-side rendering with EJS
- 🪑 Product catalog from local data
- 💼 Static assets and views structured for clean development

## 🧱 Project Structure

```
furniture-shop/
│
├── public/             # Static files (CSS, images, JS)
├── views/              # EJS templates
├── data/               # Product and user data
├── app.js              # Main Express server file
├── auth.js             # Auth routes/middleware
├── cart.js             # Cart logic and routes
├── package.json        # Project metadata and dependencies
└── package-lock.json   # Dependency lock file
````

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/L1mPeX/furniture-shop.git
   cd furniture-shop
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the application:

   ```bash
   node app.js
   ```

4. Open your browser and go to:

   ```
   http://localhost:3000
   ```

## 📝 License

This project is licensed under the MIT License.
