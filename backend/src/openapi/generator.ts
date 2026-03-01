import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import './paths';

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Alexandria API',
      version: '1.0.0',
      description: 'Learn languages by reading.',
    },
    servers: [{ url: '/' }],
  });
}
