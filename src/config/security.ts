import helmet from "helmet";
import type { HelmetOptions } from "helmet";

// Helmet configuration for security headers
export const helmetConfig: Readonly<HelmetOptions> = {
  // Content Security Policy - controls what resources can be loaded
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from same origin by default
      scriptSrc: ["'self'"], // Only allow scripts from same origin
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (needed for some frameworks)
      imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URIs, and HTTPS
      connectSrc: ["'self'"], // API calls only to same origin
      fontSrc: ["'self'"], // Fonts from same origin
      objectSrc: ["'none'"], // Disallow plugins like Flash
      mediaSrc: ["'self'"], // Media from same origin
      frameSrc: ["'none'"], // Disallow iframes
      upgradeInsecureRequests: [], // Upgrade HTTP to HTTPS automatically
    },
  },

  // Strict-Transport-Security - forces HTTPS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Allow browser preload lists
  },

  // X-Frame-Options - prevents clickjacking
  frameguard: {
    action: "deny", // Completely deny framing
  },

  // X-Content-Type-Options - prevents MIME type sniffing
  noSniff: true,

  // X-DNS-Prefetch-Control - controls DNS prefetching
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options - prevents IE from executing downloads
  ieNoOpen: true,

  // X-Permitted-Cross-Domain-Policies - restricts Adobe Flash/PDF
  permittedCrossDomainPolicies: {
    permittedPolicies: "none",
  },

  // Referrer-Policy - controls referrer information
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },

  // X-XSS-Protection - enables XSS filter (legacy browsers)
  xssFilter: true,
};

export default helmet(helmetConfig);
