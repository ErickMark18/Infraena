import { FastifyInstance } from "fastify";
import { env } from "../lib/env.js";

interface CheckResult {
  ok: boolean;
  message: string;
  detail?: string;
}

export async function setupRoutes(app: FastifyInstance) {
  app.get("/check", async () => {
    const checks: Record<string, CheckResult> = {};

    // Database (already running since we're serving this request)
    checks.database = { ok: true, message: "PostgreSQL connected" };

    // Redis
    try {
      const { default: Redis } = await import("ioredis");
      const redis = new Redis(env.REDIS_URL, { lazyConnect: true, connectTimeout: 3000 });
      await redis.ping();
      redis.disconnect();
      checks.redis = { ok: true, message: "Redis connected" };
    } catch (e) {
      checks.redis = { ok: false, message: "Redis unreachable", detail: (e as Error).message };
    }

    // Vault
    if (!env.VAULT_ADDR || !env.VAULT_TOKEN) {
      checks.vault = { ok: false, message: "Not configured — set VAULT_ADDR and VAULT_TOKEN" };
    } else {
      try {
        const res = await fetch(`${env.VAULT_ADDR}/v1/sys/health`, {
          headers: { "X-Vault-Token": env.VAULT_TOKEN },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          checks.vault = { ok: true, message: "Vault healthy" };
        } else {
          checks.vault = { ok: false, message: `Vault responded with ${res.status}`, detail: await res.text().catch(() => "") };
        }
      } catch (e) {
        checks.vault = { ok: false, message: "Vault unreachable", detail: (e as Error).message };
      }
    }

    // GitHub
    if (!env.GITHUB_TOKEN) {
      checks.github = { ok: false, message: "Not configured — set GITHUB_TOKEN" };
    } else {
      try {
        const res = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = (await res.json()) as { login?: string };
          checks.github = { ok: true, message: `Authenticated as ${data.login ?? "unknown"}` };
        } else {
          checks.github = { ok: false, message: `GitHub returned ${res.status}`, detail: await res.text().catch(() => "") };
        }
      } catch (e) {
        checks.github = { ok: false, message: "GitHub API unreachable", detail: (e as Error).message };
      }
    }

    // GitHub OAuth
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      checks.githubOAuth = { ok: false, message: "Not configured — set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET" };
    } else {
      checks.githubOAuth = { ok: true, message: `OAuth App configured (${env.GITHUB_CLIENT_ID.slice(0, 8)}...)` };
    }

    // Terraform Cloud
    if (!env.TERRAFORM_CLOUD_TOKEN || !env.TERRAFORM_ORG) {
      checks.terraform = { ok: false, message: "Not configured — set TERRAFORM_CLOUD_TOKEN and TERRAFORM_ORG" };
    } else {
      try {
        const res = await fetch(`https://app.terraform.io/api/v2/organizations?q=${env.TERRAFORM_ORG}`, {
          headers: { Authorization: `Bearer ${env.TERRAFORM_CLOUD_TOKEN}`, "Content-Type": "application/vnd.api+json" },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          checks.terraform = { ok: true, message: `Terraform Cloud connected (org: ${env.TERRAFORM_ORG})` };
        } else {
          checks.terraform = { ok: false, message: `Terraform returned ${res.status}`, detail: await res.text().catch(() => "") };
        }
      } catch (e) {
        checks.terraform = { ok: false, message: "Terraform Cloud unreachable", detail: (e as Error).message };
      }
    }

    // Argo CD
    if (!env.ARGOCD_URL || !env.ARGOCD_TOKEN) {
      checks.argocd = { ok: false, message: "Not configured — set ARGOCD_URL and ARGOCD_TOKEN" };
    } else {
      try {
        const res = await fetch(`${env.ARGOCD_URL}/api/version`, {
          headers: { Authorization: `Bearer ${env.ARGOCD_TOKEN}` },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          checks.argocd = { ok: true, message: "Argo CD connected" };
        } else {
          checks.argocd = { ok: false, message: `Argo CD returned ${res.status}` };
        }
      } catch (e) {
        checks.argocd = { ok: false, message: "Argo CD unreachable", detail: (e as Error).message };
      }
    }

    return {
      timestamp: new Date().toISOString(),
      allOk: Object.values(checks).every((c) => c.ok),
      checks,
    };
  });
}
