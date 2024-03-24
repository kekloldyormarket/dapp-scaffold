/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },

  // polyfill for tls
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { tls: require.resolve('tls'),
        net: require.resolve('net'),
        crypto: require.resolve('crypto-browserify'),
        http2: require.resolve('http-browserify'),
        dns: false,
        url: require.resolve('url/'),
        fs: false,
        path: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        util: false,
        assert: false,
        buffer: false,
        os: false,
        constants: false,

      }
    }
    return config
  },
}

module.exports = nextConfig
