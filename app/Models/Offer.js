const mongoose = require('mongoose');

var OfferSchema = mongoose.Schema(
  {
    image: String,
    // product_name: String,
    distributors: { type: mongoose.Schema.Types.ObjectId, ref: 'distributor' },
    products: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    name: String,
    type: String,
    purchase_quantity: Number,
    bonus_quantity: Number,
    time: { type: Number, default: Date.now },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('offer', OfferSchema);