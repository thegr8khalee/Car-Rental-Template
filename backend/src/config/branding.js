import { readFileSync, existsSync } from 'fs';
import path from 'path';

const candidatePaths = [
  path.resolve(process.cwd(), 'branding.config.json'),
  path.resolve(process.cwd(), '..', 'branding.config.json'),
];

const brandingPath = candidatePaths.find((p) => existsSync(p));

const typographyDefaults = {
  bodyFont: "'Poppins', sans-serif",
  headingFont: "'Microgramma D Extended', sans-serif",
  bodySize: '16px',
  headingWeight: '600',
  lineHeight: '1.6',
};

const borderRadiusDefaults = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  pill: '9999px',
};

const assetsDefaults = {
  favicon: {
    default: '/vite.svg',
    light: null,
    dark: null,
    appleTouch: null,
  },
};

const sanitizePhoneValue = (value) =>
  value ? String(value).replace(/[^+\d]/g, '') : '';

const normalizePhoneEntry = (entry, fallback = { display: '', value: '' }) => {
  if (!entry) {
    return { ...fallback };
  }

  if (typeof entry === 'string') {
    const sanitized = sanitizePhoneValue(entry);
    return {
      display: entry,
      value: sanitized || fallback.value || '',
    };
  }

  const display = entry.display ?? entry.value ?? fallback.display ?? '';
  const valueSource = entry.value ?? entry.display ?? fallback.value ?? '';

  return {
    display,
    value: sanitizePhoneValue(valueSource) || fallback.value || '',
  };
};

const parseCoordinate = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? numeric : null;
};

let brandingConfig = {
  company: {
    name: 'Your Brand',
    legalName: 'Your Brand Automobile',
  },
  branding: {
    colors: {
      primary: '#f0c710',
      secondary: '#000000',
      accent: '#8a8a8a',
    },
    typography: { ...typographyDefaults },
    borderRadius: { ...borderRadiusDefaults },
  },
};

if (brandingPath) {
  try {
    const raw = readFileSync(brandingPath, 'utf-8');
    const parsed = JSON.parse(raw);
    brandingConfig = parsed;
  } catch (error) {
    console.warn(
      '[branding] Unable to parse branding.config.json. Falling back to defaults.',
      error.message
    );
  }
} else {
  console.warn(
    '[branding] branding.config.json not found. Using fallback branding values.'
  );
}

if (!brandingConfig.branding) {
  brandingConfig.branding = {};
}

brandingConfig.branding.colors = {
  primary: brandingConfig.branding.colors?.primary ?? '#f0c710',
  secondary: brandingConfig.branding.colors?.secondary ?? '#000000',
  accent: brandingConfig.branding.colors?.accent ?? '#8a8a8a',
};

brandingConfig.branding.typography = {
  ...typographyDefaults,
  ...(brandingConfig.branding.typography ?? {}),
};

brandingConfig.branding.borderRadius = {
  ...borderRadiusDefaults,
  ...(brandingConfig.branding.borderRadius ?? {}),
};

brandingConfig.branding.assets = brandingConfig.branding.assets ?? {};

const faviconAsset = brandingConfig.branding.assets.favicon ?? {};

brandingConfig.branding.assets.favicon = {
  default: faviconAsset.default ?? assetsDefaults.favicon.default,
  light: faviconAsset.light ?? null,
  dark: faviconAsset.dark ?? null,
  appleTouch: faviconAsset.appleTouch ?? null,
};

if (!brandingConfig.contact) {
  brandingConfig.contact = {};
}

const defaultEmails = {
  info: 'info@example.com',
  support: 'support@example.com',
  sales: 'sales@example.com',
};

const emails = {
  info: brandingConfig.contact.emails?.info ?? defaultEmails.info,
  support:
    brandingConfig.contact.emails?.support ??
    brandingConfig.contact.emails?.info ??
    defaultEmails.support,
  sales:
    brandingConfig.contact.emails?.sales ??
    brandingConfig.contact.emails?.info ??
    defaultEmails.sales,
};

const defaultPhones = {
  main: { display: '', value: '' },
  support: { display: '', value: '' },
  sales: { display: '', value: '' },
};

const mainPhone = normalizePhoneEntry(
  brandingConfig.contact.phones?.main,
  defaultPhones.main
);

const supportPhone = normalizePhoneEntry(
  brandingConfig.contact.phones?.support,
  mainPhone.value || mainPhone.display ? mainPhone : defaultPhones.support
);

const salesPhone = normalizePhoneEntry(
  brandingConfig.contact.phones?.sales,
  mainPhone.value || mainPhone.display ? mainPhone : defaultPhones.sales
);

const phones = {
  main: mainPhone,
  support: supportPhone,
  sales: salesPhone,
};

const defaultAddress = {
  line1: '',
  line2: '',
  city: '',
  region: '',
  country: '',
  postalCode: '',
  formatted: '',
};

const address = {
  ...defaultAddress,
  ...(brandingConfig.contact.address ?? {}),
};

const hours = (Array.isArray(brandingConfig.contact.hours)
  ? brandingConfig.contact.hours
  : []
)
  .map((entry) => ({
    label: entry?.label ?? '',
    value: entry?.value ?? '',
  }))
  .filter((entry) => entry.label || entry.value);

const location = {
  latitude: parseCoordinate(brandingConfig.contact.location?.latitude),
  longitude: parseCoordinate(brandingConfig.contact.location?.longitude),
};

brandingConfig.contact = {
  emails,
  phones,
  address,
  hours,
  location,
};

export const getBranding = () => brandingConfig;
export default brandingConfig;
