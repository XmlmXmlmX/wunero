# Wunero - Authentication Setup Guide

## Overview

Wunero now includes authentication powered by Keycloak and NextAuth.js. This ensures:

- ✅ Only logged-in users can mark items as purchased
- ✅ Only wishlist owners can delete their wishlists
- ✅ Each user has isolated wishlists

## Architecture

### Components

1. **Keycloak** - Identity and Access Management (IAM) provider
2. **NextAuth.js** - Next.js authentication library
3. **Database** - SQLite with user_id field in wishlists table

### Authentication Flow

```
User → Sign In Button → Keycloak → Callback → NextAuth → Session
                                                         ↓
                                                    localStorage/Cookie
```

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the environment variables:

```env
# Generate a secure random key for NEXTAUTH_SECRET
NEXTAUTH_SECRET=<generate-random-string>
NEXTAUTH_URL=http://localhost:3000

KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=master
KEYCLOAK_CLIENT_ID=wunero
KEYCLOAK_CLIENT_SECRET=<get-from-keycloak>
```

### 2. Docker Setup

Start the services:

```bash
docker-compose up -d
```

This will start:
- Keycloak on `http://localhost:8080`
- Wunero on `http://localhost:3000`

### 3. Configure Keycloak

1. **Access Keycloak Admin Console**
   - URL: `http://localhost:8080`
   - Username: `admin`
   - Password: `admin`

2. **Create a Client for Wunero**
   - Go to: Clients → Create
   - Client ID: `wunero`
   - Client Protocol: `openid-connect`
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://localhost:3000/api/auth/callback/keycloak`
   - Save and go to Credentials tab to copy the Client Secret

3. **Enable User Registration** (Optional)
   - Realm Settings → Login tab
   - Enable "User registration"

### 4. Update Environment Variables

Once you have the Client Secret from Keycloak:

```env
KEYCLOAK_CLIENT_SECRET=<copy-from-keycloak>
```

## Usage

### Sign In / Sign Out

- Click the "Sign In" button in the top right
- You'll be redirected to Keycloak
- Create an account or use existing credentials
- After login, you'll see your email and a "Sign Out" button

### Protected Actions

#### Marking Items as Purchased

```typescript
// Only authenticated users can mark items as purchased
const response = await fetch(`/api/wishlists/${id}/items/${itemId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ purchased: true })
});

// Returns 401 if not authenticated
```

#### Deleting Wishlists

```typescript
// Only wishlist owner can delete
const response = await fetch(`/api/wishlists/${id}`, {
  method: 'DELETE'
});

// Returns 403 if not owner or 401 if not authenticated
```

## API Routes

### Public Endpoints

- `GET /api/wishlists/[id]` - View wishlist details
- `GET /api/wishlists/[id]/items` - View items

### Protected Endpoints (Require Authentication)

- `GET /api/wishlists` - Get user's wishlists
- `POST /api/wishlists` - Create new wishlist
- `PATCH /api/wishlists/[id]` - Update wishlist (owner only)
- `DELETE /api/wishlists/[id]` - Delete wishlist (owner only)
- `POST /api/wishlists/[id]/items` - Create item
- `PATCH /api/wishlists/[id]/items/[itemId]` - Update item (purchased status requires auth)

## Security

### Best Practices

1. **NEXTAUTH_SECRET** - Generate using:
   ```bash
   openssl rand -base64 32
   ```

2. **KEYCLOAK_CLIENT_SECRET** - Never commit to repository

3. **Production Deployment**
   - Use strong secrets
   - Set `NEXTAUTH_URL` to your production domain
   - Update Keycloak redirect URIs
   - Use HTTPS only
   - Set `NODE_ENV=production`

## Development

### Testing Authentication Locally

1. Start Docker services: `docker-compose up`
2. Run dev server: `npm run dev`
3. Visit `http://localhost:3000`
4. Click "Sign In"
5. Create test account in Keycloak

### Database Queries

View wishlists for a specific user:

```sql
SELECT * FROM wishlists WHERE user_id = 'user-keycloak-id';
```

## Troubleshooting

### "Invalid redirect_uri" Error

- Ensure Keycloak client valid redirect URIs includes your app URL
- Default: `http://localhost:3000/api/auth/callback/keycloak`

### Sign In Not Working

- Check Keycloak is running: `http://localhost:8080`
- Verify environment variables in `.env.local`
- Check browser console for errors

### Database Migration

The app automatically adds `user_id` field to existing `wishlists` table on first run. Existing wishlists will have `user_id = 'anonymous'`.

## File Structure

```
src/
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── api-auth.ts      # API authentication helpers
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │   └── wishlists/               # Protected endpoints
│   └── layout.tsx       # SessionProvider wrapper
└── components/
    └── atoms/
        └── WuAuthButton/  # Sign in/out button
```

## Next Steps

- [ ] Set up email verification in Keycloak
- [ ] Implement user profile page
- [ ] Add two-factor authentication
- [ ] Set up SAML/LDAP integration
