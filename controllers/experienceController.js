const Experience = require("../models/experience");

exports.getExperiences = (req, res, next) => {
  Experience.find().lean().then((experiences) => {
    // Group by category
    const categoryOrder = [
      'Adventure', 'Food & Drink', 'Art & Culture', 
      'Wellness', 'Nature', 'Music', 'Sports', 'Nightlife'
    ];

    const grouped = {};
    for (const e of experiences) {
      (grouped[e.category] ||= []).push(e);
    }

    const categories = {};
    categoryOrder.forEach(cat => {
      if (grouped[cat]?.length) {
        categories[cat] = grouped[cat];
      }
    });

    res.render("store/experiences", {
      categories: categories,
      categoryOrder: Object.keys(categories),
      pageTitle: "Experiences",
      currentPage: "experiences",
      isLoggedIn: req.isLoggedIn,
    });
  }).catch(err => {
    console.log("Error fetching experiences: ", err);
    next(err);
  });
};

// Render form to add a new experience
exports.getAddExperience = (req, res, next) => {
  res.render('store/add-experience', {
    pageTitle: 'Add Experience',
    currentPage: 'add-experience',
    isLoggedIn: req.isLoggedIn,
  });
};

// Handle form submission to create a new experience
exports.postAddExperience = (req, res, next) => {
  const { title, host, category, price, duration, location, rating, photoUrl, description, isPopular, maxGuests } = req.body;

  const validCategories = [
    'Adventure', 'Food & Drink', 'Art & Culture', 
    'Wellness', 'Nature', 'Music', 'Sports', 'Nightlife'
  ];

  const safeCategory = validCategories.includes(category) ? category : 'Adventure';
  const numPrice = Number(price);
  const numRating = Number(rating);
  const numGuests = parseInt(maxGuests, 10);

  if (!title || !host || !location || isNaN(numPrice) || numPrice <= 0) {
    return res.redirect('/experiences/add');
  }

  const newExp = new Experience({
    title: title.trim(),
    host: host.trim(),
    category: safeCategory,
    price: numPrice,
    duration: typeof duration === 'string' ? duration.trim() : '1 hour',
    location: location.trim(),
    rating: isNaN(numRating) ? 0 : Math.min(5, Math.max(0, numRating)),
    photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() : '',
    description: typeof description === 'string' ? description.trim() : '',
    isPopular: isPopular === 'on' || isPopular === true,
    maxGuests: isNaN(numGuests) || numGuests < 1 ? 1 : numGuests,
  });

  newExp.save()
    .then(() => {
      res.redirect('/experiences');
    })
    .catch(err => {
      console.error('Error saving experience:', err);
      next(err);
    });
};
