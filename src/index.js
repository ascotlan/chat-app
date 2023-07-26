const express = require("express");
const path = require("path");

const app = express();

// set port number as host port#
const port = process.env.PORT || 3000;

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// Set up the web server to listen on port
app.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
