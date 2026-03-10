export interface TenantConfig {
  id: string
  url: string
  tokenKey?: string
  hasToken: boolean
}

export interface TenantConfigsResponse {
  tenantConfigs: TenantConfig[]
}
