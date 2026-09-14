const mongoose = require('mongoose');
const Home = require("../models/home");

exports.getAddHome = (req, res, next) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home to StayAway",
    currentPage: "addHome",
    editing: false,
    home: {},
    isLoggedIn: req.isLoggedIn 
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  if (!homeId || !mongoose.Types.ObjectId.isValid(homeId)) {
    return res.redirect("/host/host-home-list");
  }

  Home.findById(homeId).lean().then((home) => {
    if (!home) {
      console.log("Home not found for editing:", homeId);
      return res.redirect("/host/host-home-list");
    }

    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
    });
  }).catch((err) => {
    console.error("Error while fetching home for editing:", err);
    next(err);
  });
};

exports.getHostHomes = (req, res, next) => {
  Home.find().lean().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
    });
  }).catch((err) => {
    console.error("Error while fetching host homes:", err);
    next(err);
  });
};

exports.postAddHome = async (req, res, next) => {
  const { houseName, price, location, rating, photoUrl, description } = req.body;

  try {
    const numPrice = Number(price);
    const numRating = Number(rating);

    if (!houseName || isNaN(numPrice) || numPrice <= 0 || !location) {
      return res.redirect("/host/add-home");
    }

    const home = new Home({
      houseName: houseName.trim(),
      price: numPrice,
      location: location.trim(),
      rating: isNaN(numRating) ? 0 : Math.min(5, Math.max(0, numRating)),
      photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() : '',
      description: typeof description === 'string' ? description.trim() : '',
    });
    await home.save();
    console.log("Home Saved successfully:", home._id);
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.error("Error while saving home: ", err);
    next(err);
  }
};

exports.postEditHome = async (req, res, next) => {
  const { id, houseName, price, location, rating, photoUrl, description } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.redirect("/host/host-home-list");
  }

  try {
    const numPrice = Number(price);
    const numRating = Number(rating);

    const updateData = {
      houseName: typeof houseName === 'string' ? houseName.trim() : '',
      location: typeof location === 'string' ? location.trim() : '',
      photoUrl: typeof photoUrl === 'string' ? photoUrl.trim() : '',
      description: typeof description === 'string' ? description.trim() : ''
    };

    if (!isNaN(numPrice) && numPrice > 0) {
      updateData.price = numPrice;
    }
    if (!isNaN(numRating)) {
      updateData.rating = Math.min(5, Math.max(0, numRating));
    }

    const result = await Home.findByIdAndUpdate(id, updateData, { new: true });
    console.log("Home updated:", result?._id || id);
    res.redirect("/host/host-home-list");
  } catch (err) {
    console.error("Error while updating home: ", err);
    next(err);
  }
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;

  if (!homeId || !mongoose.Types.ObjectId.isValid(homeId)) {
    return res.redirect("/host/host-home-list");
  }

  console.log("Came to delete:", homeId);
  Home.findByIdAndDelete(homeId)
    .then(() => {
      console.log("Home deleted successfully:", homeId);
      res.redirect("/host/host-home-list");
    })
    .catch((error) => {
      console.error("Error while deleting home:", error);
      next(error);
    });
};