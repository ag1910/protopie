const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Create a new SQLite database and table
const db = new sqlite3.Database('index.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');

    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT
    )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Items table created or already exists.');
      }
    });
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Enable JSON request parsing
app.use(express.json());

// GET route to search for items
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Missing search term.' });
  }

  const query = `SELECT * FROM items WHERE name LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }

    res.json(rows);
  });
});

// POST route to add a new item
app.post('/add', (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Missing name or description.' });
  }

  const query = `INSERT INTO items (name, description) VALUES ('${name}', '${description}')`;

  db.run(query, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }

    res.json({ id: this.lastID });
  });
});

// DELETE route to delete an item by ID
app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'Missing item ID.' });
  }

  const query = `DELETE FROM items WHERE id = ${id}`;

  db.run(query, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }

    res.json({ success: true });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});