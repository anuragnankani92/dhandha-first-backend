const express = require('express');
const cors = require('cors');
const path = require("path");

const aboutUsRoute = require('./routes/aboutUsRoute');
const adminRoutes = require('./routes/adminRoutes');
const dataRoutes = require("./routes/homePageRoutes");
const startUpRoutes = require("./routes/startUpRegistrationRoute");
const startUpPricingRoute = require("./routes/startUpPricingRoute");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const fs = require('fs');

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/images', dataRoutes);
app.use('/api/startup',startUpRoutes);
app.use('/api/pricing',startUpPricingRoute);

// Routes
app.use('/api/admin', aboutUsRoute);
app.use('/api/admin', adminRoutes);
// app.use('/api/images', imageRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
