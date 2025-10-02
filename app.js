const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const { error } = require("console");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const {reviewSchema} = require("./schema.js");
const wrapAsync = require("./utils/wrapAsync.js");


const mongoUrl = "mongodb://127.0.0.1:27017/test";

main().then(()=>{
    console.log("connected");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(mongoUrl);
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req,res)=>{
    res.send("hi i am running");
});

const validateReview = async(req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(404,errMsg);
    } else{
        next();
    }
    };

//index route
app.get("/listings", async (req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
});

//creating new route
app.get("/listings/new", async(req,res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").orFail(new Error("listening not found"));
    res.render("show.ejs", {listing});
    
});

//create route
app.post("/listings", async(req,res)=>{
    let url = req.body.listing.image;
    let filename = "default_filename";
    if(!url){
        url = "data:image/jpeg;base64,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";
    }
    const newListing = new Listing(req.body.listing);
    newListing.image = {url: url, filename : filename};
    await newListing.save();
    res.redirect("/listings");
    console.log(newListing);
});

//edit route
app.get("/listings/:id/edit", async(req,res)=>{
    let {id} = req.params;
   const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id", async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,req.body.listing);
    res.redirect(`/listings/${id}`);
})

//delete route 
app.delete("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    let deleteListings = await Listing.findByIdAndDelete(id);
    console.log(deleteListings);
    res.redirect("/listings");
});

//reviews

app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview._id);

    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route

app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndDelete(id,{$pull : {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));


// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "My home",
//         description: "this is my place",
//         price: 1800,
//         location: "delhi",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("done");
//     res.send("success");
// });

app.listen(8080,()=>{
    console.log("app is listening to port 8080");
});
