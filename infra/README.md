# Infrastructure — Ask Your Twin Demo

Bicep template and deploy script to provision Azure resources for the **Ask Your Twin** digital-twin chat demo.

## Prerequisites

| Requirement | Notes |
|---|---|
| [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) ≥ 2.50 | `az --version` |
| Logged in | `az login` |
| Active subscription | `az account show` |
| Bicep CLI (bundled with Azure CLI) | `az bicep version` |

## What it creates

| Resource | Purpose |
|---|---|
| **Azure OpenAI** (S0) | GPT-4o model for the chat API |
| **Azure Static Web App** (Standard) | Hosts the Next.js front-end |

## Usage

```bash
# Minimal — uses defaults (eastus2, prefix "asktwin")
./infra/deploy.sh my-demo-rg

# Custom location and prefix
./infra/deploy.sh my-demo-rg westus2 mytwin
```

### Parameters

| # | Name | Required | Default |
|---|---|---|---|
| 1 | `RESOURCE_GROUP` | ✅ | — |
| 2 | `LOCATION` | — | `eastus2` |
| 3 | `NAME_PREFIX` | — | `asktwin` |

The script will:

1. Create the resource group (if it doesn't exist).
2. Deploy the Bicep template (`main.bicep`).
3. Retrieve the OpenAI API key.
4. Configure the Static Web App with the correct environment variables.
5. Write a `demo/.env.local` file for local development.

## Local development

After deploying, start the Next.js dev server:

```bash
cd demo
npm install
npm run dev
```

The `.env.local` file created by the deploy script provides the required environment variables.

## Tear down

Delete everything in one command:

```bash
az group delete --name my-demo-rg --yes --no-wait
```
