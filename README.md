# PixelForge — Cloudflare Workers AI Image Generator

A Next.js image generator using Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`). Deployable to Vercel.

## Features
- Prompt input with 2,048-character limit
- Surprise Me prompt button
- Square (1:1), Shorts/Portrait (9:16), and Landscape (16:9) output crops
- Image preview and PNG download
- API token is used only inside the server route; it is never exposed to the browser
- Friendly setup and API error messages

## 1. Rotate the token you shared
If an API token was pasted into a chat, screenshot, or public place, revoke it in Cloudflare and create a new Workers AI API token. Do not put secrets in source code or commit them to GitHub.

## 2. Get the required Cloudflare values
You need **both**:
- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare Account ID
- `CLOUDFLARE_API_TOKEN`: a new API token with Workers AI permission (Read/Write)

Cloudflare Dashboard → Workers AI → Use REST API is the easiest place to find/create these values.

## 3. Upload to GitHub
1. Extract this ZIP.
2. Create a new GitHub repository.
3. Upload the contents of this folder (the files inside it, not the outer folder).
4. Ensure `.env` or `.env.local` is not uploaded. `.gitignore` already excludes them.

## 4. Deploy to Vercel
1. Sign in to Vercel and choose **Add New → Project**.
2. Import your GitHub repository.
3. Framework preset should be **Next.js**.
4. Before deploying, open **Environment Variables** and add:

| Key | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Your newly generated Workers AI API token |

Add both variables for Production (and Preview/Development if you need those environments). Click **Deploy**.

If you add or change an environment variable after deployment, go to Deployments and redeploy the project for the change to take effect.

## 5. Test
Open the deployed website, enter a prompt, and click **Generate image**. If the app reports an authentication error, check token validity and Workers AI permissions. If it reports account/model not found, re-check the Account ID.

## Local development
```bash
npm install
cp .env.example .env.local
# Fill in your own Cloudflare values in .env.local
npm run dev
```
Open http://localhost:3000.

## Aspect ratio note
FLUX.1 schnell returns its model image output. This app center-crops that output in the browser to the selected 1:1, 9:16, or 16:9 canvas size. It does not stretch the image. Important subjects near the edges may be cropped, so mention "centered subject" in your prompt when useful.

## Model and API
The app calls Cloudflare's REST endpoint from `app/api/generate/route.ts` using `@cf/black-forest-labs/flux-1-schnell`. The Cloudflare token is never sent to the client.
