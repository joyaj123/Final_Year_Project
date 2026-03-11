import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**import User from './models/users.js';            // not Users
import Deal from './models/deals.js';           // capital D, plural ok
import Distribution from "./models/distributions.js"; 
import Country from "./models/countries.js";    // capital C, plural ok 
import Investor from "./models/Investor.js";
import Sector from "./models/Sector.js";
import SubSector from "./models/Sector.js";
import Transaction from "./models/Transaction.js";
import FinanceHistroty from "./models/FinancialHistory.js";
import Company from "./models/company.js";
import Ownership from "./models/ownership.js";
import AuditLogs from "./models/audit_Logs.js";
import Notification from "./models/notification.js";
*/

// Routers
import usersRoute from "./routes/users.route.js";
import dealsRoute from "./routes/deals.route.js";
import distributionsRoute from "./routes/distributions.route.js";
import countriesRoute from "./routes/countries.route.js";
import investorsRoute from "./routes/investors.route.js";
import sectorsRoute from "./routes/sectors.route.js";
import subsectorsRoute from "./routes/subSectors.route.js";
import transactionsRoute from "./routes/transactions.route.js";
import financialHistoriesRoute from "./routes/financialHistory.route.js";
import companyRoute from "./routes/companies.route.js";
import ownershipRoute from "./routes/ownership.route.js";
import auditLogsRoute from "./routes/audit_Logs.route.js";
import notificationRoute from "./routes/notification.route.js";


/* FOR DEBBUGING EZA 3EZTA BA3DEN 
let User, Deal;
try {
  console.log('✅ User model loaded successfully');
} catch (error) {
  console.error('❌ Error loading User model:', error.message);
}*/


const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies , request with Content-Type: application/json
app.use(express.urlencoded({ extended: false })); //IMPORTANT MIDDLEWAR , ALLOWS EXPRESS TO READ DATA SEND FROM FORMS , request with Content-Type: application/x-www-form-urlencoded


//routes
app.use("/users", usersRoute);
app.use("/deals", dealsRoute);
app.use("/distributions", distributionsRoute);
app.use("/countries", countriesRoute);
app.use("/investors", investorsRoute);
app.use("/sectors", sectorsRoute);
app.use("/subSectors", subsectorsRoute);
app.use("/transactions", transactionsRoute);
app.use("/financial-histories", financialHistoriesRoute);
app.use("/company", companyRoute);
app.use("/ownership", ownershipRoute);
app.use("/audit-logs", auditLogsRoute);
app.use("/notifications", notificationRoute); 


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:");
    console.error("   Error:", err.message);
    console.error("   Make sure MongoDB is running!");
  });

// Root route
app.get("/", (req, res) => {
  res.json({  //this send back a json request 
    message: "API is working",
    endpoints: {
      users: "/users",
      deals: "/deals"
    }
  });

  //or res.send("API IS WORKING") ; 
});

// 404 handler for undefined routes
app.use((req, res) => { //run every incoming request 
  res.status(404).json({ message: `Route ${req.path} not found` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📍 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/users`);
  console.log(`   GET  http://localhost:${PORT}/deals`);
});

//ALWAYS RUN SERVER.JS THAN GO TO LOCAL HOST TO CHECK THE ROOT THAN SEND REQUESTS 