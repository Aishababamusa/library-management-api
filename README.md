# Library Management System API

A full-stack backend API for managing library operations with hybrid database architecture (PostgreSQL + MongoDB).

## About This Project

This is my third backend project, built as part of my journey to becoming a professional backend developer. I developed this API from scratch to showcase my ability to:
- Design and implement secure RESTful APIs
- Work with both relational (PostgreSQL) and NoSQL (MongoDB) databases
- Implement authentication and authorization
- Write clean, maintainable, and well-structured code
- Build real-world features that users actually need

**Project Timeline:** February 8, 2026 - March 13, 2026

---

## Features

- User authentication with JWT
- Role-based access control (Admin & Member)
- Book management (CRUD operations)
- Borrowing system with business rules
- Review and rating system
- Advanced search and filtering
- Overdue loan tracking
- Hybrid database architecture

---

## Tech Stack

**Backend:**
- Node.js
- Express.js

**Databases:**
- PostgreSQL (Relational data - Users, Books, Loans)
- MongoDB (NoSQL - Reviews & Ratings)

**Authentication & Security:**
- JWT (JSON Web Tokens)
- bcrypt (Password hashing)

**Architecture:**
- MVC Pattern
- RESTful API design

---

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- PostgreSQL installed locally
- MongoDB Atlas account (free tier)
- Git
- Postman or similar API testing tool

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Aishababamusa/library-management-api.git
cd library-management-api
```

### 2. Install dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `pg` - PostgreSQL client
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables

### 3. Set up PostgreSQL database

Create a new database:
```sql
CREATE DATABASE library_management;
```

Create the required tables:
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50),
  genre VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  available_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans table
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  book_id INTEGER REFERENCES books(id),
  borrowed_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  return_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Set up MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Get your connection string

### 5. Configure environment variables

Create a `.env` file in the root directory:
```env
# PostgreSQL
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/library_management

# MongoDB (replace with your MongoDB Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_db

# Server
PORT=3000

# JWT Secret (use a strong random string - generate one at https://randomkeygen.com/)
JWT_SECRET=your_super_secret_random_jwt_key_here
```

** Important:** Never commit the `.env` file to version control!

### 6. Start the server
```bash
npm start
```

Server will run on `http://localhost:3000`

You should see:
```
MongoDB connected successfully
PostgreSQL connected successfully
Server running on port 3000
```

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `random_secret_string_here` |

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/login` | User login | No |
| POST | `/api/users` | Register new user | No |

**Example Login Request:**
```json
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Aisha",
    "email": "user@example.com",
    "role": "member"
  }
}
```

---

### Books
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/books` | Get all books | No |
| GET | `/api/books/search?title=gatsby` | Search books by title/author/genre | No |
| GET | `/api/books/:id` | Get book by ID | No |
| GET | `/api/books/:id/reviews` | Get book with all reviews | No |
| POST | `/api/books` | Create new book | Admin only |
| PUT | `/api/books/:id` | Update book | Admin only |
| DELETE | `/api/books/:id` | Delete book | Admin only |

**Search Examples:**
```
GET /api/books/search?title=gatsby
GET /api/books/search?author=tolkien
GET /api/books/search?genre=Fiction
GET /api/books/search?available=true
GET /api/books/search?title=great&available=true
```

---

