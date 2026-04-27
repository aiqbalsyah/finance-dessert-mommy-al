import * as readline from "node:readline"
import * as fs from "node:fs"
import * as path from "node:path"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || "")
    })
  })
}

async function main() {
  console.log("\n--- Project Setup ---\n")

  const appName = await ask("App name", "Cerbrec Base UI")
  const appTagline = await ask("App tagline", "Dashboard")
  const appDescription = await ask("App description", "")
  const backendUrl = await ask("Backend API URL", "http://localhost:8000")

  rl.close()

  // Update .env.local
  const envPath = path.resolve(".", ".env.local")
  const envContent = [
    `BACKEND_API_URL=${backendUrl}`,
    `NEXT_PUBLIC_APP_NAME=${appName}`,
    `NEXT_PUBLIC_APP_TAGLINE=${appTagline}`,
    `NEXT_PUBLIC_APP_DESCRIPTION=${appDescription}`,
    "",
  ].join("\n")
  fs.writeFileSync(envPath, envContent)
  console.log("\n  Updated .env.local")

  // Update package.json name
  const pkgPath = path.resolve(".", "package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  const slugName = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  pkg.name = slugName
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n")
  console.log("  Updated package.json name → " + slugName)

  console.log("\n  Done! Run `pnpm dev` to start.\n")
}

main()
