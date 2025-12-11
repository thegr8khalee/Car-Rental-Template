import rawBranding from '@branding-config';

const withDefaults = (config) => {
  const companyName = config.company?.name ?? 'Your Brand';
  const legalName = config.company?.legalName ?? `${companyName} Automobile`;
  const ceoName = config.company?.ceo?.name ?? 'Your CEO';
  const bioTemplate =
    config.company?.ceo?.bioTemplate ??
    `I am {ceoName}, the CEO of {companyName}. Our team delivers exceptional service and value to our customers.`;

  const inflateTemplate = (template) =>
    template
      .replaceAll('{companyName}', companyName)
      .replaceAll('{legalName}', legalName)
      .replaceAll('{ceoName}', ceoName);

  const colors = {
    primary: config.branding?.colors?.primary ?? '#f0c710',
    secondary: config.branding?.colors?.secondary ?? '#000000',
    accent: config.branding?.colors?.accent ?? '#8a8a8a',
  };

  const defaultTypography = {
    bodyFont: "'Montserrat', sans-serif",
  altFont: "'Instrument Sans', sans-serif",
    headingFont: "'Microgramma D Extended', sans-serif",
    bodySize: '16px',
    headingWeight: '600',
    lineHeight: '1.6',
  };

  const typography = {
    ...defaultTypography,
    ...(config.branding?.typography ?? {}),
  };

  const defaultBorderRadius = {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    pill: '9999px',
  };

  const borderRadius = {
    ...defaultBorderRadius,
    ...(config.branding?.borderRadius ?? {}),
  };

  const defaultAssets = {
    favicon: {
      default: '/vite.svg',
      light: null,
      dark: null,
      appleTouch: null,
    },
  };

  const rawAssets = config.branding?.assets ?? {};
  const faviconAsset = {
    default: rawAssets.favicon?.default ?? defaultAssets.favicon.default,
    light: rawAssets.favicon?.light ?? null,
    dark: rawAssets.favicon?.dark ?? null,
    appleTouch: rawAssets.favicon?.appleTouch ?? null,
  };

  const assets = {
    ...rawAssets,
    favicon: faviconAsset,
  };

  const sanitizePhoneValue = (value) =>
    value ? value.replace(/[^+\d]/g, '') : '';

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

  const defaultEmails = {
    info: 'info@example.com',
    support: 'support@example.com',
    sales: 'sales@example.com',
  };

  const emails = {
    info: config.contact?.emails?.info ?? defaultEmails.info,
    support: config.contact?.emails?.support ?? config.contact?.emails?.info ?? defaultEmails.support,
    sales: config.contact?.emails?.sales ?? config.contact?.emails?.info ?? defaultEmails.sales,
  };

  const defaultPhones = {
    main: { display: '', value: '' },
    support: { display: '', value: '' },
    sales: { display: '', value: '' },
  };

  const mainPhone = normalizePhoneEntry(
    config.contact?.phones?.main,
    defaultPhones.main
  );

  const supportPhone = normalizePhoneEntry(
    config.contact?.phones?.support,
    mainPhone.value || mainPhone.display ? mainPhone : defaultPhones.support
  );

  const salesPhone = normalizePhoneEntry(
    config.contact?.phones?.sales,
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
    ...(config.contact?.address ?? {}),
  };

  const defaultHours = [];

  const hours = (Array.isArray(config.contact?.hours)
    ? config.contact.hours
    : defaultHours
  )
    .map((entry) => ({
      label: entry?.label ?? '',
      value: entry?.value ?? '',
    }))
    .filter((entry) => entry.label || entry.value);

  const parseCoordinate = (value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const numeric = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(numeric) ? numeric : null;
  };

  const location = {
    latitude: parseCoordinate(config.contact?.location?.latitude),
    longitude: parseCoordinate(config.contact?.location?.longitude),
  };

  const defaultFeatures = {
    blog: true,
    rentals: true,
    selling: true,
    admin: true,
    showTestimonials: true,
    showNewsletter: true,
  };

  const features = {
    ...defaultFeatures,
    ...(config.features ?? {}),
  };

  return {
    company: {
      name: companyName,
      legalName,
      tagline: config.company?.tagline ?? '',
      ceo: {
        name: ceoName,
        bio: inflateTemplate(bioTemplate),
      },
      uppercaseName: companyName.toUpperCase(),
    },
    branding: {
      ...config.branding,
      colors,
      typography,
      borderRadius,
      assets,
      logoAlt: config.branding?.logoAlt ?? `${companyName} logo`,
    },
    contact: {
      emails,
      phones,
      address,
      hours,
      location,
    },
    features,
  };
};

const branding = withDefaults(rawBranding);

export default branding;
