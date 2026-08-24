# Security Specification & Threat Model

## 1. Data Invariants
- **Products**:
  - Anyone can read products.
  - Only authenticated admins can create, update, or delete products.
  - Names, descriptions, and image URLs must have strict size and format bounds.
  - Price must be a positive number.
- **Orders**:
  - Any customer can submit an order with required customer contact info, valid item list, positive total, and initial status of `'pending'`.
  - Orders cannot be tampered with or deleted by unauthorized clients.
  - Only admins can read all orders and update order status (e.g., 'processing', 'completed', 'cancelled').
- **Admins**:
  - Whitelist document under `/admins/{adminId}` determines admin role.
  - Pre-seeded admin: `kevvprojects@gmail.com`.
  - Non-admins cannot elevate their privileges or create admin records.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Product Creation**: Malicious actor attempts `POST /products/bad-item` with custom fake pricing.
2. **Product Price Negative Override**: Attacker attempts to update a product price to `-50.00`.
3. **Product Massive Description Injection**: Attacker injects a 5MB payload into product description.
4. **Order Status Escalation**: Unauthenticated customer attempts to create order directly with `status: 'completed'`.
5. **Order Deletion Attack**: Malicious customer attempts to delete order records from `/orders/{id}`.
6. **Order Ghost Field Injection**: Attacker sends unexpected admin fields in order payload (`isAdminApproved: true`).
7. **Admin Privilege Escalation**: Regular user attempts `PUT /admins/{uid}` with `{ role: 'superadmin' }`.
8. **Admin Impersonation via Spoofed Email**: Attacker with unverified email attempts admin read.
9. **Order Empty Items Array Attack**: Malicious order created with empty items list or missing total.
10. **ID Poisoning Attack**: Attacker attempts to write to a document with invalid characters or 5000 character ID.
11. **Client Timestamp Manipulation**: Client passes manipulated future timestamp.
12. **Blanket Collection Scrape**: Unauthorized client tries to list entire `/admins` collection.
