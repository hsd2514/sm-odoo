# OTP Password Reset Setup Guide

## Gmail SMTP Configuration

To enable OTP password reset functionality, you need to configure Gmail SMTP settings.

### Step 1: Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "StockMaster" as the app name
6. Click **Generate**
7. Copy the 16-character app password (you'll need this)

### Step 2: Configure Environment Variables

Create or update your `.env` file in the `backend` directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Important:** 
- Use your Gmail address for `SMTP_USER` and `SMTP_FROM_EMAIL`
- Use the **App Password** (not your regular Gmail password) for `SMTP_PASSWORD`
- The App Password is 16 characters without spaces

### Step 3: Restart Backend Server

After updating the `.env` file, restart your backend server for changes to take effect.

### Testing

1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email for the OTP code
5. Enter the OTP and reset your password

### Troubleshooting

- **"Failed to send OTP email"**: Check that SMTP credentials are correct in `.env`
- **"Authentication failed"**: Make sure you're using an App Password, not your regular password
- **"Connection timeout"**: Check your internet connection and firewall settings

