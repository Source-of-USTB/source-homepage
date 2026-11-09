// Site Configuration
// Centralize all settings here, do not hardcode in components.

export const siteConfig = {
  // Site title — displayed in nav, footer, and page titles
  title: '索思科技协会',

  // Site description — used in meta tags and RSS feed
  description: '索思科技协会成立于1991年，是北京科技大学历史最悠久、影响力深远的学术科技类社团之一。',

  // Author name — used in footer and meta author tag
  author: 'SourceUSTB',

  // Site URL — set before deployment (e.g., https://example.com)
  // Used for RSS feed and SEO
  site: 'https://github.com/Source-of-USTB',

  // HTML lang attribute — affects SEO and accessibility
  lang: 'zh-CN',

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
  },
};

export type SiteConfig = typeof siteConfig;
