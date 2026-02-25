const Service = require("../models/service");

exports.getServices = (req, res, next) => {
  Service.find().then((services) => {
    // Group by category
    const categories = {};
    const categoryOrder = ['Photography', 'Chefs', 'Massage', 'Training', 'Make-up', 'Hair', 'Spa treatments', 'Catering', 'Nails', 'Prepared meals'];

    categoryOrder.forEach(cat => {
      const items = services.filter(s => s.category === cat);
      if (items.length > 0) {
        categories[cat] = items;
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
