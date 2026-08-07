import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    // Keep Turbopack rooted at this app (avoids picking up lockfiles above the project)
    root: process.cwd(),
  },
};

export default withNextIntl(nextConfig);
