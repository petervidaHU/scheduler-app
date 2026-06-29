import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: {
    // Enable middleware support (required for remix-i18next v7 middleware API)
    v8_middleware: true,
  },
} satisfies Config;
