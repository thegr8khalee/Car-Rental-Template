import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { BreadcrumbProvider } from './components/BreadCrumbContext.jsx';
import branding from './config/branding.js';

const applyBrandingTheme = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const { colors, typography, borderRadius } = branding.branding;

  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);

  if (typography) {
  root.style.setProperty('--font-body', typography.bodyFont ?? "'Montserrat', sans-serif");
  root.style.setProperty('--font-alt', typography.altFont ?? "'Instrument Sans', sans-serif");
    root.style.setProperty('--font-heading', typography.headingFont ?? "'Microgramma D Extended', sans-serif");
    root.style.setProperty('--font-body-size', typography.bodySize ?? '16px');
    root.style.setProperty('--heading-font-weight', typography.headingWeight ?? '600');
    root.style.setProperty('--line-height-body', typography.lineHeight ?? '1.6');

  document.body.style.fontFamily = typography.bodyFont ?? "'Montserrat', sans-serif";
    document.body.style.fontSize = typography.bodySize ?? '16px';
    document.body.style.lineHeight = typography.lineHeight ?? '1.6';
  }

  if (borderRadius) {
    root.style.setProperty('--radius-sm', borderRadius.sm ?? '0.5rem');
    root.style.setProperty('--radius-md', borderRadius.md ?? '1rem');
    root.style.setProperty('--radius-lg', borderRadius.lg ?? '1.5rem');
    root.style.setProperty('--radius-pill', borderRadius.pill ?? '9999px');
  }

  const computedTitle = branding.company.tagline
    ? `${branding.company.name} - ${branding.company.tagline}`
    : branding.company.name;
  if (computedTitle) {
    document.title = computedTitle;
  }
};

const applyBrandAssets = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const faviconConfig = branding.branding.assets?.favicon ?? {};

  const extensionToMime = (href) => {
    if (!href || typeof href !== 'string') {
      return undefined;
    }

    const normalized = href.toLowerCase();

    if (normalized.endsWith('.png')) {
      return 'image/png';
    }
    if (normalized.endsWith('.ico')) {
      return 'image/x-icon';
    }
    if (
      normalized.endsWith('.svg') ||
      normalized.includes('.svg#svgview(preserveaspectratio(none))')
    ) {
      return 'image/svg+xml';
    }
    return undefined;
  };

  const ensureLink = (rel, attributes) => {
    if (!attributes?.href) {
      return;
    }

    const parts = [`link[rel="${rel}"]`, '[data-branding="true"]'];
    if (attributes.media) {
      parts.push(`[media="${attributes.media}"]`);
    }
    if (attributes.sizes) {
      parts.push(`[sizes="${attributes.sizes}"]`);
    }

    const selector = parts.join('');
    let link = document.head.querySelector(selector);

    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      link.setAttribute('data-branding', 'true');
      document.head.appendChild(link);
    }

    Object.entries(attributes).forEach(([key, value]) => {
      if (value) {
        link.setAttribute(key, value);
      } else {
        link.removeAttribute(key);
      }
    });
    link.href = attributes.href;

    if (!link.getAttribute('type')) {
      const mime = extensionToMime(attributes.href);
      if (mime) {
        link.setAttribute('type', mime);
      }
    }
  };

  const cleanupManagedLinks = () => {
    document.head
      .querySelectorAll('link[data-branding="true"]')
      .forEach((link) => {
        if (!link.getAttribute('rel')) {
          return;
        }
        link.remove();
      });
  };

  cleanupManagedLinks();

  const ensureBaseFavicon = (href) => {
    if (!href) {
      return;
    }

    let baseLink = document.head.querySelector('link[rel="icon"]:not([data-branding])');

    if (!baseLink) {
      baseLink = document.createElement('link');
      baseLink.rel = 'icon';
      document.head.appendChild(baseLink);
    }

    baseLink.href = href;

    const mime = extensionToMime(href);
    if (mime) {
      baseLink.setAttribute('type', mime);
    }
  };

  const defaultHref = faviconConfig.default ?? '/vite.svg';

  ensureBaseFavicon(defaultHref);

  if (faviconConfig.light && faviconConfig.dark) {
    ensureLink('icon', {
      href: faviconConfig.light,
      media: '(prefers-color-scheme: light)',
    });
    ensureLink('icon', {
      href: faviconConfig.dark,
      media: '(prefers-color-scheme: dark)',
    });
  }

  if (faviconConfig.appleTouch) {
    ensureLink('apple-touch-icon', {
      href: faviconConfig.appleTouch,
    });
  }
};

applyBrandingTheme();
applyBrandAssets();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <BreadcrumbProvider>
        <App />
      </BreadcrumbProvider>
    </StrictMode>
  </BrowserRouter>
);
