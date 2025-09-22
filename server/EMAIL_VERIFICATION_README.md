# 📧 Email Verification System

This document explains how to use the email verification system that has been added to your SynthiSoul backend.

## 🚀 What's Been Added

### New Endpoints

1. **POST `/send-verification`** - Send verification email
2. **GET `/verify-status`** - Check verification status
3. **GET `/verify-email`** - Handle email verification link clicks

### New Files

- `server/utils/emailVerification.ts` - Core verification logic
- `server/test-email-verification.js` - Test script

## 📋 API Documentation

### Send Verification Email

**Endpoint:** `POST /send-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Verification email sent",
  "email": "user@example.com",
  "success": true
}
```

### Check Verification Status

**Endpoint:** `GET /verify-status?email=user@example.com`

**Response:**
```json
{
  "verified": false,
  "email": "user@example.com",
  "timestamp": 1703123456789
}
```

### Email Verification Link

When users click the verification link in their email, they'll be taken to:
`GET /verify-email?token=abc123...`

This endpoint returns an HTML page showing success or failure.

## 🔧 Environment Variables

Add these to your `.env` file:

```env
# Frontend URL for verification links
FRONTEND_URL=https://yourdomain.com

# Email configuration (already exists in your setup)
HOST_EMAIL=your_email@gmail.com
HOST_EMAIL_PASS=your_app_password
EMAIL_PROVIDER=gmail  # or 'smtp'
```

## 🧪 Testing

Run the test script to verify everything works:

```bash
cd server
node test-email-verification.js
```

## 🔄 How It Works

1. **User requests verification**: Frontend calls `/send-verification`
2. **Email sent**: System generates token and sends email with verification link
3. **User clicks link**: Takes them to `/verify-email?token=...`
4. **Verification complete**: Email marked as verified
5. **Status check**: Frontend can call `/verify-status` to check if verified

## 🗄️ Data Storage

Currently uses in-memory storage (Map). In production, you should:

1. **Use a database** (PostgreSQL, MongoDB, etc.)
2. **Store verification tokens** with expiration
3. **Add user management** integration

## 🔒 Security Features

- ✅ Secure random token generation
- ✅ 24-hour token expiration
- ✅ Automatic cleanup of expired tokens
- ✅ Email validation
- ✅ CORS protection

## 🚀 Deployment Steps

1. **Update your Render backend** with these changes
2. **Set environment variables** in Render dashboard
3. **Update FRONTEND_URL** to your actual domain
4. **Test the endpoints** using the test script

## 🔗 Frontend Integration

Your frontend should:

1. Call `/send-verification` when user enters email
2. Show "Check your email" message
3. Periodically call `/verify-status` to check verification
4. Enable features once `verified: true`

## 📝 Example Frontend Code

```javascript
// Send verification email
const sendVerification = async (email) => {
  const response = await fetch('/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};

// Check verification status
const checkStatus = async (email) => {
  const response = await fetch(`/verify-status?email=${email}`);
  return response.json();
};

// Usage
await sendVerification('user@example.com');
const status = await checkStatus('user@example.com');
if (status.verified) {
  // User is verified, enable features
}
```

## 🆘 Troubleshooting

### Email not sending
- Check email credentials in environment variables
- Verify EMAIL_PROVIDER is set correctly
- Check spam folder

### CORS errors
- Verify allowed origins in CORS configuration
- Check if frontend URL is in allowed list

### Verification link not working
- Check FRONTEND_URL environment variable
- Verify token hasn't expired (24 hours)

## 🔮 Future Enhancements

- Database integration
- User registration flow
- Resend verification email
- Email templates customization
- Rate limiting for verification requests
