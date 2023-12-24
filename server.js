const express = require('express');
const app = express();
const port = 3000;

// Mock data
const flights = [
  { id: 1, company:'THY', departure: 'IST', arrival: 'ESB', departureDate: '20:02', returnDate: '21:34', price: 500 },
  { id: 2, company:'PGS', departure: 'IST', arrival: 'ESB', departureDate: '20:01', returnDate: '21:32', price: 250 },
  { id: 3, company:'EMT', departure: 'IST', arrival: 'ESB', departureDate: '20:05', returnDate: '21:30', price: 300 },
  { id: 4, company:'THY', departure: 'IST', arrival: 'ESB', departureDate: '20:04', returnDate: '21:33', price: 400 },
  { id: 5, company:'THY', departure: 'ESB', arrival: 'ADB', departureDate: '20:23', returnDate: '20:23', price: 150 },
  { id: 6, company:'THY', departure: 'IST', arrival: 'ADB', departureDate: '20:23', returnDate: '20:23', price: 250 },
  { id: 7, company:'THY', departure: 'ESB', arrival: 'IST', departureDate: '20:23', returnDate: '20:23', price: 350 },
  { id: 8, company:'THY', departure: 'ADB', arrival: 'ESB', departureDate: '20:23', returnDate: '20:23', price: 400 },
  { id: 9, company:'THY', departure: 'ADB', arrival: 'IST', departureDate: '20:23', returnDate: '20:23', price: 300 },
];

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes
app.get('/api/flights', (req, res) => {
  res.json(flights);
});

app.listen(port, () => {
  console.log(`Mock API listening at http://localhost:${port}`);
});
