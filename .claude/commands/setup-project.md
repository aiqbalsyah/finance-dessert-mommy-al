# CERBREC-UI: Setup Project — Configure name, tagline, description, backend URL

Configure the project identity and generate the project context doc. This replaces `pnpm setup:project` with full doc generation.

## Step 0: Read Current State

Read these files to understand the current configuration:

1. `.env.local` — current environment variables
2. `docs/01-project-context.md` — current project context
3. `CLAUDE.md` — current project header

## Step 1: Ask for Project Details

Ask the user for ALL of the following in a single message. Show current values from `.env.local` as defaults:

1. **App name** — shown in UI, sidebar header, metadata (default: `Cerbrec Base UI`)
2. **App tagline** — shown in sidebar header below name (default: `Dashboard`)
3. **App description** — shown in metadata, landing page (default: empty)
4. **Backend API URL** — backend server URL (default: `http://localhost:8000`)

Wait for the user to respond before proceeding.

## Step 2: Update Configuration Files

After getting all values, update these files:

### `.env.local`

```
BACKEND_API_URL={backendUrl}
NEXT_PUBLIC_APP_NAME={appName}
NEXT_PUBLIC_APP_TAGLINE={appTagline}
NEXT_PUBLIC_APP_DESCRIPTION={appDescription}
```

### `package.json`

Update only the `name` field to the slugified app name (lowercase, hyphens, no special chars):
- "Cerbrec Base UI" → `cerbrec-base-ui`
- "My Cool App" → `my-cool-app`

## Step 3: Update `docs/01-project-context.md`

Read the current file first, then update these specific sections — keep everything else intact:

- **Overview** section — update the project name and description. Write a full sentence: `{App Name} — {description, or "a modern frontend built with Next.js 16, TypeScript, Tailwind CSS v4, and shadcn/ui."}`
- **Environment Variables** table — keep the table structure, update the **Default** column with the new values for all 4 variables
- **Routes** table — keep as-is, do not modify
- **API Routes** table — keep as-is, do not modify
- **Tech Stack** — keep as-is
- **Fonts** — keep as-is

Do NOT remove or rewrite sections — only update the project identity values.

## Step 4: Update `CLAUDE.md`

Update only the description line (line 3) to reflect the new project name:

```
# CLAUDE.md

{App Name} — Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui.
```

Do NOT change any other section of CLAUDE.md.

## Step 5: Update `README.md`

Update the project header and description:

- `# {App Name}` — update the heading
- First paragraph — update the project description
- Keep all other sections (Tech Stack, Getting Started, Claude Skills, Project Structure, etc.) unchanged

## Step 6: Review

After updating all files, review:

1. **Consistency** — app name matches across `.env.local`, `package.json`, `docs/01-project-context.md`, `CLAUDE.md`, `README.md`
2. **No breakage** — environment variables are correctly formatted
3. **Docs integrity** — routes and API routes tables are unchanged, only project identity values updated

## Step 7: Verify

1. Run `pnpm build 2>&1 | tail -20` to verify build passes
2. Show the user a summary of what was updated:
   - App name, tagline, description, backend URL
   - Files modified: `.env.local`, `package.json`, `docs/01-project-context.md`, `CLAUDE.md`, `README.md`
3. Remind them to run `pnpm dev` to see the changes
