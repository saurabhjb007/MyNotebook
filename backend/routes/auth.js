const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "saurabhsharma13$007";

//Route 1: Create user using post : "/api/auth/createuser". no login required.
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }).withMessage("Enter a valid Name"),
    body("email").isEmail().withMessage("Enter a valid e-mail address"),
    body("password")
      .isLength({ min: 4 })
      .withMessage("Passeord must have 4 characters"),
  ],
  async (req, res) => {
    let success = false;
    // If there are Errors send : Bad req and Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    // Check whether this user email exits
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "E-mail already in use" });
      }

      // Hash and Salt to secure the password
      const secPass = await bcrypt.hash(req.body.password, 8);

      // Create a user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      // res.json(user);
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message),
        res.status(500).send("Internal server error occured");
    }
  }
);

//Route 2: Login user using post : "/api/auth/login". no login required.
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid e-mail address"),
    body("password").exists().withMessage("Passeord cannot be Blank"),
  ],
  async (req, res) => {
    let success = false;
    // If there are Errors send : Bad req and Error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Enter login data correctly" });
      }
      const passCompare = await bcrypt.compare(password, user.password);
      if (!passCompare) {
        return res
          .status(400)
          .json({ success, error: "Enter login data correctly" });
      }
      const data = {
        user: {
          id : user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message),
        res.status(500).send("Internal server error occured");
    }
  }
);

//Route 3: Loggedin using post : "/api/auth/getuser". no login required.
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findOne({userId}).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message),
      res.status(500).send("Internal server error occured");
  }
});

module.exports = router;
