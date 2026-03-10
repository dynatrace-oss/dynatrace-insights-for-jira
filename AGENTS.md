# Dynatrace Insights for Jira

## Scenario

The **Dynatrace Insights for Jira** project is a Jira plugin that integrates Dynatrace metrics and insights into Jira tickets. It allows users to:
The main idea is to have in Jira issues a Activity panel that connects to Dynatrace and allows users to run DQL queries and visualize the results directly within the Jira issue.

Main features:

- Connect to Dynatrace environment using API token.
- Run DQL (Dynatrace Query Language) queries to fetch metrics and insights.
- Visualize query results using bar and line chart.
- Autocomplete for DQL queries to assist users in writing valid queries.
- Validate DQL queries and highlight errors.
- Store configuration per ticket using Jira issue properties.
- Admin configuration page to configure tenants with API tokens.

This project is built using Atlassian Forge with a Custom UI powered by React and TypeScript.

## Tech stack

- Frontend: React, TypeScript, Atlassian UI Kit, Tailwind CSS, echarts-for-react.

## Code Style

You should split code into multiple files and modules to improve readability and maintainability.
You should use descriptive names for variables, functions, classes, and modules to enhance code clarity.
