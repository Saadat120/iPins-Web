require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

const key = process.env.API_KEY;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Assuming your map.html is in a "views" folder

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render map.html with API key
app.get('/map', (req, res) => {
  res.render('map', { apiKey: key });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
