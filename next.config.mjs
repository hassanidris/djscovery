/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "d21buns5ku92am.cloudfront.net" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.sndcdn.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.kfs.io" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.gstatic.com" },
      { protocol: "https", hostname: "imgproxy.ra.co" },
      { protocol: "https", hostname: "cdn.mos.cms.futurecdn.net" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "media.wonderlandmagazine.com" },
      { protocol: "https", hostname: "www.rollingstone.com" },
      { protocol: "https", hostname: "djmag.com" },
      { protocol: "https", hostname: "djlifemag.com" },
      { protocol: "https", hostname: "taogroup.com" },
      { protocol: "https", hostname: "theplayground.co.uk" },
      { protocol: "https", hostname: "www.b4l.cz" },
      { protocol: "https", hostname: "www.discoverbenelux.com" },
      { protocol: "https", hostname: "assets.podomatic.net" },
      { protocol: "https", hostname: "jarmybsjvztwrmsdcnje.supabase.co" },
      { protocol: "https", hostname: "unrqebwfdfumpjgvavbk.supabase.co" },
      { protocol: "https", hostname: "*.tiktokcdn.com" },
      { protocol: "https", hostname: "*.tiktokcdn-eu.com" },
      { protocol: "https", hostname: "*.tiktokcdn-us.com" },
      { protocol: "https", hostname: "*.tiktokcdn-asia.com" },
      { protocol: "https", hostname: "*.tiktok.com" },
      { protocol: "https", hostname: "*.vimeocdn.com" },
    ],
  },
};

export default nextConfig;
