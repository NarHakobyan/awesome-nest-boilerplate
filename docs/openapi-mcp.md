# OpenAPI MCP Integration

Turn your NestJS boilerplate's REST API into a set of tools that any AI assistant (Claude Desktop, Claude Code, Cursor, Windsurf, etc.) can call directly — with zero code changes to the boilerplate.

This guide shows you how to wire up the **OpenAPI MCP server** so your AI client can discover, document, and invoke every endpoint defined in your Swagger spec.

- [OpenAPI MCP Integration](#openapi-mcp-integration)
  - [Overview](#overview)
  - [What is the OpenAPI MCP?](#what-is-the-openapi-mcp)
  - [How It Works With This Boilerplate](#how-it-works-with-this-boilerplate)
  - [Prerequisites](#prerequisites)
  - [Replace the Placeholder URL](#replace-the-placeholder-url)
    - [Examples of Valid Spec URLs](#examples-of-valid-spec-urls)
  - [Client Configuration](#client-configuration)
    - [Claude Desktop](#claude-desktop)
    - [Claude Code](#claude-code)
    - [Cursor](#cursor)
    - [Windsurf and Other MCP Clients](#windsurf-and-other-mcp-clients)
  - [Authenticated Endpoints (JWT)](#authenticated-endpoints-jwt)
  - [Verifying the Connection](#verifying-the-connection)
  - [Troubleshooting](#troubleshooting)
  - [Security Considerations](#security-considerations)
  - [Self-Hosting the MCP Server](#self-hosting-the-mcp-server)
  - [Related Documentation](#related-documentation)

## Overview

The **Model Context Protocol (MCP)** is an open standard that lets AI assistants talk to external tools and data sources through a uniform interface. Instead of copy-pasting API requests into a chat window, an MCP-enabled assistant can call your API itself — it sees the endpoints, knows the parameters, and handles the request/response cycle natively.

The **OpenAPI MCP** bridge takes any OpenAPI (Swagger) spec URL and automatically exposes every route as a callable MCP tool. Point it at this boilerplate's `/documentation-json` endpoint and your AI assistant immediately knows how to create users, log in, fetch posts, and anything else your API supports.

## What is the OpenAPI MCP?

A hosted Cloudflare Worker at:

```
https://openapi-mcp.hr-drone.workers.dev/mcp
```

It accepts a `?spec=<url>` query parameter pointing to a live OpenAPI JSON document. On connection, it:

1. Fetches your OpenAPI spec.
2. Parses each path + method into a typed MCP tool (name, description, parameters, response schema).
3. Forwards tool calls from the AI client to your real API, returning the results back through the protocol.

Because it is a standard remote MCP server, any MCP-compatible client can consume it using the `mcp-remote` adapter.

## How It Works With This Boilerplate

```
┌──────────────┐   MCP     ┌─────────────┐   HTTPS    ┌─────────────────┐   HTTP    ┌────────────────┐
│  AI Client   │ ────────▶ │ mcp-remote  │ ─────────▶ │ OpenAPI MCP     │ ────────▶ │ NestJS API     │
│ (Claude/etc) │           │ (local npx) │            │ (CF Worker)     │           │ /documentation │
└──────────────┘           └─────────────┘            └─────────────────┘           │       -json    │
                                                              │                     └────────────────┘
                                                              │ parses spec
                                                              ▼
                                                       generates tools
```

This boilerplate **already exposes** the required endpoints — no code changes needed. Swagger is configured in `src/setup-swagger.ts` and publishes:

- `GET /documentation` — Swagger UI (human-readable)
- `GET /documentation-json` — OpenAPI spec (what the MCP consumes)
- `GET /documentation-yaml` — OpenAPI spec in YAML

As long as you boot the app with `ENABLE_DOCUMENTATION=true` and the MCP Worker can reach your server over HTTPS, everything just works.

## Prerequisites

- **Node.js ≥ 18** on the machine running the AI client (needed for `npx` to execute the `mcp-remote` adapter).
- **A reachable OpenAPI JSON URL** — either a deployed instance or a local tunnel (ngrok, Cloudflare Tunnel, localtunnel, etc.). The hosted MCP Worker cannot see `http://localhost` on your machine.
- **`ENABLE_DOCUMENTATION=true`** in your `.env` (or equivalent environment) so that Swagger is actually mounted.
- **An MCP-compatible AI client**: Claude Desktop, Claude Code, Cursor, Windsurf, or any client that accepts a `command` + `args` style MCP server definition.

## Replace the Placeholder URL

> **Important**
>
> Every configuration snippet below contains the placeholder URL
> **`https://api.hrdrone.am/documentation-json`**.
> **You must replace it with your own OpenAPI JSON URL** before the MCP will work with your API. If you copy the snippet as-is, your AI assistant will end up talking to an unrelated demo API.

### Examples of Valid Spec URLs

| Scenario                          | Spec URL                                               |
| --------------------------------- | ------------------------------------------------------ |
| Local development                 | `http://localhost:3000/documentation-json`             |
| Local dev via ngrok tunnel        | `https://<subdomain>.ngrok.app/documentation-json`     |
| Local dev via Cloudflare Tunnel   | `https://<name>.trycloudflare.com/documentation-json`  |
| Staging                           | `https://staging.example.com/documentation-json`       |
| Production                        | `https://api.example.com/documentation-json`           |

> The MCP Worker fetches the spec **server-to-server**, so a plain `http://localhost:3000` URL will not work from a hosted client. Use a tunnel for local testing, or deploy the boilerplate to a reachable host.

## Client Configuration

Every client uses the same underlying command — `npx -y mcp-remote <url>` — just inside different config files.

### Claude Desktop

Edit `claude_desktop_config.json`:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "OpenAPI": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://openapi-mcp.hr-drone.workers.dev/mcp?spec=https://api.hrdrone.am/documentation-json"
      ]
    }
  }
}
```

Save the file and **fully quit** Claude Desktop (Cmd/Ctrl+Q — closing the window is not enough) before reopening.

### Claude Code

Create or edit `.mcp.json` at the root of your project (committable, shared with teammates) or `~/.claude.json` for a user-level config:

```json
{
  "mcpServers": {
    "OpenAPI": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://openapi-mcp.hr-drone.workers.dev/mcp?spec=https://api.hrdrone.am/documentation-json"
      ]
    }
  }
}
```

Then run `claude mcp list` in your terminal to confirm Claude Code picked it up.

### Cursor

Create `.cursor/mcp.json` at the root of your project (per-project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "OpenAPI": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://openapi-mcp.hr-drone.workers.dev/mcp?spec=https://api.hrdrone.am/documentation-json"
      ]
    }
  }
}
```

Open Cursor → Settings → MCP to verify the server appears and is healthy.

### Windsurf and Other MCP Clients

Any MCP client that accepts a `command` + `args` server definition can use the exact same block. Drop it into the client's MCP config file under its `mcpServers` (or equivalent) key. If your client only supports remote servers directly (no `mcp-remote` adapter needed), point it at:

```
https://openapi-mcp.hr-drone.workers.dev/mcp?spec=https://api.hrdrone.am/documentation-json
```

## Authenticated Endpoints (JWT)

This boilerplate uses JWT Bearer authentication for protected routes (see [API Documentation → Authentication](./api-documentation.md#authentication)). There are two common patterns for making authenticated calls through the MCP:

1. **Chat-driven login flow.** Ask your AI assistant to call `POST /auth/login` first. It will receive a token in the response and include it in subsequent calls when you instruct it to ("use that token on the next requests"). This is the simplest option for interactive exploration.

2. **Pre-baked token.** If you already have a long-lived token, you can tell the assistant to include an `Authorization: Bearer <token>` header on every tool call. Some clients let you persist headers per MCP server — check your client's docs.

Because the MCP Worker forwards the OpenAPI spec's security definitions (`bearerAuth`), well-behaved clients will recognize protected endpoints and prompt for credentials as needed.

## Verifying the Connection

1. Start your NestJS app with docs enabled:

   ```bash
   ENABLE_DOCUMENTATION=true pnpm start:dev
   ```

2. Confirm the spec is live:

   ```bash
   curl -s http://localhost:3000/documentation-json | head -c 200
   ```

   You should see JSON starting with `{"openapi":"3.0.0",...`.

3. If testing locally, start a tunnel and update the MCP config URL to the tunnel host.

4. Fully restart your AI client.

5. In the AI client, ask:

   > "List the tools exposed by the OpenAPI MCP server."

   The assistant should enumerate tools such as `getUsers`, `createPost`, `authLogin`, `getHealth`, etc. — one per endpoint in your spec.

6. Smoke test an unauthenticated route:

   > "Call the health endpoint via the OpenAPI MCP."

   You should see a response like `{"status":"ok"}`.

## Troubleshooting

| Symptom                                         | Likely Cause & Fix                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Failed to fetch spec` / `spec not found`       | Spec URL is wrong or unreachable from the internet. Check `ENABLE_DOCUMENTATION=true` and that the URL resolves from a browser on another network. |
| No tools appear in the AI client                | JSON syntax error in the config, or the client wasn't fully restarted. Validate with `jq . < claude_desktop_config.json` and relaunch.             |
| First call hangs for 10–30 s                    | `npx -y mcp-remote` is downloading on first invocation. Subsequent launches are fast.                                                              |
| All tool calls return `401 Unauthorized`        | The route requires auth. Log in via the MCP first or supply a Bearer token (see [Authenticated Endpoints](#authenticated-endpoints-jwt)).          |
| `ECONNREFUSED` / `connect EHOSTUNREACH`         | You passed a `http://localhost:...` URL to a remote Worker. Use a tunnel or deployed URL instead.                                                  |
| Tools appear but calls fail with `CORS error`   | CORS is not the issue here — the Worker fetches server-side. Check your app's firewall, rate limit, or `Helmet` CSP settings.                      |
| `mcp-remote` command not found                  | Ensure Node.js ≥ 18 is on `PATH`. `npx` ships with Node and should resolve `mcp-remote` automatically.                                             |
| Stale tools after API changes                   | The spec is fetched on MCP (re)connect. Restart the AI client to refresh.                                                                          |

## Security Considerations

Exposing an OpenAPI spec through a public MCP server is convenient but carries risk. Treat it with the same caution as exposing Swagger UI itself.

- **Never point production traffic at `/documentation-json` without auth.** The spec reveals every route, parameter, and response shape. Disable it in production by setting `ENABLE_DOCUMENTATION=false`, or protect it behind a gateway / basic auth / IP allow-list.
- **The hosted MCP Worker is a third party.** Every tool call passes through Cloudflare first. For sensitive workloads, [self-host the MCP](#self-hosting-the-mcp-server) instead.
- **Rate limit your API.** The boilerplate already ships with a configurable throttler (`THROTTLE_TTL`, `THROTTLE_LIMIT`) — keep it enabled so that a misbehaving AI client cannot hammer your endpoints.
- **Scope tokens narrowly.** If you pass a JWT to the MCP, use a short-lived, low-privilege token. Never hand over an admin refresh token.
- **Audit logs.** Review your API logs after an MCP session to make sure the assistant called only the routes you intended.

## Self-Hosting the MCP Server

If you would rather not depend on the hosted Cloudflare Worker, the OpenAPI MCP bridge can be deployed to your own infrastructure. Host it next to your NestJS app (or behind the same VPN) and point clients at your private URL:

```
https://mcp.internal.example.com/mcp?spec=https://api.internal.example.com/documentation-json
```

The client-side configuration is identical — only the hostname changes. This keeps both the spec and the tool-call traffic entirely within your own network boundary.

## Related Documentation

- [API Documentation](./api-documentation.md) — endpoint reference, authentication, DTOs.
- [Getting Started](./getting-started.md) — running the boilerplate locally.
- [Deployment](./deployment.md) — hosting the API so the MCP Worker can reach it.
