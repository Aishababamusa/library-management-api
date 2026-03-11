
// What do you need to import here?
const { pgPool } = require('../config/database');
const bcrypt = require('bcrypt');  // Add this
const jwt = require('jsonwebtoken');

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
// Login user
exports.login = async (req, res) => {
  try {
    // 1. Get email and password from request body
    const { email, password } = req.body;
    
    // 2. Find user by email
  const userQuery =  `SELECT * FROM users WHERE email = $1`;
  const userResult = await pgPool.query(userQuery, [email]);
  
    
    // 3. Check if user exists
    if (userResult.rows.length === 0){ 
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      })
     } 
     const user = userResult.rows[0];
    
    // 4. Compare password with hash
     const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) { 
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials"
      }) }
    
    // 5. Create JWT token
    const token = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // 6. Send response with token
return res.status(200).json({
  success: true,
  message: "Login successful",
  token: token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};