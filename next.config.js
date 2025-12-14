/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    // Fix for mapbox-gl
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Exclude mapbox-gl and react-map-gl from server-side bundle
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push('mapbox-gl', 'react-map-gl')
      } else {
        config.externals = [config.externals, 'mapbox-gl', 'react-map-gl']
      }
    }
    
    return config
  },
}

module.exports = nextConfig


