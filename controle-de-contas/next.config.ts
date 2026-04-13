import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Pacotes com binários nativos — não bundlar, copiar para standalone/node_modules
  serverExternalPackages: ["mysql2", "bcryptjs", "iron-session"],

  // Next.js 16: já fora do bloco experimental
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/mysql2/**",
      "./node_modules/bcryptjs/**",
      "./node_modules/iron-session/**",
    ],
  },

  // Cabeçalhos de segurança HTTP aplicados em todas as rotas
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",   // remova unsafe-inline ao adicionar nonces
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
