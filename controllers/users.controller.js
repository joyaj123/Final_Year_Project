import User from "../models/Users.js"
import bcrypt from "bcrypt";
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

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if(!isMatch){
      return res.status(404).json({message : "Wrong password"}) ; 
    }

    res.status(200).json({
      message :"Log in successful",
      user:user 
    }); 
  }
  catch (error){
        res.status(500).json({ message: error.message });

  }
} ;

//TO CHECK MA KHOLSET AND DIDINT TEST IT 

export const registerUser = async (req, res) => {
  try {
    const { userData, roleData } = req.body; // what the user input , userData , and roleData hassab his type

     if (!userData.email || !userData.password || !userData.userType || !userData.profile?.firstName || !userData.profile?.lastName || !userData.address?.country) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if(userData.email){
      return res.status(400).json({message : "Email already Used"}) ; 
    }

    userData.passwordHash = await bcrypt.hash(userData.password, 10);
    delete userData.password; // remove plain password

    
    const user = await postUser(userData); // postUser should return the saved user object

    // Create role-specific collection
    if (user.userType === "INVESTOR") {
      const investor = new Investor({
        userId: user._id,
        ...roleData
      });
      await investor.save();
    } else if (user.userType === "BUSINESS_OWNER") {
      const company = new Company({
        ownerId: user._id,
        ...roleData
      });
      await company.save();
    }

    res.status(201).json({ message: "User registered successfully", userId: user._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser
};