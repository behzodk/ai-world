/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Avatars are served from pravatar.cc — whitelist it for next/image (and as a courtesy if swapped in later).
    remotePatterns: [{ protocol: "https", hostname: "i.pravatar.cc" }],
  },
};

export default nextConfig;
