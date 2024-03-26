const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const mongoose = require("mongoose");

const Request = require("../models/request/productRequestModel");
const UserProduct = require("../models/request/userProductModel");
const ProductType = require("../models/product/productTypeModel");
const { sendMessage } = require("./notificationController");

// get Product Request
/////////////////////////////////////////////////////////////////////////////////////////////
exports.getProductRequest = catchAsyncError(async (req, res, next) => {
  const id = req.params.user;

  try {
    // const request= await Request.find({user_id:id}).populate({path:"product_id._id",populate:{path:"company_id"}}).populate('user_id')
    const request = await Request.find({ user_id: id })
      .populate("user_id")
      .populate({
        path: "request_id",
        populate: {
          path: "product_id._id",
          model: "Product",
          populate: { path: "type_id", model: "ProductType" }, // Populate type_id
        },
      })
      .sort({ "date.getMonth()": 1 });
    if (request.length != 0) {
      res.status(200).json({
        success: true,
        request,
      });
    }
  } catch (error) {
    console.log(error);
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////

// Add Product Request
/////////////////////////////////////////////////////////////////////////////////////////////
exports.productRequest = catchAsyncError(async (req, res, next) => {
  const { user_id, product_id } = req.body;

  // Generate a unique request number
  const lastRequest = await Request.findOne(
    {},
    {},
    { sort: { createdAt: -1 } }
  );
  let requestNumber = "0001";
  if (lastRequest) {
    const lastRequestNumber = lastRequest.request_number || "0000";
    console.log(lastRequestNumber);
    const nextNumber = parseInt(lastRequestNumber, 10) + 1;
    requestNumber = padZeros(nextNumber, 4);
  }

  const userProduct = await UserProduct.create({
    user_id,
    product_id,
  });

  if (userProduct) {
    const request = await Request.create({
      request_id: userProduct._id,
      user_id,
      request_number: requestNumber,
    });

    if (request) {
      console.log(requestNumber);
      res.status(200).json({
        success: true,
      });
      sendMessage();
    }
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////

const padZeros = (number, length) => {
  return String(number).padStart(length, "0");
};

/////////////////////////////////////////////////////////////////////////////////////////////
exports.getRequestByMonth = catchAsyncError(async (req, res, next) => {
  const userId = req.params.user; // Renamed id to userId for clarity
  console.log(userId);

  try {
    const requestsByMonth = await Request.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthCounts = new Array(12).fill(0); // Initialize an array to hold counts for each month
    requestsByMonth.forEach((entry) => {
      monthCounts[entry._id - 1] = entry.count; // Subtract 1 to adjust for zero-based indexing
    });

    console.log(monthCounts);
    res.status(200).json({
      success: true,
      countsByMonth: monthCounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////
exports.getRequestCategoryCount = catchAsyncError(async (req, res, next) => {
  const id = req.params.user;

  try {
    // Retrieve product types
    const products = await ProductType.find();
    const productTypes = products.map(product => product.name); // Extract product names from the array of objects

    // Retrieve requests
    const requests = await Request.find({ user_id: id })
      .populate("user_id")
      .populate({
        path: "request_id",
        populate: {
          path: "product_id._id",
          model: "Product",
          populate: { path: "type_id", model: "ProductType" }, // Populate type_id
        },
      });

    // Initialize counts for each product type
    const productTypeCounts = new Array(productTypes.length).fill(0);

    // Count requests for each product type
    requests.forEach(request => {
      request.request_id.product_id.forEach(product => {
        const productTypeName = product._id.type_id.name; // Access populated field correctly
        const index = productTypes.indexOf(productTypeName);
        if (index !== -1) {
          productTypeCounts[index]++;
        }
      });
    });

    // Create pairs of product type and its count
    const result = productTypes.map((type, index) => ({ product: type, request: productTypeCounts[index] }));
    const total=requests.length
    console.log(result)
    res.status(200).json({
      success: true,
      productTypeCounts: result,
      totalCount:total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});
