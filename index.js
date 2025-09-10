const express = require('express');
const app = express();
require('dotenv').config();

const user = require('./routes/user');
const taskRoutes = require('./routes/tasks');

app.use(express.json());


app.use('/user', user);
app.use('/tasks', taskRoutes);


// error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
