const { performance } = require('perf_hooks');
const Favourite = require("../models/favourite");
const Home = require("../models/home");
const Booking = require("../models/booking");
const mongoose = require('mongoose');

const fetchHomesAndFavourites = async (homeFilter, userId) => {
  const dbFetchStart = performance.now();

  const homeQueryStart = performance.now();
  const homesPromise = Home.find(homeFilter).lean().then(res => {
    const homeQueryTime = performance.now() - homeQueryStart;
    return { res, homeQueryTime };
  });

  const favouriteQueryStart = performance.now();
  const favouritesPromise = (userId ? Favourite.find({ userId }).lean() : Promise.resolve([]))
    .then(res => {
      const favouriteQueryTime = performance.now() - favouriteQueryStart;
      return { res, favouriteQueryTime };
    });

  const [homeData, favouriteData] = await Promise.all([homesPromise, favouritesPromise]);
  const dbTotalTime = performance.now() - dbFetchStart;

  const registeredHomes = homeData.res;
  const favouriteIds = favouriteData.res.map(f => f.houseId.toString());

  return {
    registeredHomes,
    favouriteIds,
    homeQueryTime: homeData.homeQueryTime,
    favouriteQueryTime: favouriteData.favouriteQueryTime,
    dbTotalTime
  };
};

exports.getIndex = async (req, res, next) => {
  try {
    const controllerStartTime = performance.now();
    const middlewareTime = req._startTime
      ? ((req._middlewareEndTime || controllerStartTime) - req._startTime)
      : 0;

    const userLookupTime = global._lastUserLookupTime;
    delete global._lastUserLookupTime;

    const userId = req.session ? req.session.userId : null;
    const { registeredHomes, favouriteIds, homeQueryTime, favouriteQueryTime, dbTotalTime } = await fetchHomesAndFavourites(
      {},
      userId
    );

    const renderStartTime = performance.now();

    res.render("store/index", {
      registeredHomes: registeredHomes,
      favouriteIds: favouriteIds,
      pageTitle: "StayAway Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
    }, (err, html) => {
      if (err) {
        return next(err);
      }
      const ejsRenderTime = performance.now() - renderStartTime;
      const totalTime = req._startTime ? (performance.now() - req._startTime) : (performance.now() - controllerStartTime);

      if (req.path === '/' && req.method === 'GET') {
        console.log("--- MIDDLEWARE PIPELINE BREAKDOWN ---");
        if (req._middlewareTimings && Array.isArray(req._middlewareTimings)) {
          req._middlewareTimings.forEach(item => {
            console.log(`⏱️ ${item.name}: ${item.duration.toFixed(2)} ms`);
          });
        }
        if (typeof userLookupTime === 'number') {
          console.log(`⏱️ User/session lookup (Passport DB): ${userLookupTime.toFixed(2)} ms`);
        }
        console.log(`⏱️ TOTAL Middleware time: ${middlewareTime.toFixed(2)} ms`);
        console.log("--- MONGODB & CONTROLLER BREAKDOWN ---");
        console.log(`⏱️ Home MongoDB query: ${homeQueryTime.toFixed(2)} ms`);
        console.log(`⏱️ Favourite MongoDB query: ${favouriteQueryTime.toFixed(2)} ms`);
        console.log(`⏱️ Database fetching total: ${dbTotalTime.toFixed(2)} ms`);
        console.log(`⏱️ EJS rendering: ${ejsRenderTime.toFixed(2)} ms`);
        console.log(`⏱️ TOTAL GET /: ${totalTime.toFixed(2)} ms`);
        console.log("---------------------------------------");
      }

      res.send(html);
    });
  } catch (err) {
    console.error("Error in getIndex:", err);
    res.redirect("/homes");
  }
};

