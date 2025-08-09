import User from '../models/user.models.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const getUsers = async (req, res) => {
     try {
          const users = await User.find()
          res.status(200).json({
               success: true,
               message: "Fetched All Users!",
               users,
          });
     } catch (error) {
          console.log(`User getting faild: ${error}`)
          res.status(500).json({ success: false, message: error.message });
     }
}

export const createUser = async (req, res) => {
     try {
          const { name, email, password } = req.body;
          if (!email && !password && !name) {
               res.status(400).json({
                    success: false,
                    message: "name, email and password required"
               });
          }
          const user = await User.findOne({ email });
          if (user) return res.status(404).json({ success: false, message: "user already exist" })
          const salt = await bcrypt.genSalt(10)
          const hashPass = await bcrypt.hash(password, salt)
          const newUser = new User({ name, email, password: hashPass })
          await newUser.save()
          const data = {
               user: {
                    id: newUser._id
               }
          }
          const token = jwt.sign(data, "sahil")
          res.status(201).json({
               success: true,
               message: "User created successfully!",
               user: token,
          });
     } catch (error) {
          console.log(`User Creating Failed: ${error}`)
          res.status(500).json({
               success: false,
               message: error.message
          });
     }
}

export const fetchSingleUser = async (req, res) => {
     try {
          const userId = req.user.id
          const finduser = await User.findById(userId).select("-password");
          res.send(finduser);
     } catch (error) {
          console.log(`Error occured while fetching user: ${error.message}`);
          res.status(500).send(`some error occured whiel fetching user: ${error.message}`)

     }
}
