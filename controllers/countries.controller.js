import Country from "../models/Countries.js";

// GET ALL COUNTRIES
const getCountries = async (req, res) => {
  try {
    const countries = await Country.find({});
    res.status(200).json({
      success: true,
      count: countries.length,
      data: countries
    });
  } catch (error) {
    console.error("ERROR FETCHING COUNTRIES:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// CREATE A COUNTRY 
const postCountries = async (req, res) => {
  try {
    const country = await Country.create(req.body);
    res.status(201).json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error("ERROR CREATING COUNTRY:", error);
    
    // Handle duplicate key errors (if you have unique fields)
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Duplicate field value entered" 
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// GET COUNTRY BY ID 
const getCountry = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    
    if (!country) {
      return res.status(404).json({ 
        success: false,
        message: "Country not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error("ERROR FETCHING COUNTRY:", error);
    
    // Handle invalid MongoDB ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid country ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// UPDATE A COUNTRY 
const putCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!country) {
      return res.status(404).json({ 
        success: false,
        message: "Country not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: country
    });
  } catch (error) {
    console.error("ERROR UPDATING COUNTRY:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid country ID format" 
      });
    }
    
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// DELETE A COUNTRY 
const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    
    if (!country) {
      return res.status(404).json({ 
        success: false,
        message: "Country not found" 
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: "Country deleted successfully" 
    });
  } catch (error) {
    console.error("ERROR DELETING COUNTRY:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid country ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export {
  getCountries,
  postCountries,
  getCountry,
  putCountry,
  deleteCountry
};