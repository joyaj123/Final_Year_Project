import User from "../models/users.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Investor from "../models/Investor.js";
import Company from "../models/Company.js";


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).populate("address.country","name");
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    .populate("address.country","name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
};


const postUser = async (req, res) => {
  try {
    // Extract password from request body
    const { password, ...userData } = req.body;
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user with passwordHash field (what schema expects)
    const newUser = await User.create({
      ...userData,
      passwordHash  
    });

    // Remove sensitive data from response
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message });
  }
};

const putUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {``
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};


export const loginUser = async (req,res) =>{
  try{
    const {email,password} = req.body ; 
    
    //find email of the user
    const user = await User.findOne({email}) ; //bi redele kel al document tb3 hyda al user ma3 this email

    if(!user){
      return res.status(404).json({message : "Email not found "}) ; 
    }

     if(user.status !== "ACTIVE"){
      return res.status(403).json({
        message:"Account not active"
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch){
      return res.status(404).json({message : "Wrong password"}) ; 
    }

    const token = jwt.sign(
      {
        id:user._id ,
        role:user.userType
      }, 
      process.env.JWT_SECRET,
      {expiresIn:"7d"}
    ) ;

    res.status(200).json({
      message :"Log in successful",
      token :token,
      user:{
        id:user._id,
        email:user.email,
        role:user.userType
      }
    }); 
    
  }
  catch (error){
        res.status(500).json({ message: error.message });

  }
} ;//we redirect to the pages hasab al role in the front-end  

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, country } = req.body;

    if (!firstName || !lastName || !email || !password || !userType || !country) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // check password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long, include uppercase, lowercase, number & special character"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      passwordHash,
      userType,
      status: "PENDING",
      profile: { firstName, lastName },
      address: { country }
    });

    await newUser.save();

    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    let nextStep = "";
    if (newUser.userType === "INVESTOR") nextStep = "/onboarding";
    else if (newUser.userType === "BUSINESS_OWNER") nextStep = "/listing";

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: newUser._id,
        firstName: newUser.profile.firstName,
        lastName: newUser.profile.lastName,
        email: newUser.email,
        userType: newUser.userType,
        status: newUser.status,
        country: newUser.address.country
      },
      nextStep
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};
export {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,

};