/// <reference path="../.astro/types.d.ts" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  IMAGES_BUCKET: R2Bucket;
  ADMIN_PASSWORD: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
