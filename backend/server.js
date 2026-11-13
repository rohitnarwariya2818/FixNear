const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const { log } = require("console");
const flash = require("flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();
const User = require("./models/user");
const ensureRoleScopedAuthIndexes = require("./migrations/ensureRoleScopedAuthIndexes");
const authRouter = require("./routes/auth");
const providerRoutes = require("./routes/provider");
const  bookingRoutes = require("./routes/bookingroute");
const customerRoutes = require("./routes/customeroute");

const port = 3000;

const MONGO_URL = "mongodb://127.0.0.1:27017/Fixnear";

async function main() {
  await mongoose.connect(MONGO_URL);
  await ensureRoleScopedAuthIndexes(User);
  console.log("connected to db");
  app.listen(port, () => {
    console.log("working");
  });
}

const sessionOptions = {
  secret: "helooooo",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => done(null, user || false))
    .catch(done);
});

app.use("/api/auth", authRouter);
app.use("/api/providers", providerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/customers", customerRoutes);
// app.use("/auth",authRouter);
// app.get("/demo", async(req,res)=>{
//     let fakeUser = new User({
//         Name:"Rohit",
//         Email:"rohit@gmail.com",

//     });
//    let resigteruser = await User.register( fakeUser,"helloworld");
//    res.send(resigteruser)
// })

// // app.post("/", (req,res)=>{
// //   res.json({message:"user login"})
// })

// app.get("/", (req,res)=>{
//    res.send("hello world") ;
// });



main().catch((error) => {
  console.error("Backend startup failed:", error);
  process.exitCode = 1;
});
