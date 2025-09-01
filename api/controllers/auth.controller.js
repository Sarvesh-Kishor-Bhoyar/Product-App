
import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js"
import jwt from 'jsonwebtoken'

//added auth controller functions here
//also commenting on the changes
//done work on the main branch
export const signup = async (req, res, next) => {
    const { username, email, password } = req.body;

    //check if user already exists
    let checkUser = await User.findOne({ email });

    if (checkUser) {
        return next(errorHandler(400, "User already exists"));
    }
    checkUser = await User.findOne({ username });
    if (checkUser) {
        return next(errorHandler(400, "User already exists"));
    }ß
    const hashedPassword = bcryptjs.hashSync(password, 10)
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        return res.json({ message: "User signup successfull" });
    } catch (err) {
        next(err);
    }

}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const validUser = await User.findOne({ email })
        if (!validUser) {
            return next(errorHandler(400, "User not found"));
        }
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(400, "Invalid Credentials"));
        }
        const { password: pass, ...rest } = validUser._doc; //remove password from the response
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).cookie("access_token", token, {
            httpOnly: true,
        }).json(rest);
    } catch (error) {
        next(error);
    }
}

export const signout = (req, res, next) => {
    try {
        res.clearCookie("access_token", {

        }).status(200).json("User signed out successfully");

    }
    catch (error) {
        next(errorHandler(500, "Error signing out"));
    }
} 