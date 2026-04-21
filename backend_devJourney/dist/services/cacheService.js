"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.deleteCache = exports.setCache = exports.getCache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// Cache for 5 minutes by default
const cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
const getCache = (key) => {
    return cache.get(key);
};
exports.getCache = getCache;
const setCache = (key, value, ttl) => {
    if (ttl) {
        cache.set(key, value, ttl);
    }
    else {
        cache.set(key, value);
    }
};
exports.setCache = setCache;
const deleteCache = (key) => {
    cache.del(key);
};
exports.deleteCache = deleteCache;
const clearCache = () => {
    cache.flushAll();
};
exports.clearCache = clearCache;
exports.default = cache;
