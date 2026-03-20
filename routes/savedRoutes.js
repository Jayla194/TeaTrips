const express = require("express");
const router = express.Router();

const requireLogin = require("../controllers/requireLogin");
const { saveLocation, unsaveLocation, getSavedLocations} = require("../controllers/savedController");

router.use(requireLogin);

router.get("/",getSavedLocations)

router.post("/:locationId",saveLocation);

router.delete("/:locationId",unsaveLocation);

module.exports = router;