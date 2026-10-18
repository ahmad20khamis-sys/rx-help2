# Prescription help

Colleagues upload an unclear prescription at `/`. You get a Telegram alert, then reply from `/admin`.

## 1. Install
    npm install
    cp .env.example .env.local

## 2. Supabase (database + image storage)
1. Create a free project at supabase.com.
2. SQL Editor -> New query -> paste `supabase/schema.sql` -> Run. This creates the `submissions` table and a private `prescriptions` bucket.
3. Project Settings -> API: copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL` and the `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`. Keep that key secret.

## 3. Telegram bot
1. In Telegram, message @BotFather, send `/newbot`, follow the prompts, and copy the token into `TELEGRAM_BOT_TOKEN`.
2. Open your new bot and press Start (a bot can't message you until you do).
3. Message @userinfobot to get your numeric id, and put it in `TELEGRAM_CHAT_ID`.

## 4. Admin login
Set `ADMIN_PASSWORD` to a long password. Generate `SESSION_SECRET` with `openssl rand -hex 32`.

## 5. Run
    npm run dev
- Upload page: http://localhost:3000
- Admin: http://localhost:3000/admin

Test it: upload an image, check Telegram, then sign in and reply.

## 6. Deploy so colleagues can reach it (Vercel)
1. Push this folder to GitHub and import it on vercel.com.
2. Add every variable from `.env.local` under Project Settings -> Environment Variables.
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL so Telegram links open the right page, then redeploy.
4. Share the root URL with colleagues.

## Notes
- Images are private. You see them through links that expire after an hour.
- The upload page shrinks photos in the browser (max 1800px) to stay under Vercel's 4.5 MB request limit.
- Prescriptions can contain patient data. Follow your institution's privacy rules and ask senders to cover names and IDs.
