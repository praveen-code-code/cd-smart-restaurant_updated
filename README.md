# Smart Restaurant Management & Marketing Planning System
Node.js + Express + MongoDB (Mongoose), JWT + bcrypt auth, multer image upload, vanilla HTML/CSS/JS frontend.

## Run
1. Install MongoDB locally (or use Atlas) and Node 18+
2. `npm install`
3. `cp .env.example .env` and edit `JWT_SECRET` / `MONGO_URI`
4. `npm run seed` (creates sample menu, offer WEEKEND20, admin `admin@restaurant.com` / `admin123`)
5. `npm start` then open http://localhost:5000

## Included
Customer: menu with search/filter/sort, cart, signup/login, cash-on-delivery checkout with coupon codes, order tracking.
Admin: live dashboard (real-time order feed via Server-Sent Events), Marketing tab (weekly and hourly sales, category revenue, top customers, repeat rate, one-click campaign plans), product CRUD with image upload, order status updates, customers, offers.

## API (test in Postman; send `Authorization: Bearer <token>`)
POST /api/auth/register, /login · GET /api/auth/profile
GET/POST/PUT/DELETE /api/products (POST/PUT accept multipart `image`)
POST /api/orders · GET /api/orders/my-orders · GET /api/orders/:id · PUT /api/orders/:id/status (admin)
GET /api/offers · POST/PUT/DELETE /api/offers (admin)
GET /api/admin/stats · GET /api/admin/users · PUT /api/admin/users/:id

## Not built yet
Wishlist, reviews, notifications, forgot password, online payment, address book. Cart is stored in the browser (localStorage) and totals are recalculated on the server at checkout.
