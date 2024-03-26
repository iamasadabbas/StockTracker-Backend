const express = require("express");
const { getProductRequest, productRequest, getRequestByMonth, getRequestCategoryCount } = require("../controllers/requestController");
const router = express.Router();

router.route("/getProductRequest/:user").get(getProductRequest)
router.route("/getRequestByMonth/:user").get(getRequestByMonth)
router.route("/getRequestCategoryCount/:user").get(getRequestCategoryCount)
router.route("/productRequest").post(productRequest);

module.exports = router;