const Experience = require("../models/experience");

exports.getExperiences = (req, res, next) => {
  Experience.find().then((experiences) => {
    // Group by category
    const categories = {};
    const categoryOrder = [
      'Adventure', 'Food & Drink', 'Art & Culture', 
      'Wellness', 'Nature', 'Music', 'Sports', 'Nightlife'
    ];

    categoryOrder.forEach(cat => {
      const items = experiences.filter(e => e.category === cat);
      if (items.length > 0) {
        categories[cat] = items;
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
      res.redirect('/experiences');
    })
    .catch(err => {
      console.log('Error saving experience:', err);
      next(err);
    });
};
