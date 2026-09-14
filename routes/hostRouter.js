// External Module
const express = require("express");
const hostRouter = express.Router();

// Local Module
const hostController = require("../controllers/hostController");
const upload = require("../middleware/upload");

// Middleware wrapper for handling file upload errors gracefully
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      req.uploadError = err.message || 'File upload failed.';
    }
    next();
  });
};

hostRouter.get("/add-home", hostController.getAddHome);
hostRouter.post("/add-home", handleUpload, hostController.postAddHome);
hostRouter.get("/host-home-list", hostController.getHostHomes);
hostRouter.get("/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/edit-home", handleUpload, hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports = hostRouter;