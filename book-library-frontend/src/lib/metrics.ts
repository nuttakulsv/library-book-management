import { Registry, collectDefaultMetrics } from 'prom-client';

// ใช้ global เพื่อไม่ให้ register ซ้ำตอน hot reload
const globalForMetrics = globalThis as unknown as { registry?: Registry };

function getRegistry(): Registry {
  if (globalForMetrics.registry) {
    return globalForMetrics.registry;
  }
  const registry = new Registry();
  registry.setDefaultLabels({ app: 'book-library-frontend' });
  collectDefaultMetrics({ register: registry });
  globalForMetrics.registry = registry;
  return registry;
}

export async function getMetrics(): Promise<string> {
  const registry = getRegistry();
  return registry.metrics();
}
