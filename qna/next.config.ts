import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "./"),
  webpack: (config, { isServer, webpack }) => {
    // Strip "node:" prefix from console imports so Webpack can resolve them
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:console$/, (resource: any) => {
        resource.request = "console";
      })
    );
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "node:console": false,
      console: false,
    };
    return config;
  },
};

export default nextConfig;
