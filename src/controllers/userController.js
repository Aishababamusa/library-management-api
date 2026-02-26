
// What do you need to import here?
const { pgPool } = require('../config/database');
const bcrypt = require('bcrypt');  // Add this

//create user (register)
exports.createUser = async (req, res) => {
  try {
    // 1. Get data from request body
    const { name, email, password, role } = req.body;
    
    // 2. Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. SQL INSERT query
    const query = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    // 4. Execute query (USE hashedPassword!)
    const result = await pgPool.query(query, [
      name, 
      email, 
      hashedPassword,  // ← Don't forget this!
      role
    ]);
    
    // 5. Send response WITHOUT password_hash
    const { password_hash, ...userWithoutPassword } = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    
    const query = `
      SELECT id, name, email, role, created_at 
      FROM users
    `;
    
    const result = await pgPool.query(query);
    if(result.rows.length === 0){
        res.status(404).json({
            success: false,
            message: "No users found"
        })
    }res.status(201).json({
      success: true,
      count: result.rows.length,
      user: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
    const {id} = req.params;
    const query = 'SELECT name, email, role, created_at FROM users WHERE id = $1'
    const result = await pgPool.query(query, [id]);
    if(result.rows.length === 0){
      return res.status(404).json({
        success: false,
        message: `No user found for this ${id}`
      })
    } return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows[0]
    })
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    // 1. Get id from params
    const {id} = req.params;
    
    // 2. Get update data from body (name, email, role)
    const {name, email, role} = req.body;    
    // 3. SQL UPDATE query (without password_hash!)
    const query =  `UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, name, email, role, created_at`
    
    // 4. Execute query
    const result =  await pgPool.query(query, [name, email, role, id]);
    
    // 5. Check if user exists
    if(result.rows.length === 0){
        return res.status(404).json({
            success: false,
            message: `The user with this ${id} is not found`
        })
    } res.status(200).json({
        success: true,
        message: "User updated successfully",
        users: result.rows[0] 
    })
    
    // 6. Send response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const {id} = req.params;
    const query = "DELETE FROM users WHERE id=$1 RETURNING id, name, email, role";
    const result = await pgPool.query(query, [id]);
    if(result.rows.length === 0){
        return res.status(404).json({
            success: false,
            message: `The user with this ID ${id} is not found`
        })
    } res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user: result.rows[0]

    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};