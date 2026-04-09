// ---------------------------------------------------------------------------
// Azure infrastructure for the "Ask Your Twin" demo
//   - Azure OpenAI (GPT-4o)
//   - Azure Static Web App (Next.js)
// ---------------------------------------------------------------------------

@description('Prefix used to derive resource names')
param namePrefix string = 'asktwin'

@description('Location for the Azure OpenAI resource (must support OpenAI kind)')
param location string = 'eastus'

@description('Location for the Static Web App (limited region support)')
param swaLocation string = 'centralus'

// Unique suffix to avoid naming collisions
var uniqueSuffix = uniqueString(resourceGroup().id, namePrefix)
var openAiAccountName = '${namePrefix}-oai-${uniqueSuffix}'
var swaName = '${namePrefix}-swa-${uniqueSuffix}'
var modelDeploymentName = 'gpt-4o'

// ---------------------------------------------------------------------------
// Azure OpenAI
// ---------------------------------------------------------------------------
resource openAi 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: openAiAccountName
  location: location
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    customSubDomainName: openAiAccountName
  }
}

resource gpt4oDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01' = {
  parent: openAi
  name: modelDeploymentName
  sku: {
    name: 'Standard'
    capacity: 10
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o'
      version: '2024-11-20'
    }
  }
}

// ---------------------------------------------------------------------------
// Azure Static Web App
// ---------------------------------------------------------------------------
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: swaName
  location: swaLocation
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    buildProperties: {
      appLocation: 'demo'
      outputLocation: '.next'
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs (no secrets)
// ---------------------------------------------------------------------------
output openAiEndpoint string = openAi.properties.endpoint
output openAiDeploymentName string = gpt4oDeployment.name
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
