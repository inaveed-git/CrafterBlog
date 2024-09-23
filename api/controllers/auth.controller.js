import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password
    const hashPassword = bcryptjs.hashSync(password, 10);

    // Create the new user
    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
    });

    // Send response
    res.status(200).json({
      message: "User created successfully",
      newUser,
    });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === "" || password === "") {
    return next(new ErrorHandler("All fields are required", 400));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(new ErrorHandler("User not found", 404));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(new ErrorHandler("Invalid password", 400));
    }
    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin },
      process.env.JWT_SECRET
    );

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// Example route handler for signin
// export const signin = async (req, res, next) => {
//   const { email, password } = req.body;

//   try {
//     const validUser = await User.findOne({ email }).select("+password");

//     if (!validUser) return next(new ErrorHandler("User not found", 404));

//     const validPassword = bcryptjs.compareSync(password, validUser.password);

//     if (!validPassword)
//       return next(new ErrorHandler("Invalid email or password", 401));

//     const token = jwt.sign(
//       { id: validUser._id, isAdmin: validUser.isAdmin },
//       process.env.JWT_SECRET
//     );

//     const { password: pass, ...rest } = validUser._doc;

//     // res
//     //   .status(200)
//     //   .cookie("access_token", token, {
//     //     httpOnly: true,
//     //   })
//     //   .json(rest);

//     res
//       .status(200)
//       .cookie("access_token", token, { httpOnly: true })
//       .json({ success: true, token });
//   } catch (error) {
//     next(error); // Pass errors to the error-handling middleware
//   }
// };

export const google = async (req, res, next) => {
  const { email, displayName, googlePhotoUrl } = req.body;

  if (!email || !displayName) {
    return next(new ErrorHandler("Email and name are required", 400));
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Existing user
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    } else {
      // New user
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: displayName,
        // name.toLowerCase().split(" ").join("") +
        // Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
      });
      await newUser.save();
      const token = jwt.sign(
        { id: newUser._id, isAdmin: newUser.isAdmin },
        process.env.JWT_SECRET
      );
      const { password, ...rest } = newUser._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
