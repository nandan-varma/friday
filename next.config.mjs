/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pino", "pino-pretty"],

  experimental: {
    optimizePackageImports: ["@radix-ui/react-*", "lucide-react", "recharts"],
  },
};

export default nextConfig;
