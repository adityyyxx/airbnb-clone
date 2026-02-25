// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");
const isAuth = require("../middleware/is-auth");

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", isAuth, storeController.getBookings);
storeRouter.get("/favourites", isAuth, storeController.getFavouriteList);

storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.post("/favourites", isAuth, storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", isAuth, storeController.postRemoveFromFavourite);

storeRouter.post("/bookings", isAuth, storeController.postAddBooking);
storeRouter.post("/bookings/delete/:bookingId", isAuth, storeController.postRemoveBooking);

module.exports = storeRouter;