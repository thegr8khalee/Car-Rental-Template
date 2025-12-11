const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

const CACHE_META_KEY = Symbol('axios-cache-meta');

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url ?? '');

const normalizeUrl = (instance, config) => {
  const baseURL = config.baseURL ?? instance.defaults.baseURL ?? '';
  const requestUrl = config.url ?? '';

  if (!baseURL) {
    return requestUrl;
  }

  if (isAbsoluteUrl(requestUrl)) {
    return requestUrl;
  }

  try {
    return new URL(requestUrl, baseURL).toString();
  } catch {
    const trimmedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const trimmedUrl = requestUrl.startsWith('/')
      ? requestUrl.slice(1)
      : requestUrl;
    return `${trimmedBase}/${trimmedUrl}`;
  }
};

const stableStringify = (value) => {
  if (value === null) {
    return 'null';
  }

  const valueType = typeof value;

  if (valueType === 'undefined') {
    return 'undefined';
  }

  if (valueType === 'number' && Number.isNaN(value)) {
    return 'NaN';
  }

  if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }

  if (value instanceof URLSearchParams) {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (valueType === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
};

const getHeader = (headers = {}, name) => {
  const headerName = Object.keys(headers).find(
    (key) => key?.toLowerCase() === name
  );
  return headerName ? headers[headerName] : undefined;
};

const buildCacheKey = (instance, config) => {
  const url = normalizeUrl(instance, config);
  const params = config.params ?? undefined;
  const paramsKey = params
    ? config.paramsSerializer?.serialize
      ? config.paramsSerializer.serialize(params)
      : stableStringify(params)
    : '';

  return `${(config.method ?? 'get').toLowerCase()}::${url}?${paramsKey}`;
};

const isEntryExpired = (entry) => Date.now() - entry.timestamp > entry.ttl;

const shouldUseCache = (config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (method !== 'get') {
    return false;
  }

  if (config.cache?.enabled === false) {
    return false;
  }

  const cacheControl = getHeader(config.headers, 'cache-control');
  if (!cacheControl) {
    return true;
  }

  return !/(no-cache|no-store)/i.test(cacheControl);
};

const cloneCachedResponse = (cachedEntry, config) => ({
  data: cachedEntry.data,
  status: cachedEntry.status,
  statusText: cachedEntry.statusText,
  headers: cachedEntry.headers,
  config,
  request: cachedEntry.request,
  fromCache: true,
});

export const setupAxiosCache = (axiosInstance, options = {}) => {
  const cacheStore = new Map();
  const defaultTtl = options.ttl ?? DEFAULT_TTL;

  const buildKey = (config) => buildCacheKey(axiosInstance, config);

  const touch = (key, response, ttl) => {
    cacheStore.set(key, {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      request: response.request,
      timestamp: Date.now(),
      ttl,
    });
  };

  axiosInstance.interceptors.request.use((config) => {
    if (!shouldUseCache(config)) {
      return config;
    }

    const key = buildKey(config);
    const forceRefresh = config.cache?.force === true;
    const ttl = config.cache?.ttl ?? defaultTtl;
    const cached = cacheStore.get(key);

    if (!forceRefresh && cached) {
      if (!isEntryExpired(cached)) {
        config.adapter = () =>
          Promise.resolve(cloneCachedResponse(cached, config));
        return config;
      }
      cacheStore.delete(key);
    }

    config[CACHE_META_KEY] = { key, ttl };
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      Object.defineProperty(response, 'fromCache', {
        value: response.fromCache ?? false,
        enumerable: false,
        configurable: true,
        writable: true,
      });

      if (!shouldUseCache(response.config)) {
        return response;
      }

      const meta = response.config[CACHE_META_KEY];
      if (meta) {
        touch(meta.key, response, meta.ttl);
        delete response.config[CACHE_META_KEY];
      }

      response.fromCache = response.fromCache || false;
      return response;
    },
    (error) => {
      const config = error?.config;
      if (config && config[CACHE_META_KEY]) {
        delete config[CACHE_META_KEY];
      }
      return Promise.reject(error);
    }
  );

  const invalidate = (predicate) => {
    if (typeof predicate !== 'function') {
      cacheStore.clear();
      return;
    }

    for (const [key, entry] of cacheStore.entries()) {
      if (predicate(key, entry)) {
        cacheStore.delete(key);
      }
    }
  };

  axiosInstance.cache = {
    clear: () => cacheStore.clear(),
    delete: (key) => cacheStore.delete(key),
    invalidateByUrl: (matcher) => {
      invalidate((key) =>
        typeof matcher === 'string' ? key.includes(matcher) : matcher.test(key)
      );
    },
    entries: () => Array.from(cacheStore.entries()),
    size: () => cacheStore.size,
    peek: (config) => {
      const key = buildKey(config);
      const entry = cacheStore.get(key);
      if (!entry) {
        return undefined;
      }

      if (isEntryExpired(entry)) {
        cacheStore.delete(key);
        return undefined;
      }

      return entry;
    },
    buildKey,
  };

  return axiosInstance;
};

export default setupAxiosCache;
export const DEFAULT_CACHE_TTL = DEFAULT_TTL;
