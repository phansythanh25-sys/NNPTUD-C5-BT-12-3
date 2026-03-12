var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({
    message: "Welcome to NNPTUD-C5 API",
    version: "1.0.0",
    endpoints: {
      users: "/api/v1/users",
      roles: "/api/v1/roles",
      products: "/api/v1/products",
      categories: "/api/v1/categories"
    }
  });
});

module.exports = router;
