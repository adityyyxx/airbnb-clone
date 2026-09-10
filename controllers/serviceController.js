const Service = require("../models/service");

exports.getServices = (req, res, next) => {
  Service.find().lean().then((services) => {
    // Group by category
    const categoryOrder = ['Photography', 'Chefs', 'Massage', 'Training', 'Make-up', 'Hair', 'Spa treatments', 'Catering', 'Nails', 'Prepared meals'];

    const grouped = {};
    for (const s of services) {
      (grouped[s.category] ||= []).push(s);
    }

    const categories = {};
    categoryOrder.forEach(cat => {
      if (grouped[cat]?.length) {
        categories[cat] = grouped[cat];
      }
    });

    res.render("store/services", {
      categories: categories,
      categoryOrder: Object.keys(categories),
      pageTitle: "Services",
      currentPage: "services",
      isLoggedIn: req.isLoggedIn,
    });
  });
};
