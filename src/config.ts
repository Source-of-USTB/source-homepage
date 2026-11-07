// Site Configuration
// Centralize all settings here, do not hardcode in components.

export const siteConfig = {
  // Site title — displayed in nav, footer, and page titles
  title: '索思科技协会',

  // Site description — used in meta tags and hero section
  description: '北京科技大学下属计算机社团',

  // Author name — used in footer and meta author tag
  author: 'SourceUSTB',

  // Site URL — set before deployment (e.g., https://example.com)
  // Used for RSS feed and SEO
  site: 'https://github.com/Source-of-USTB',

  // HTML lang attribute — affects SEO and accessibility
  lang: 'en',

  // Navigation links — displayed in capsule nav bar
  nav: [
    { title: 'Home', href: '/' },
    { title: 'Blogs', href: '/blogs' },
    { title: 'Gallery', href: '/gallery' },
    { title: 'Members', href: '/members' },
  ],

  // Social links — leave empty to hide
  social: {
    github: 'https://github.com/Source-of-USTB',
  },

  // Feature toggles
  features: {
    readingProgress: true,  // Show reading progress bar on post pages
    backToTop: true,        // Show back to top button
    callout: true,          // Show callout components in blog posts
    lightbox: true,         // Enable image lightbox on click
    rss: true,              // Enable RSS feed
    search: true,           // Enable client-side search (Fuse.js)
  },
};

export type SiteConfig = typeof siteConfig;
