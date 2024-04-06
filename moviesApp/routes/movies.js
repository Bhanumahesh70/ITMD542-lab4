const express = require('express');
const router = express.Router();
const Movie = require('../models/movie');
const sanitizeHtml = require('sanitize-html');
const { body, validationResult } = require('express-validator');
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
router.post('/', 
// Validate input fields
body('title').trim().notEmpty().withMessage('Title is required'),
body('director').trim().notEmpty().withMessage('Director is required').isAlpha().withMessage('Director should start with an alphabetical letter'),
body('year').trim().notEmpty().withMessage('Year is required').isInt().withMessage('Year should be a number'),
async function(req, res, next) {
  try {
    // Extracting individual properties from req.body and trimming whitespace
    const { title, director, year, notes } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('movies/new', { errors: errors.array(), title, director, year, notes });
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(title.trim());
    const sanitizedDirector = sanitizeInput(director.trim());
    const sanitizedYear = sanitizeInput(year.trim());
    const sanitizedNotes = notes ? sanitizeInput(notes.trim()) : '';

    // Create movie
    const movie = await Movie.create({ title: sanitizedTitle, director: sanitizedDirector, year: sanitizedYear, notes: sanitizedNotes });
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    console.error('Error creating movie:', error);
    next(error);
  }
}
);

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
router.put('/:id', 
// Validate input fields
body('title').trim().notEmpty().withMessage('Title is required'),
body('director').trim().notEmpty().withMessage('Director is required').isAlpha().withMessage('Director should start with an alphabetical letter'),
body('year').trim().notEmpty().withMessage('Year is required').isInt().withMessage('Year should be a number'),
async function(req, res, next) {
  try {
    // Extracting individual properties from req.body
    const { title, director, year, notes } = req.body;
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('movies/edit', { errors: errors.array(), movie: { _id: req.params.id, title, director, year, notes } });
    }
    
    // Sanitize input
    const sanitizedTitle = sanitizeInput(title.trim());
    const sanitizedDirector = sanitizeInput(director.trim());
    const sanitizedYear = sanitizeInput(year.trim());
    const sanitizedNotes = notes ? sanitizeInput(notes.trim()) : '';
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id, 
      { title: sanitizedTitle, director: sanitizedDirector, year: sanitizedYear, notes: sanitizedNotes }, 
      { new: true } // Return the updated document
    );
    res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    next(error);
  }
}
);

  
  // DELETE /movies/:id
  router.delete('/:id', async function(req, res, next) {
    console.log("Delete method is invoked")
    try {
      await Movie.findByIdAndDelete(req.params.id);
      console.log("redirect to /movies")
      res.redirect('/movies');
    } catch (error) {
      next(error);
    }
  });
  module.exports = router;