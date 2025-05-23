import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',      // Debe coincidir con el esquema de tu URL
        hostname: 'i.imgur.com',// Dominio que quieres permitir
        port: '',               // Usualmente vacío si no usas puerto explícito
        pathname: '/**',        // Permite cualquier ruta bajo ese dominio
        search: '',             // Sin querystring obligatorio
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        port: '',
        pathname: '/**',
        search: '',           
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
        search: '',           
      },
      {
        protocol: 'https',
        hostname: 'dryofg8nmyqjw.cloudfront.net',
        port: '',
        pathname: '/**',
        search: '',           
      }
    ],
  },
}

export default nextConfig;
