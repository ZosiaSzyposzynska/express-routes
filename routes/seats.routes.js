const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');


router.get('/:id', (req, res) => {
  const seat = db.seats.find(item => item.id === parseInt(req.params.id));

  if (seat) {
    res.json(seat);
  } else {
    res.status(404).json({ message: 'Not found...' });
  }
});

router.post('/', (req, res) => {
  const { day, seat, client, email } = req.body;

  if (day && seat && client && email) {
    const newSeat = { id: uuidv4(), day, seat, client, email };
    db.seats.push(newSeat);
    res.json({ message: 'OK' });
  } else {
    res.status(400).json({ message: 'Bad request. Missing required fields in request body.' });
  }
});

router.put('/:id', (req, res) => {
  const seat = db.seats.find(item => item.id === parseInt(req.params.id));

  if (seat) {
    const { day, seat, client, email } = req.body;

    if (day && seat && client && email) {
      seat.day = day;
      seat.seat = seat;
      seat.client = client;
      seat.email = email;
      res.json({ message: 'OK' });
    } else {
      res.status(400).json({ message: 'Bad request. Missing required fields in request body.' });
    }
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

router.delete('/:id', (req, res) => {
  const index = db.seats.findIndex(item => item.id === parseInt(req.params.id));

  if (index !== -1) {
    db.seats.splice(index, 1);
    res.json({ message: 'OK' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

module.exports = router;