import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { promisify } from "util";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function parseDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: url.port || "5432",
    database: url.pathname.replace("/", ""),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    sslmode: url.searchParams.get("sslmode") || "require"
  };
}

async function runPgDump(databaseUrl: string) {
  return await new Promise<Buffer>((resolve, reject) => {
    const args = [
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-privileges",
      "--format=plain",
      databaseUrl
    ];

    const child = spawn("pg_dump", args, {
      env: {
        ...process.env,
        PGPASSWORD: parseDatabaseUrl(databaseUrl).password
      },
      shell: true
    });

    const chunks: Buffer[] = [];
    let stderr = "";

    child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `pg_dump failed with exit code ${code}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 400 });
  }

  try {
    const dump = await runPgDump(databaseUrl);
    const filename = `anmol-gadgets-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;

    return new NextResponse(new Blob([dump.toString("utf-8")]), {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export database";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
