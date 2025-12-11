import { axiosInstance } from '../lib/axios.js';

export const buildCacheConfig = (url, params) => ({
  url,
  method: 'get',
  params,
});

export const buildAxiosCacheOptions = (options = {}) => {
  if (!options || typeof options !== 'object') {
    return undefined;
  }

  const { force = false, ttl, enabled } = options;
  const cacheOptions = {};

  if (enabled === false) {
    cacheOptions.enabled = false;
  }

  if (force) {
    cacheOptions.force = true;
  }

  if (Number.isFinite(ttl)) {
    cacheOptions.ttl = ttl;
  }

  return Object.keys(cacheOptions).length ? cacheOptions : undefined;
};

export const hasCachedResponse = (cacheConfig, cacheOptions) => {
  if (!cacheConfig) {
    return false;
  }

  const cachingEnabled = cacheOptions?.enabled !== false;
  if (!cachingEnabled || cacheOptions?.force) {
    return false;
  }

  return Boolean(axiosInstance.cache?.peek?.(cacheConfig));
};

export const createAxiosRequestConfig = (cacheOptions, baseConfig = {}) => {
  if (!cacheOptions) {
    return baseConfig;
  }

  return {
    ...baseConfig,
    cache: cacheOptions,
  };
};