### Loans
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/loans` | Get all loans | Admin only |
| GET | `/api/loans/active` | Get all active loans | Admin only |
| GET | `/api/loans/overdue` | Get all overdue loans | Admin only |
| GET | `/api/loans/user/:user_id` | Get user's loan history | Authenticated |
| POST | `/api/loans/borrow` | Borrow a book | Authenticated |
| PUT | `/api/loans/return/:id` | Return a book | Authenticated |

**Borrow Book Request:**
```json
POST /api/loans/borrow
{
  "user_id": 1,
  "book_id": 5
}
```

---

### Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Create review | Authenticated |
| GET | `/api/reviews/book/:book_id` | Get all reviews for a book | No |
| GET | `/api/reviews/user/:user_id` | Get all reviews by a user | No |
| PUT | `/api/reviews/:id` | Update review | Authenticated |
| DELETE | `/api/reviews/:id` | Delete review | Authenticated |

---

##  Business Rules

- **Borrowing Limit:** Maximum 3 active loans per user
- **Loan Period:** 14 days from borrow date
- **Overdue Detection:** Books marked as overdue if not returned by due date
- **Availability Check:** Only books with `available_quantity > 0` can be borrowed
- **Auto-calculation:** Due dates automatically calculated (borrow_date + 14 days)

---

##  Project Structure
```
library-management-system/
├── src/
│   ├── config/
│   │   └── database.js          # Database connections (PostgreSQL & MongoDB)
│   ├── controllers/
│   │   ├── bookController.js    # Book CRUD logic
│   │   ├── userController.js    # User & auth logic
│   │   ├── loanController.js    # Borrowing system logic
│   │   └── reviewController.js  # Review CRUD logic
│   ├── models/
│   │   └── Reviews.js           # MongoDB schema
│   ├── routes/
│   │   ├── bookRoutes.js
│   │   ├── userRoutes.js
│   │   ├── loanRoutes.js
│   │   └── reviewRoutes.js
│   └── middleware/
│       └── authMiddleware.js    # JWT verification & role checks
├── .env                         # Environment variables (not in git)
├── .gitignore
├── server.js                    # Entry point
├── package.json
└── README.md
```

---

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header.

### Getting a Token:
1. Login via `POST /api/users/login`
2. Copy the token from the response
3. Include it in subsequent requests

### Using the Token:
```
Authorization: Bearer your_jwt_token_here
```

**In Postman:**
1. Go to "Headers" tab
2. Add key: `Authorization`
3. Add value: `Bearer <paste_your_token>`

---

##  What I Learned

Building this project taught me:
- **Hybrid Database Architecture:** Understanding when to use SQL (structured, relational data) vs NoSQL (flexible, document-based data)
- **JWT Authentication Flow:** Token generation, verification, and secure session management
- **Password Security:** Hashing with bcrypt, never storing plain text passwords
- **Complex SQL Queries:** Multi-table JOINs, dynamic query building, aggregate functions
- **Business Logic Implementation:** Enforcing rules like borrowing limits and overdue detection
- **RESTful API Design:** Proper HTTP methods, status codes, and resource naming
- **MVC Architecture:** Separation of concerns for maintainable code
- **Error Handling:** Graceful error responses and debugging techniques
- **Role-Based Access Control:** Protecting routes based on user permissions

---

##  Testing

### Test User Accounts

Create test users with different roles:

**Admin User:**
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@library.com', '$2b$10$...', 'admin');
```

**Member User:**
```sql
INSERT INTO users (name, email, password_hash, role)
VALUES ('Member User', 'member@library.com', '$2b$10$...', 'member');
```

### Test Scenarios

1. **Authentication:**
   - Login with valid credentials
   - Login with invalid credentials
   - Access protected route without token
   - Access admin route as member

2. **Borrowing System:**
   - Borrow an available book
   - Try borrowing when at limit (3 books)
   - Try borrowing unavailable book
   - Return a book
   - Check overdue loans

3. **Search & Filter:**
   - Search by title (partial match)
   - Search by author
   - Filter by availability
   - Combine multiple filters

---

##  Future Enhancements

Potential features to add:
- [ ] Email notifications for overdue books
- [ ] Book reservation system
- [ ] Fine calculation for overdue returns
- [ ] Admin dashboard statistics
- [ ] Pagination for large result sets
- [ ] Book cover image uploads
- [ ] User profile pictures
- [ ] Password reset functionality
- [ ] Rate limiting for API security

---

##  Contact

**Aisha Baba Musa**
- GitHub: [@Aishababamusa](https://github.com/Aishababamusa)
- LinkedIn: [Aisha Baba Musa](https://linkedin.com/in/aishababamusa)
- Email: aishababamusa103@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

##  Acknowledgments

Built as Portfolio Project #3 for developing a career as a backend engineer.

Special thanks to the developer community for resources and documentation.

---

**⭐ If you find this project helpful, please give it a star!**