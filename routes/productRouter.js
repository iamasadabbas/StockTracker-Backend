const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { addProduct, addProductType, addProductCompany, addLocation, addProductLocation, getAllProduct, productRequest, getProductType, getProductCompany } = require("../controllers/productController");
const router = express.Router();

router.route("/addProduct").post(addProduct)
router.route("/addProductType").post(addProductType)
router.route("/addProductCompany").post(addProductCompany)


////////////////////////////////////////////////////////////////////////////////

router.route("/getAllProduct/:id").get(getAllProduct);
router.route("/getProductType").get(getProductType)
router.route("/getProductCompany").get(getProductCompany)
module.exports = router;