const mongoose = require("mongoose");
const schema = mongoose.Schema;

const listingSchema = new schema({
    title: {
        type: String,
        required: true,  
    },
    description: String,
    image: {
        filename: String,
        url: String,
    },
    price: {
        type: Number,
        required: true,
    },
    location: String,
    country: String,
    reviews: [
        {
            type: schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;