exports.getHomes = async (req, res, next) => {
  try {
    const { location } = req.query;
    const filter = {};
    if (location && typeof location === 'string' && location.trim()) {
      filter.location = new RegExp(location.trim(), 'i');
    }

    const userId = req.session ? req.session.userId : null;
    const { registeredHomes, favouriteIds } = await fetchHomesAndFavourites(filter, userId);

    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      favouriteIds: favouriteIds,
      pageTitle: location ? `Homes in ${location}` : "Homes List",
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
    const userId = req.session ? req.session.userId : null;
    if (!userId) {
      return res.redirect("/login");
    }
    const filter = req.session?.userRole === 'admin' ? {} : { userId };

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
  if (houseId && mongoose.Types.ObjectId.isValid(houseId)) {
    return res.redirect(`/homes/${houseId}`);
  }
  return res.redirect('/homes');
};

exports.postRemoveBooking = (req, res, next) => {
  const bookingId = req.params.bookingId;
  const userId = req.session ? req.session.userId : null;

  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId) || !userId) {
    return res.redirect("/bookings");
  }

  const filter = req.session?.userRole === 'admin' ? { _id: bookingId } : { _id: bookingId, userId };

  Booking.findOneAndDelete(filter)
    .then(() => {
      console.log("Booking cancelled successfully");
    })
    .catch((err) => {
      console.error("Error while cancelling booking: ", err);
    })
    .finally(() => {
      res.redirect("/bookings");
    });
};

exports.getFavouriteList = async (req, res, next) => {
  try {
    const userId = req.session ? req.session.userId : null;
    if (!userId) {
      return res.redirect("/login");
    }

    const favourites = await Favourite.find({ userId })
      .populate('houseId')
      .lean();

    const favouriteHomes = favourites
      .map((fav) => fav.houseId)
      .filter(Boolean); // Filter out any deleted/orphaned homes

    res.render("store/favourite-list", {
      favouriteHomes: favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.isLoggedIn,
    });
  } catch (err) {
    console.error("Error in getFavouriteList:", err);
    res.redirect("/");
  }
};

exports.postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session ? req.session.userId : null;
  const isAjax = req.xhr || req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json');

  if (!userId) {
    if (isAjax) {
      return res.status(401).json({ success: false, message: 'Authentication required', redirect: '/login' });
    }
    return res.redirect('/login');
  }

  if (!homeId || !mongoose.Types.ObjectId.isValid(homeId)) {
    if (isAjax) {
      return res.status(400).json({ success: false, message: 'Valid Home ID is required' });
    }
    return res.redirect('/homes');
  }

  try {
    const existingFav = await Favourite.findOne({ houseId: homeId, userId });
    let isFavourite = true;

    if (existingFav) {
      // Toggle off if already in user's favourites
      await Favourite.findOneAndDelete({ houseId: homeId, userId });
      isFavourite = false;
    } else {
      try {
        const fav = new Favourite({ houseId: homeId, userId });
        await fav.save();
        isFavourite = true;
      } catch (saveErr) {
        // Handle race condition or duplicate index collision gracefully
        if (saveErr.code === 11000) {
          isFavourite = true;
        } else {
          throw saveErr;
        }
      }
    }

    if (isAjax) {
      return res.json({ success: true, isFavourite });
    }
    res.redirect("/favourites");
  } catch (err) {
    console.error("Error while marking favourite: ", err);
    if (isAjax) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.redirect("/favourites");
  }
};

exports.postRemoveFromFavourite = (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session ? req.session.userId : null;

  if (!homeId || !mongoose.Types.ObjectId.isValid(homeId) || !userId) {
    return res.redirect("/favourites");
  }

  Favourite.findOneAndDelete({ houseId: homeId, userId })
    .then((result) => {
      console.log("Fav Removed: ", result?._id || homeId);
    })
    .catch((err) => {
      console.error("Error while removing favourite: ", err);
    })
    .finally(() => {
      res.redirect("/favourites");
    });
};

exports.getHomeDetails = async (req, res, next) => {
  const homeId = req.params.homeId;

  if (!homeId || !mongoose.Types.ObjectId.isValid(homeId)) {
    return res.redirect("/homes");
  }

  try {
    const homePromise = Home.findById(homeId).lean();
    const userId = req.session ? req.session.userId : null;
    const favPromise = userId 
      ? Favourite.findOne({ houseId: homeId, userId }).lean() 
      : Promise.resolve(null);
    const [home, fav] = await Promise.all([homePromise, favPromise]);

    if (!home) {
      console.log("Home not found: ", homeId);
      return res.redirect("/homes");
    }

    res.render("store/home-detail", {
      home: home,
      isFavourite: !!fav,
      favouriteIds: fav ? [homeId.toString()] : [],
      pageTitle: home.houseName || "Home Detail",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
    });
  } catch (err) {
    console.error("Error in getHomeDetails:", err);
    res.redirect("/homes");
  }
};