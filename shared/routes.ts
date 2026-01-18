import { z } from 'zod';
import { insertTryOnSchema, tryOns } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  tryOns: {
    list: {
      method: 'GET' as const,
      path: '/api/try-ons',
      responses: {
        200: z.array(z.custom<typeof tryOns.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/try-ons/:id',
      responses: {
        200: z.custom<typeof tryOns.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/try-ons',
      input: insertTryOnSchema,
      responses: {
        201: z.custom<typeof tryOns.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    status: {
      method: 'GET' as const,
      path: '/api/try-ons/:id/status',
      responses: {
        200: z.object({
          status: z.enum(['pending', 'processing', 'completed', 'failed']),
          resultImage: z.string().optional().nullable(),
          error: z.string().optional().nullable(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type TryOnInput = z.infer<typeof api.tryOns.create.input>;
export type TryOnResponse = z.infer<typeof api.tryOns.create.responses[201]>;
