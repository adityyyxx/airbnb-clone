const Favourite = require("../models/favourite");
const Home = require("../models/home");
const Booking = require("../models/booking");

exports.getIndex = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find({ houseName: { $not: /treehouse/i } }).lean();
    let favouriteIds = [];
    if (req.isLoggedIn) {
      const favourites = await Favourite.find().lean();
      favouriteIds = favourites.map(f => f.houseId.toString());
    }
    res.render("store/index", {
      registeredHomes: registeredHomes,
      favouriteIds: favouriteIds,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error in getIndex:", err);
    res.redirect("/homes");
  }
};

exports.getHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find().lean();
    let favouriteIds = [];
    if (req.isLoggedIn) {
      const favourites = await Favourite.find().lean();
      favouriteIds = favourites.map(f => f.houseId.toString());
    }
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      favouriteIds: favouriteIds,
      pageTitle: "Homes List",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error in getHomes:", err);
    res.redirect("/");
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const filter = req.session.userRole === 'admin' ? {} : { userId };

    const bookings = await Booking.find(filter)
      .populate('houseId')
      .sort({ createdAt: -1 })
      .lean();

    res.render("store/bookings", {
      bookings: bookings,
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.redirect("/");
  }
};

exports.postAddBooking = async (req, res, next) => {
  const { houseId } = req.body;
  if (houseId) {
    return res.redirect(`/homes/${houseId}`);
  }
  return res.redirect('/homes');
};

exports.postRemoveBooking = (req, res, next) => {
  const bookingId = req.params.bookingId;
  const userId = req.session.userId;
  const filter = req.session.userRole === 'admin' ? { _id: bookingId } : { _id: bookingId, userId };

  Booking.findOneAndDelete(filter)
    .then(() => {
      console.log("Booking cancelled successfully");
    })
    .catch((err) => {
      console.log("Error while cancelling booking: ", err);
    })
    .finally(() => {
      res.redirect("/bookings");
    });
};

exports.getFavouriteList = (req, res, next) => {
  Favourite.find()
  .populate('houseId')
  .lean()
  .then((favourites) => {
    const favouriteHomes = favourites.map((fav) => fav.houseId);
    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.isLoggedIn,
    });
  });
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const isAjax = req.xhr || req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json');

  try {
    let fav = await Favourite.findOne({ houseId: homeId });
    let isFavourite = true;

    if (fav) {
      // Toggle off if already in favourites
      await Favourite.findOneAndDelete({ houseId: homeId });
      isFavourite = false;
    } else {
      fav = new Favourite({ houseId: homeId });
      await fav.save();
      isFavourite = true;
    }

    if (isAjax) {
      return res.json({ success: true, isFavourite });
    }
    res.redirect("/favourites");
  } catch (err) {
    console.log("Error while marking favourite: ", err);
    if (isAjax) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.redirect("/favourites");
  }
};

exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  Favourite.findOneAndDelete({houseId: homeId})
    .then((result) => {
      console.log("Fav Removed: ", result);
    })
    .catch((err) => {
      console.log("Error while removing favourite: ", err);
    })
    .finally(() => {
      res.redirect("/favourites");
    });
};

exports.getHomeDetails = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findById(homeId).lean().then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Home Detail",
        currentPage: "Home",
        isLoggedIn: req.isLoggedIn,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
      });
    }
  });
};