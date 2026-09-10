const Experience = require("../models/experience");
const cache = require("../utils/cacheUtil");

// Cache TTL: 30 minutes (experiences change only when new ones are hosted)
const EXPERIENCES_CACHE_TTL = 30 * 60; // 30 minutes in seconds
const EXPERIENCES_CACHE_KEY = "experiences:catalogue";

/**
 * Invalidate experiences catalogue cache.
 */
const invalidateExperienceCache = () => {
  cache.del(EXPERIENCES_CACHE_KEY);
};

/**
 * WHAT IS CACHED:
 * - Grouped categories and categoryOrder from Experience.find().lean().
 * - Key: "experiences:catalogue".
 * - TTL: 30 minutes.
 * 
 * WHY SAFE TO CACHE:
 * - Experiences catalogue is public to all visitors.
 * - Saves database trips and sorting/grouping computations.
 * 
 * INVALIDATION:
 * - Automatically invalidated in postAddExperience when a new experience is added.
 */
exports.getExperiences = async (req, res, next) => {
  try {
    const { categories, categoryOrder } = await cache.getOrSet(
      EXPERIENCES_CACHE_KEY,
      EXPERIENCES_CACHE_TTL,
      async () => {
        const experiences = await Experience.find().lean();
        const predefinedOrder = [
          'Adventure', 'Food & Drink', 'Art & Culture', 
          'Wellness', 'Nature', 'Music', 'Sports', 'Nightlife'
        ];

        const grouped = {};
        for (const e of experiences) {
          (grouped[e.category] ||= []).push(e);
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

    res.render("store/experiences", {
      categories: categories,
      categoryOrder: categoryOrder,
      pageTitle: "Experiences",
      currentPage: "experiences",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error fetching experiences: ", err);
    next(err);
  }
};

// Render form to add a new experience (uncached form view)
exports.getAddExperience = (req, res, next) => {
  res.render('store/add-experience', {
    pageTitle: 'Add Experience',
    currentPage: 'add-experience',
    isLoggedIn: req.isLoggedIn,
  });
};

// CACHE INVALIDATION POINT: Adding a new experience clears the experiences catalogue cache
exports.postAddExperience = (req, res, next) => {
  const { title, host, category, price, duration, location, rating, photoUrl, description, isPopular, maxGuests } = req.body;
  const newExp = new Experience({
    title,
    host,
    category,
    price,
    duration,
    location,
    rating,
    photoUrl,
    description,
    isPopular: isPopular === 'on' || isPopular === true,
    maxGuests,
  });
  newExp.save()
    .then(() => {
      // Invalidate experiences cache immediately so new experience shows up on reload
      invalidateExperienceCache();
      res.redirect('/experiences');
    })
    .catch(err => {
      console.log('Error saving experience:', err);
      next(err);
    });
};

exports.invalidateExperienceCache = invalidateExperienceCache;
