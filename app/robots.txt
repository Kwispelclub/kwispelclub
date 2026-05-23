import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/account',
          '/admin',
          '/verkoper/dashboard',
          '/kapsalons/dashboard',
          '/checkout',
          '/auth',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://kwispelclub.be/sitemap.xml',
  }
}
