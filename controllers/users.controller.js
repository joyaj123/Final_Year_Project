import User from "../models/Users.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Investor from "../models/Investor.js";
import Company from "../models/Company.js";
import nodemailer from 'nodemailer' ; 

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


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const allowedStatuses = ["ACTIVE", "PENDING"];//pending y3ne al admin ma 3emel accept


    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Account status
   if (!allowedStatuses.includes(user.status)) {
   return res.status(403).json({ message: "Account not allowed to log in" });
   }

    // Check if account is locked
    if (user.security.lockedUntil && user.security.lockedUntil > new Date()) {
      return res.status(403).json({ message: "Account temporarily locked. Try later." });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Increment failed login attempts
      user.security.failedLoginAttempts += 1;
      if (user.security.failedLoginAttempts >= 5) {
        user.security.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }
      await user.save();
      return res.status(401).json({ message: "Wrong password" });
    }

    // Successful login
    user.security.failedLoginAttempts = 0;
    user.security.lockedUntil = null;
    user.security.lastLogin = new Date(); //new date() indicate the current moment 
    await user.save();

    // JWT token
    const token = jwt.sign(
      { id: user._id, role: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    
    res.cookie("token", token, {  
      httpOnly: true,  
      secure: false,  
      sameSite: "strict"  
   });


    res.status(200).json({ //for testing on thunder client 
      message: "Log in successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.userType
      }
    });



    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};//we redirect to the pages hasab al role in the front-end  


//FUNCTION TO SEND OTP 
export const forgotPassword = async (req,res) =>{

  try{
  const {email} = req.body ;
  const user = await User.findOne({ email });


    if (!user) {
      return res.json({ message: 'Email not registered.' });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.security.resetOTP = otp ; 
    user.security.resetOTPExpiry = Date.now() + 10 * 60 *1500 ; //15 min
    await user.save() ; 

     // Send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { //email that is gonna send the otp 
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It expires in 15 minutes.`,
    });

    res.json({ message: ' Verification code sent to your email' });

  }
  catch(error){
    res.status(500).json({message : 'server error'}) ; 

  }

}

//FUNCTION TO CHECK AL OTP AND CHANGE THE PASS
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    if (
      user.security.resetOTP !== otp ||
      user.security.resetOTPExpiry < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);

    // Clear OTP and set date for changed password 
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.security.passwordChangedAt = new Date() ; 

    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


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