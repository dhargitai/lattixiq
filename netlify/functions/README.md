# Netlify Functions

## Email Reminder Scheduler

The `reminder-scheduler.mjs` function is a Netlify Scheduled Function that runs every 5 minutes to check for users who need email reminders.

### How It Works

1. **Scheduled Execution**: Netlify automatically runs this function every 5 minutes (`@every 5m`)
2. **Authentication**: Uses `CRON_SECRET` to authenticate with the Next.js cron endpoint
3. **Processing**: Calls `/api/notifications/cron` which:
   - Checks all users with reminders enabled
   - Compares current time with their reminder time in their timezone
   - Sends emails to users whose reminder time matches
   - Updates the database with last sent timestamp

### Required Environment Variables

Add these to your Netlify environment variables:

```bash
# Secret key for authenticating cron requests
CRON_SECRET=your-secure-random-string-here

# Your app URL (usually auto-set by Netlify)
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app
```

### Local Testing

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Set up local environment

```bash
# Create .env.local if not exists
echo "CRON_SECRET=test-secret-for-local-dev" >> .env.local
```

#### 3. Test the scheduled function locally

```bash
# Start Next.js dev server (in one terminal)
npm run dev

# In another terminal, run Netlify dev
netlify dev

# Test the function manually
netlify functions:invoke reminder-scheduler
```

#### 4. Test with custom payload

```bash
# Test with next_run timestamp
netlify functions:invoke reminder-scheduler --payload '{"next_run": "2025-01-15T10:00:00Z"}'
```

### Deployment

1. **Push to GitHub**: The function will be automatically deployed with your site
2. **Verify in Netlify Dashboard**:
   - Go to Functions tab
   - You should see `reminder-scheduler` listed
   - Check the logs to confirm it's running

### Monitoring

View function logs in Netlify dashboard:

1. Go to **Functions** → **reminder-scheduler**
2. Click on **Function log** to see execution history
3. Look for success/error messages

### Schedule Options

Current schedule: `@every 5m` (every 5 minutes)

Alternative schedules you can use:

- `@hourly` - Every hour
- `@daily` - Every day at midnight
- `@weekly` - Every week
- `0 */6 * * *` - Every 6 hours (cron syntax)
- `0 9 * * *` - Every day at 9 AM UTC (cron syntax)

### Troubleshooting

1. **Function not appearing in Netlify**:
   - Ensure the file is in `/netlify/functions/`
   - Check that the file has `.mjs` extension
   - Verify `export const config = { schedule: ... }` is present

2. **Authentication errors**:
   - Verify `CRON_SECRET` is set in Netlify environment variables
   - Ensure the same value is used in your Next.js app

3. **Emails not sending**:
   - Check Resend API key is configured
   - Verify user has `reminder_enabled = true`
   - Check user has valid `reminder_time` and `reminder_timezone`
   - Look at Function logs for specific errors

4. **Testing specific scenarios**:

   ```bash
   # Test when no users need reminders
   # (Set all users' reminder_time to future)

   # Test with users ready for reminders
   # (Set a user's reminder_time to current time in their timezone)
   ```

### Important Notes

- The function runs every 5 minutes but only sends emails to users whose exact reminder time matches
- Users will only receive one email per day (tracked by `reminder_last_sent`)
- The function respects user timezones for accurate delivery
- All email sending is handled by the existing `/api/notifications/cron` endpoint
