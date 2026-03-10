# Dynatrace Insights for Jira

> **⚠️ Note: This product is not officially supported by Dynatrace.**
>
> This is an open-source community project and is not affiliated with, endorsed by, or supported by Dynatrace LLC. Use at your own risk.

## Overview

Dynatrace Insights for Jira is an Atlassian Forge app that brings Dynatrace observability data directly into Jira issues. Run DQL (Dynatrace Query Language) queries and visualize the results as charts — all without leaving Jira.

## Features

- **DQL Query Editor** — Write and execute DQL queries with syntax validation and autocomplete.
- **Chart Visualization** — View query results as line or bar charts powered by ECharts.
- **Multi-Tenant Support** — Connect to multiple Dynatrace environments and switch between them.
- **Configurable Timeframes** — Select predefined timeframes for your queries.
- **Per-Issue Configuration** — Save query and chart settings to individual Jira issues.
- **Admin Configuration** — Manage Dynatrace tenant connections and API tokens from a dedicated admin page.
- **Secure Token Storage** — API tokens are stored using Forge's encrypted secret storage.

## Requirements

- [Atlassian Forge CLI](https://developer.atlassian.com/platform/forge/set-up-forge/) installed and configured.
- Node.js (see Forge docs for the supported version).
- A Dynatrace environment with an API token that has the `storage:events:read`, `storage:metrics:read`, and `storage:logs:read` scopes (or equivalent DQL access).

## Dev mode

1. **Install top-level dependencies:**

   ```sh
   npm install
   ```

2. **Install and run the Activity Panel UI:**

   ```sh
   cd static/activity-panel
   npm install
   npm run watch
   ```

3. **Install and build the Config Panel UI:**

   ```sh
   cd static/config-panel
   npm install
   npm run build
   ```

4. **Start Forge tunnel:**

   ```sh
   forge tunnel
   ```

## Project Structure

```text
├── manifest.yml              # Forge app manifest
├── src/
│   ├── index.js              # Resolver entry point
│   ├── resolvers/            # Backend resolvers
│   │   ├── tenant-config.js  # Tenant CRUD & connection testing
│   │   ├── fetch-dql-data.js # DQL query execution & polling
│   │   ├── autocomplete-dql.js # DQL autocomplete
│   │   └── issue-properties.js # Jira issue property storage
│   └── utils/                # Shared utilities
├── static/
│   ├── activity-panel/       # Issue activity panel (React + TypeScript)
│   └── config-panel/         # Admin configuration page (React + TypeScript)
```

## Tech Stack

- **Platform:** Atlassian Forge (Custom UI)
- **Frontend:** React, TypeScript, Tailwind CSS, Atlassian Design System (`@atlaskit`), ECharts
- **Backend:** Node.js (Forge Functions), `@forge/api`

## Notes

- Use `forge deploy` to persist code changes.
- Use `forge install` to install the app on a new site. Once installed, subsequent deploys are picked up automatically.
- Use `forge tunnel` during development for live reloading of backend resolvers.

## License

This project is provided as-is under an open-source license. See [LICENSE](LICENSE) for details.
