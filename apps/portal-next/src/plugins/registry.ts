// Frontend Plugin Registry
// Mirrors backend services/plugin_loader.py — loads UI components for active plugins

export interface FrontendPlugin {
  name: string
  enabled: boolean
  component?: React.ComponentType
}

// Registered frontend plugins — add entries as plugins grow
export const pluginRegistry: FrontendPlugin[] = [
  { name: 'ai-assistant', enabled: true },
  { name: 'analytics',    enabled: true },
  { name: 'cms_core',     enabled: true },
  { name: 'payments',     enabled: false }, // not yet implemented
  { name: 'whatsapp',     enabled: true },
]

export function getActivePlugins(): FrontendPlugin[] {
  return pluginRegistry.filter(p => p.enabled)
}
