const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const pool = require('./db'); 

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });


// This route handles hotel data submission, including image uploads and storing details in the database.
app.post('/hotel', upload.array('images', 10), async (req, res) => {
  const { 
    slug, 
    title, 
    description, 
    guest_count, 
    bedroom_count, 
    bathroom_count, 
    amenities, 
    host_information, 
    address, 
    latitude, 
    longitude 
  } = req.body;
  const files = req.files;

  if (!slug || !title) {
    return res.status(400).json({ error: "Slug and title are required" });
  }

  const imagePaths = files.map(file => file.path);

  try {
    const result = await pool.query(
      'INSERT INTO hotel (slug, images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude) VALUES ($1, $2::jsonb, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12) RETURNING *',
      [slug, JSON.stringify(imagePaths), title, description, guest_count, bedroom_count, bathroom_count, JSON.stringify(amenities), JSON.stringify(host_information), address, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// This route retrieves all hotel data from the database.
app.get('/hotel', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotel');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route retrieves hotel data from the database based on the provided slug.
app.get('/hotel/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('SELECT * FROM hotel WHERE slug = $1', [slug]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route updates hotel data in the database based on the provided slug.
app.put('/hotel/:slug', async (req, res) => {
  const { slug } = req.params;
  const { images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'UPDATE hotel SET images = $1, title = $2, description = $3, guest_count = $4, bedroom_count = $5, bathroom_count = $6, amenities = $7, host_information = $8, address = $9, latitude = $10, longitude = $11 WHERE slug = $12 RETURNING *',
      [images, title, description, guest_count, bedroom_count, bathroom_count, amenities, host_information, address, latitude, longitude, slug]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route delete hotel data in the database based on the provided slug.
app.delete('/hotel/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query('DELETE FROM hotel WHERE slug = $1 RETURNING *', [slug]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This route retrieves all room data from the database.
app.get('/room', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM room');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route retrieves all room data for a specific hotel based on the provided hotel slug.
app.get('/hotel/:hotelSlug/room', async (req, res) => {
  const { hotelSlug } = req.params;
  try {
    const hotel = await pool.query('SELECT id FROM hotel WHERE slug = $1', [hotelSlug]);
    if (hotel.rows.length > 0) {
      const hotelId = hotel.rows[0].id;
      const result = await pool.query('SELECT * FROM room WHERE hotel_id = $1', [hotelId]);
      res.json(result.rows);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route retrieves specific room data for a given hotel and room slug.
app.get('/hotel/:hotelSlug/room/:roomSlug', async (req, res) => {
  const { hotelSlug, roomSlug } = req.params;
  try {
    const hotel = await pool.query('SELECT id FROM hotel WHERE slug = $1', [hotelSlug]);
    if (hotel.rows.length > 0) {
      const hotelId = hotel.rows[0].id;
      const result = await pool.query('SELECT * FROM room WHERE slug = $1 AND hotel_id = $2', [roomSlug, hotelId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Room not found' });
      }
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This route adds a new room to a specific hotel based on the provided hotel slug.
app.post('/hotel/:hotelSlug/room', async (req, res) => {
  const { hotelSlug } = req.params;
  const { slug, images, title, bedroom_count } = req.body;
  try {
    const hotel = await pool.query('SELECT id FROM hotel WHERE slug = $1', [hotelSlug]);
    if (hotel.rows.length > 0) {
      const hotelId = hotel.rows[0].id;
      const result = await pool.query(
        'INSERT INTO room (hotel_id, slug, images, title, bedroom_count) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [hotelId, slug, images, title, bedroom_count]
      );
      res.status(201).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route updates specific room data for a given hotel and room slug.
app.put('/hotel/:hotelSlug/room/:roomSlug', async (req, res) => {
  const { hotelSlug, roomSlug } = req.params;
  const { images, title, bedroom_count } = req.body;
  try {
    const hotel = await pool.query('SELECT id FROM hotel WHERE slug = $1', [hotelSlug]);
    if (hotel.rows.length > 0) {
      const hotelId = hotel.rows[0].id;
      const result = await pool.query(
        'UPDATE room SET images = $1, title = $2, bedroom_count = $3 WHERE slug = $4 AND hotel_id = $5 RETURNING *',
        [images, title, bedroom_count, roomSlug, hotelId]
      );
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Room not found' });
      }
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// This route delete specific room data for a given hotel and room slug.
app.delete('/hotel/:hotelSlug/room/:roomSlug', async (req, res) => {
  const { hotelSlug, roomSlug } = req.params;
  try {
    const hotel = await pool.query('SELECT id FROM hotel WHERE slug = $1', [hotelSlug]);
    if (hotel.rows.length > 0) {
      const hotelId = hotel.rows[0].id;
      const result = await pool.query('DELETE FROM room WHERE slug = $1 AND hotel_id = $2 RETURNING *', [roomSlug, hotelId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ message: 'Room not found' });
      }
    } else {
      res.status(404).json({ message: 'Hotel not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
