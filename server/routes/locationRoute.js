const express = require('express');
const router = express.Router();
const { getRoute } = require('../controlers/locationController');

//Route to get the route between two location 
router.post('/route', getRoute);

module.exports = router;