const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const sanitizeHtml = require('sanitize-html');

// Function to sanitize user input
function sanitizeInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    exclusiveFilter: function(frame) {
      //return frame.tag === 'script';
      return frame.tag !== 'a' && frame.tag !== 'img'; // Allow <a> and <img> tags
    }
  });
}

// GET /movies
router.get('/', async function(req, res, next) {
  try {
    const movies = await Movie.find();
    res.render('movies/index', { movies });
  } catch (error) {
    next(error);
  }
});

// GET /movies/new
router.get('/new', async function(req, res, next) {
    try {
        
        res.render('movies/new');
      } catch (error) {
        next(error);
      }
  });

  // POST /movies
router.post('/', async function(req, res, next) {
  try {
    // Extracting individual properties from req.body and trimming whitespace
    const { title, director, year, notes } = req.body;
    const trimmedTitle = title.trim();
    const trimmedDirector = director.trim();
    const trimmedYear = year.trim();
    const trimmedNotes = notes ? notes.trim() : '';

    // Validate required fields
    if (!trimmedTitle || !trimmedDirector || !trimmedYear) {
      return res.status(400).send('Title, Director, and Year are required fields');
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(trimmedTitle);
    const sanitizedDirector = sanitizeInput(trimmedDirector);
    const sanitizedYear = sanitizeInput(trimmedYear);
    const sanitizedNotes = notes ? sanitizeInput(trimmedNotes) : '';

    // Create movie
    const movie = await Movie.create({ title: sanitizedTitle, director: sanitizedDirector, year: sanitizedYear, notes: sanitizedNotes });
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    console.error('Error creating movie:', error);
    next(error);
  }
});


// GET /movies/:id
router.get('/:id', async function(req, res, next) {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      // Handle case where movie is not found
      return res.status(404).send('Movie not found');
    }
    res.render('movies/show', { movie });
  } catch (error) {
    next(error);
  }
});


  

  
  // GET /movies/:id/edit
  router.get('/:id/edit', async function(req, res, next) {
    try {
      const movie = await Movie.findById(req.params.id);
      if (!movie) {
        // Handle case where movie is not found
        return res.status(404).send('Movie not found');
      }
      res.render('movies/edit', { movie });
    } catch (error) {
      next(error);
    }
  });
  
  // PUT /movies/:id
  router.post('/:id', async function(req, res, next) {
    try {
      const { title, director, year, notes } = req.body;
      const movie = await Movie.findByIdAndUpdate(req.params.id, { title, director, year, notes }, { new: true });
      res.redirect(`/movies/${movie._id}`);
    } catch (error) {
      next(error);
    }
  });
  
  // DELETE /movies/:id
  router.delete('/:id', async function(req, res, next) {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.redirect('/movies');
    } catch (error) {
      next(error);
    }
  });
  module.exports = router;