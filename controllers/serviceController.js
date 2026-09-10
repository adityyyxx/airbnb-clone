const Service = require("../models/service");
const cache = require("../utils/cacheUtil");

// Cache TTL: 12 hours (services are static curated offerings that rarely change)
const SERVICES_CACHE_TTL = 12 * 60 * 60; // 12 hours in seconds
const SERVICES_CACHE_KEY = "services:catalogue";

/**
 * Invalidate service cache if services are updated, added, or deleted.
 */
const invalidateServiceCache = () => {
  cache.del(SERVICES_CACHE_KEY);
};

/**
 * WHAT IS CACHED:
 * - The processed categories object and categoryOrder array derived from Service.find().lean().
 * - Key: "services:catalogue".
 * - TTL: 12 hours.
 * 
 * WHY SAFE TO CACHE:
 * - Services are public and identical for all visitors.
 * - Caching eliminates both the MongoDB query and the looping/grouping CPU cycles on every request.
 * 
 * WHY USER AUTH IS PRESERVED:
 * - req.isLoggedIn and session data are injected into the EJS template dynamically per-request.
 */
exports.getServices = async (req, res, next) => {
  try {
    const { categories, categoryOrder } = await cache.getOrSet(
      SERVICES_CACHE_KEY,
      SERVICES_CACHE_TTL,
      async () => {
        const services = await Service.find().lean();
        const predefinedOrder = [
          'Photography', 'Chefs', 'Massage', 'Training', 'Make-up',
          'Hair', 'Spa treatments', 'Catering', 'Nails', 'Prepared meals'
        ];

        const grouped = {};
        for (const s of services) {
          (grouped[s.category] ||= []).push(s);
        }

        const filteredCategories = {};
        predefinedOrder.forEach(cat => {
          if (grouped[cat]?.length) {
            filteredCategories[cat] = grouped[cat];
          }
        });

        return {
          categories: filteredCategories,
          categoryOrder: Object.keys(filteredCategories)
        };
      }
    );

    res.render("store/services", {
      categories: categories,
      categoryOrder: categoryOrder,
      pageTitle: "Services",
      currentPage: "services",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error fetching services: ", err);
    next(err);
  }
};

exports.invalidateServiceCache = invalidateServiceCache;
