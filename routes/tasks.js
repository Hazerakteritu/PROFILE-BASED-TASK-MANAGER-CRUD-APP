const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');


// router.get('/', (req, res) => {
//     res.send('task routes are working!!'); 
// });


// Create task
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, status } = req.body;


    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [userId, title, description || null, status || 'To Do']
    );


    const insertedId = result.insertId;
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [insertedId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    let rows;

    if (isAdmin && req.query.all === 'true') {
      [rows] = await pool.execute('SELECT * FROM tasks');
    } else {
      [rows] = await pool.execute('SELECT * FROM tasks WHERE user_id = ?', [userId]);
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

//single task by id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const task = rows[0];

    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


//Update task
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title, description, status } = req.body;

    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const task = rows[0];

    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated_at = new Date();
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = ? WHERE id = ?',
      [title || task.title, description ?? task.description, status || task.status, updated_at, taskId]
    );

    const [newRows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    res.json(newRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete task
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    const task = rows[0];

    if (task.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
