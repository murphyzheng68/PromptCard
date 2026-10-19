/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 是原生模块，需要在服务端运行
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = nextConfig;
