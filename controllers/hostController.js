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

  const numPrice = Number(price);
  const numRating = Number(rating);

  const errors = [];
  if (req.uploadError) {
    errors.push(req.uploadError);
  }
  if (!houseName || typeof houseName !== 'string' || !houseName.trim()) {
    errors.push("House name is required.");
  }
  if (!location || typeof location !== 'string' || !location.trim()) {
    errors.push("Location is required.");
  }
  if (isNaN(numPrice) || !isFinite(numPrice) || numPrice < 0) {
    errors.push("Price must be a valid non-negative number.");
  }
  if (isNaN(numRating) || !isFinite(numRating) || numRating < 0 || numRating > 5) {
    errors.push("Rating must be a valid number between 0 and 5.");
  }

  // Determine Image Strategy:
  // 1. Uploaded File (req.file) takes highest priority if provided
  // 2. Photo URL if provided
  // 3. Default image fallback
  let finalPhotoUrl = '';
  if (req.file) {
    finalPhotoUrl = `/uploads/${req.file.filename}`;
  } else if (typeof photoUrl === 'string' && photoUrl.trim()) {
    finalPhotoUrl = photoUrl.trim();
  } else {
    finalPhotoUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
  }

  if (errors.length > 0) {
    return res.status(400).render("host/edit-home", {
      pageTitle: "Add Home to StayAway",
      currentPage: "addHome",
      editing: false,
      home: { houseName, price, location, rating, photoUrl, description },
      isLoggedIn: req.isLoggedIn,
      errorMessage: errors.join(" ")
    });
  }

  try {
    const home = new Home({
      houseName: houseName.trim(),
      price: numPrice,
      location: location.trim(),
      rating: numRating,
      photoUrl: finalPhotoUrl,
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
    return res.status(400).redirect("/host/host-home-list");
  }

  try {
    const existingHome = await Home.findById(id).lean();
    if (!existingHome) {
      return res.status(404).redirect("/host/host-home-list");
    }

    const numPrice = Number(price);
    const numRating = Number(rating);

    const errors = [];
    if (req.uploadError) {
      errors.push(req.uploadError);
    }
    if (!houseName || typeof houseName !== 'string' || !houseName.trim()) {
      errors.push("House name is required.");
    }
    if (!location || typeof location !== 'string' || !location.trim()) {
      errors.push("Location is required.");
    }
    if (isNaN(numPrice) || !isFinite(numPrice) || numPrice < 0) {
      errors.push("Price must be a valid non-negative number.");
    }
    if (isNaN(numRating) || !isFinite(numRating) || numRating < 0 || numRating > 5) {
      errors.push("Rating must be a valid number between 0 and 5.");
    }

    // Determine Image Strategy:
    // 1. Uploaded File (req.file) takes highest priority if provided
    // 2. Newly provided Photo URL (if non-empty)
    // 3. Preserve existing home.photoUrl
    let finalPhotoUrl = existingHome.photoUrl;
    if (req.file) {
      finalPhotoUrl = `/uploads/${req.file.filename}`;
    } else if (typeof photoUrl === 'string' && photoUrl.trim()) {
      finalPhotoUrl = photoUrl.trim();
    }

    if (errors.length > 0) {
      return res.status(400).render("host/edit-home", {
        pageTitle: "Edit your Home",
        currentPage: "host-homes",
        editing: true,
        home: { _id: id, houseName, price, location, rating, photoUrl, description },
        isLoggedIn: req.isLoggedIn,
        errorMessage: errors.join(" ")
      });
    }

    const updateData = {
      houseName: houseName.trim(),
      price: numPrice,
      location: location.trim(),
      rating: numRating,
      photoUrl: finalPhotoUrl,
      description: typeof description === 'string' ? description.trim() : ''
    };

    const result = await Home.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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