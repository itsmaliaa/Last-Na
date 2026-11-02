# Red Nexus

Red Nexus is a React and TypeScript prototype for a CAFA fine-art marketplace. It includes buyer, seller, and admin workspaces with local browser storage for demo data.

## Requirements

- Node.js and npm

## Getting started

```bash
npm install
npm run dev
```

Vite starts the app at [http://localhost:3000](http://localhost:3000). To create a production build, run:

```bash
npm run build
```

Run the TypeScript check with:

```bash
npm run lint
```

To preview a production build locally:

```bash
npm run preview
```

## Demo accounts

The app seeds local demo accounts in the browser:

| Workspace | Email | Password |
|---|---|---|
| Buyer | `customer@rednexus.local` | `CustomerDemo123!` |
| Seller | `seller@rednexus.local` | `SellerDemo123!` |
| Admin | `admin@rednexus.local` | `AdminDemo123!` |

These credentials are for local demonstration only. Local authentication is not production authentication and does not provide server-side access control.
Only buyer accounts can register. Seller and admin accounts are pre-made; Admin's seller approval, rejection, suspension, removal, strikes, and bans are linked to local sign-in access.

## Workspaces

- **Buyer:** browse approved artwork, manage a cart, place order requests, view order milestones, contact sellers, use Help & Support FAQs and chat with admins, submit reviews, and request returns/refunds.
- **Seller:** submit artwork for admin review, manage listings and stock, fulfill orders, provide tracking and delivery proof, respond to customer messages, and review sales.
- **Admin:** review and approve or reject artwork, manage users, answer buyer Help & Support chats, view the sales ledger, and publish homepage marketing promotions.

The app stores shared workflow data—including orders, artwork, conversations, refund requests, promotions, vouchers, and buyer accounts—in `localStorage`. Changes can be observed by other tabs on the **same origin**. Different hosts or ports have separate browser storage and do not synchronize.

## Prototype limitations

This project is not connected to a production backend, payment gateway, or carrier tracking service. Maya and GCash selections do not process payments; buyers and sellers must coordinate payment and delivery outside the app.

Some workflows remain incomplete and should not be treated as production-ready:

- Buyer conversations are filtered by the signed-in buyer's account email; legacy conversations without an identifiable buyer email are not shown.
- Help & Support requests and admin replies are saved with other conversations in browser `localStorage` and synchronize only between tabs on the same origin; they are not a live, cross-device support service.
- Seller inventory management shows only the signed-in seller's approved artwork.
- Checkout rechecks and reserves approved stock, and serializes simultaneous checkouts across tabs on the same origin when the browser supports the Web Locks API. This does not provide production-grade inventory locking across devices or separate origins; that requires a backend.
- Seller-created vouchers are scoped to that seller's artwork; checkout revalidates the code, applies the discount to order and seller transaction totals, and increments its redemption count when the order is saved.
- Admin customer records are loaded from registered buyer accounts, and completed acquisition counts are based on saved seller transactions.
- Admin can suspend or remove seller and buyer accounts. Suspended accounts cannot sign in; removed pre-made accounts are not automatically recreated. Existing orders and artwork are retained when an account is removed.
- Review completion is derived from saved artwork review records, rather than a separate browser flag.
- Buyer product reviews are separate from refund requests: unreviewed completed orders remain in Review until reviewed. Refund requests are available for three days after delivery and do not change the Review list.
- Buyer Completed shows all orders the seller marked delivered; the separate Review tab continues to list only completed orders the buyer has not yet reviewed.
- Some admin dashboard totals and export actions are placeholder behavior.
- Homepage marketing is managed in Admin; seller promotions were removed from the seller navigation.

Local browser storage is not a secure or shared database. Do not use real credentials, payment information, or other sensitive customer data with this prototype.
