import NodeCache from 'node-cache';

// Cache for 5 minutes by default
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const getCache = (key: string) => {
  return cache.get(key);
};

export const setCache = (key: string, value: any, ttl?: number) => {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};

export const deleteCache = (key: string) => {
  cache.del(key);
};

export const clearCache = () => {
  cache.flushAll();
};

export default cache;
