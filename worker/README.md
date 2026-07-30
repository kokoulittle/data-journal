# Data Journal Admin Worker

This Cloudflare Worker receives entries from `/admin`, checks an admin password, and commits the new entry to `entries/entries.json` in `kokoulittle/data-journal`.

## Create Accounts and Tokens

1. Create a Cloudflare account.
2. Create a GitHub fine-grained personal access token:
   - Resource owner: `kokoulittle`
   - Repository access: only `data-journal`
   - Repository permissions: `Contents` set to `Read and write`
3. Save the token somewhere temporary while you configure the Worker.

## Local Setup

```bash
cd ~/data-journal/worker
npm install
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and set:

```text
ADMIN_PASSWORD="your private admin password"
GITHUB_TOKEN="your GitHub fine-grained token"
```

Run the Worker locally:

```bash
npm run dev
```

The admin page can use the local Worker URL shown by Wrangler, usually:

```text
http://localhost:8787
```

## Deploy to Cloudflare

Log in:

```bash
npx wrangler login
```

Set production secrets:

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GITHUB_TOKEN
```

Deploy:

```bash
npm run deploy
```

Wrangler will print a deployed URL similar to:

```text
https://data-journal-admin.YOUR-SUBDOMAIN.workers.dev
```

Open the live admin page:

```text
https://kokoulittle.github.io/data-journal/admin/
```

Paste the Worker URL, enter the admin password, write the entry, and publish.

## Security Notes

- Do not commit `.dev.vars`.
- Do not put the GitHub token in frontend JavaScript.
- Use a long admin password.
- Keep the GitHub token scoped only to `kokoulittle/data-journal` with `Contents: Read and write`.
