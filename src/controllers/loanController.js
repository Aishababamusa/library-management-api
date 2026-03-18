// What do you need to import here?
const {pgPool} = require('../config/database');

// Get all loans (Admin view)
exports.getAllLoans = async (req, res) => {
  try {
    const query = `
      SELECT 
        loans.id,
        loans.borrowed_date,
        loans.due_date,
        loans.return_date,
        loans.status,
        users.name as user_name,
        users.email as user_email,
        books.title as book_title,
        books.author as book_author
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      ORDER BY loans.borrowed_date DESC
    `;
    
    const result = await pgPool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No loans found"
      });
    }
    
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      loans: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get loans by user ID (User's borrowing history)
exports.getLoansByUser = async (req, res) => {
  try {
    const {user_id} = req.params;
    const query = `SELECT 
        loans.id,
        loans.borrowed_date,
        loans.due_date,
        loans.return_date,
        loans.status,
        users.name as user_name,
        users.email as user_email,
        books.title as book_title,
        books.author as book_author
    FROM loans
    JOIN users ON loans.user_id = users.id
    JOIN books ON loans.book_id = books.id
    WHERE loans.user_id = $1
    ORDER BY loans.borrowed_date DESC`
    const result = await pgPool.query(query, [user_id]);
    if(result.rows.length === 0){
        return res.status(404).json({
            success: false,
            message: `User with this ID ${user_id} is not found`,

        });
    } return res.status(200).json({
        success: true,
        count: result.rows.length,
        loans: result.rows
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active loans only
exports.getActiveLoans = async (req, res) => {
  try {
    const query = `
      SELECT 
        loans.id,
        loans.borrowed_date,
        loans.due_date,
        loans.return_date,
        loans.status,
        users.name as user_name,
        users.email as user_email,
        books.title as book_title,
        books.author as book_author
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      WHERE loans.status = 'active'
      ORDER BY loans.borrowed_date DESC
    `;
    
    const result = await pgPool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Active loan was found"
      });
    }
    
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      loans: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.borrowBook = async (req, res) => {
  try {
    // Get data from request
    const { user_id, book_id } = req.body;
    
    // Step 1: Check if book exists and is available
const bookQuery = 'SELECT * FROM books WHERE id = $1';
const bookResult = await pgPool.query(bookQuery, [book_id]);

// Check if book exists
if (bookResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: `Book with ID ${book_id} not found`
  });
}

// Check if book is available
const book = bookResult.rows[0];
if (book.available_quantity < 1) {
  return res.status(400).json({
    success: false,
    message: `Book "${book.title}" is currently unavailable`
  });
}

// Step 2: Check user's active loans count
const loanCountQuery = `
  SELECT COUNT(*) FROM loans 
  WHERE user_id = $1 AND status = 'active'
`;
const loanCountResult = await pgPool.query(loanCountQuery, [user_id]);

const activeLoanCount = parseInt(loanCountResult.rows[0].count);

// Check borrowing limit (max 3 books)
if (activeLoanCount >= 3) {
  return res.status(400).json({
    success: false,
    message: `Borrowing limit reached. You have ${activeLoanCount} active loans. Maximum is 3.`
  });
}

// If we get here, user can borrow! Continue to Step 3...

    // Step 3: Create the loan
    const loanQuery = `INSERT INTO loans (user_id, book_id, borrowed_date, due_date, status)
VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 'active')
RETURNING *`
const loanResult = await pgPool.query(loanQuery, [user_id, book_id])
    
    // Step 4: Update book's available_quantity
  const updateQuery = `
  UPDATE books 
  SET available_quantity = available_quantity - 1 
  WHERE id = $1
  RETURNING *
`;
  const updateResult = await pgPool.query(updateQuery, [book_id])  
    // Step 5: Return success
return res.status(201).json({
  success: true,
  message: `Book "${book.title}" borrowed successfully! Due date: ${loanResult.rows[0].due_date}`,
  loan: loanResult.rows[0]
});
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.returnBook = async (req, res) => {
  try {
    // Get loan_id from params
    const { id } = req.params;  // The loan ID
    
    // Step 1: Find the loan and check if it exists and is active
const loanQuery = `SELECT * FROM loans WHERE id = $1`;
const loanResult = await pgPool.query(loanQuery, [id]);

// Check if loan exists
if (loanResult.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: `Loan with ID ${id} not found`
  });
}

const loan = loanResult.rows[0];

// Check if loan is active (can only return active loans)
if (loan.status !== 'active') {
  return res.status(400).json({
    success: false,
    message: `Loan with ID ${id} has already been returned`
  });
}
    
    // Step 2: Check if it's overdue (determine the status)
const today = new Date();
const dueDate = new Date(loan.due_date);
const isOverdue = today > dueDate;

// Determine status based on return timing
const newStatus = isOverdue ? 'overdue' : 'returned';
    
    // Step 3: Update the loan (set return_date and status)
    const updateLoanQuery = `UPDATE loans 
SET return_date = CURRENT_DATE, status = $1
WHERE id = $2
RETURNING *`
const updateResult = await pgPool.query(updateLoanQuery, [newStatus, id])
    
    // Step 4: Increase book's available_quantity by 1
const increaseBookQuery = `
  UPDATE books 
  SET available_quantity = available_quantity + 1 
  WHERE id = $1
  RETURNING *
`;
const increaseBookResult = await pgPool.query(increaseBookQuery, [loan.book_id]);
    
   // Step 5: Return success
return res.status(200).json({
  success: true,
  message: `Book returned successfully! Status: ${newStatus}`,
  loan: updateResult.rows[0]
});
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
exports.getOverdueLoans = async (req, res) => {
  try {
    const query = `
      SELECT 
        loans.id,
        loans.borrowed_date,
        loans.due_date,
        loans.return_date,
        loans.status,
        users.name as user_name,
        users.email as user_email,
        books.title as book_title,
        books.author as book_author
      FROM loans
      JOIN users ON loans.user_id = users.id
      JOIN books ON loans.book_id = books.id
      WHERE loans.status = 'active' AND loans.due_date < CURRENT_DATE
      ORDER BY loans.due_date ASC
    `;
    
    const result = await pgPool.query(query);
    
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      overdueLoans: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};