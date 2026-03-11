import User from "../models/Users.js"
import bcrypt from "bcrypt" 

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
  try {
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


userSchema.pre("save", async function (next) {
  // Hash password if it was modified or is new
  if (this.isModified("passwordHash")) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  }

  // Validate country ObjectId
  if (!mongoose.Types.ObjectId.isValid(this.address.country)) {
    throw new Error("Invalid country ObjectId");
  }

  next();
});



export {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser
};