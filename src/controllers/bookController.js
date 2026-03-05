

const {pgPool} = require('../config/database');
// Create a new book
exports.createBook = async (req, res) => {
   try {
    // 1. Get data from request body
    const { title, author, isbn, genre, quantity } = req.body;
    const available_quantity = quantity; // Initially all available
    
    // 2. SQL query - INSERT INTO books table
    const query = `
      INSERT INTO books (title, author, isbn, genre, quantity, available_quantity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    // 3. Execute query - what goes here?
    const result = await pgPool.query(query, [title, author, isbn, genre, quantity, available_quantity]);
    
    // 4. Send response - what should you send back?
    res.status(201).json({
      success: true,
      message: "Book created successfully", 
      book: result.rows[0]
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    // 1. SQL query
    const query = 'SELECT * FROM books';
    
    // 2. Execute query (no parameters needed)
    const result = await pgPool.query(query);
    
    // 3. Check if any books exist
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books found"
      });
    }
    
    // 4. Send response with all books
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      books: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const {id} = req.params;
    const query = 'SELECT * FROM books WHERE id = $1'
    const result = await pgPool.query(query, [id]);
    if(result.rows.length === 0){
      return res.status(404).json({
        success: false,
        message: `No book found for this ${id}`
      })
    } return res.status(200).json({
      success: true,
      count: result.rows.length,
      books: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a book
exports.updateBook = async (req, res) => {
  try {
    // 1. Get id from params
    const {id} = req.params;

    
    // 2. Get update data from body
    const { title, author, isbn, genre, quantity, available_quantity } = req.body;
    // 3. SQL UPDATE query
    const query = `
  UPDATE books 
  SET title=$1, author=$2, isbn=$3, genre=$4, quantity=$5, available_quantity=$6 
  WHERE id=$7 
  RETURNING *
`;
    // 4. Execute query
    const result = await pgPool.query(query, [
      title, 
      author, 
      isbn, 
      genre, 
      quantity, 
      available_quantity,
      id  // $7 - the WHERE clause
    ]);
    // 5. Check if book exists
    if(result.rows.length === 0){
      // 6. Send response
      return res.status(404).json({
        success: false,
        message: `The book with ID ${id} is not found`
      })
    } return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      books: result.rows[0]
    })
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a book
exports.deleteBook = async (req, res) => {
  try {
    const {id} = req.params;
    const query = 'DELETE FROM books WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    if(result.rows.length === 0){
      return res.status(404).json({
        successs: false,
        message: `The book with the ID ${id} is not found`
      })
    } return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      books: result.rows[0]
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};