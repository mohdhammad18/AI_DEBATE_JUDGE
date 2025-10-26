#  AI Debate Judge

A modern, AI-powered debate platform that facilitates structured debates and provides intelligent judging using advanced language models. Built with React, Node.js, and AI technology.

# Features

 Real-time debate sessions that are time and argument based as per user's choice.
 AI-powered judging and feedback
 Detailed analytics and performance tracking
 Secure user authentication
 Responsive design for all devices

# Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- Lucide Icons
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JSON Web Tokens
- Python (AI Model Server)

##  Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16.x or later)
- npm (v8.x or later)
- Python (v3.8 or later)
- MongoDB (v6.0 or later)
- Git

##  Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MD-IESA-ALI-AHMED/AI_DEBATE_JUDGE.git
   cd AI_DEBATE_JUDGE
   ```

2. **Frontend Setup**
   ```bash
   # Navigate to frontend directory
   cd frontend

   # Install dependencies
   npm install

   # Create .env file
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

3. **Backend Setup**
   ```bash
   # Navigate to backend directory
   cd ../backend

   # Install Node.js dependencies
   npm install

   # Install Python dependencies
   pip install -r requirements.txt

   # Create .env file
   ```
   Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ai_debate_judge
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   - Ensure MongoDB is running on your system
   - The application will automatically create the required collections

##  Running the Application

1. **Start the Backend Server**
   ```bash
   # From the backend directory
   npm run dev
   ```
   This will start both the Node.js server and the Python AI model server.

2. **Start the Frontend Development Server**
   ```bash
   # From the frontend directory
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

##  Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_debate_judge
JWT_SECRET=your_jwt_secret_key
```

##  Application Structure

```
AI_DEBATE_JUDGE/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── pages/         # React components/pages
│   │   └── styles/        # CSS and styling files
│   └── package.json       # Frontend dependencies
├── backend/               # Node.js & Express backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middlewares
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── model_server.py   # Python AI model server
│   └── package.json      # Backend dependencies
└── README.md             # Project documentation
```

##  Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request


##  Authors

- MOHD HAMMAD ANSARI & TANAY KATTAYAN

##  Acknowledgments

- The React and Node.js communities for excellent documentation and resources
