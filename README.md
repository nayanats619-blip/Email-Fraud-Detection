# 🛡️ AI Email Fraud Detector

Advanced email fraud detection system with MongoDB Atlas integration, real-time analysis, and comprehensive analytics dashboard.

## 📋 Features

### Core Functionality
- ✅ **Real-time Email Analysis** - Instant fraud detection on email content
- ✅ **Risk Score Calculation** - 0-100% fraud probability assessment
- ✅ **Multi-level Classification** - Safe / Suspicious / Fraud categories
- ✅ **Detailed Analysis Report** - Specific reasons and indicators identified
- ✅ **Keyword Detection** - Identifies suspicious patterns and phishing keywords

### Advanced Features
- 📊 **Analytics Dashboard** - View statistics and trends
- 📋 **Analysis History** - Track all previous analyses
- 📥 **CSV Export** - Export analysis data for reporting
- 💾 **MongoDB Storage** - Persistent data storage with MongoDB Atlas
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ✨ **Modern UI** - Advanced CSS with animations and gradients

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- Advanced CSS3 with animations
- Vanilla JavaScript (ES6+)
- Responsive Design

**Backend:**
- Node.js
- Express.js
- Mongoose ODM

**Database:**
- MongoDB Atlas (Cloud)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Step 1: Clone/Download Project
```bash
cd /path/to/your/project
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- express (v5.2.1)
- mongoose (v9.4.1)
- dotenv (v17.4.1)
- cors (v2.8.6)
- nodemon (v3.1.14) - dev dependency

### Step 3: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user with password
5. Get connection string
6. Whitelist your IP address

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/emailfraud?retryWrites=true&w=majority
PORT=5000
```

**Important:** Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

### Step 5: Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start at: `http://localhost:5000`

## 🚀 Usage

1. **Open the application** in your browser at `http://localhost:5000`
2. **Enter sender email** in the input field
3. **Paste email content** in the text area
4. **Click "Analyze Now"** to run the fraud detection
5. **View results** with risk score and detailed analysis
6. **Check History** tab to see all previous analyses
7. **View Statistics** for trends and summary data

## 🔍 Detection Algorithm

The fraud detection system checks for:

### High Risk Indicators (8 points each)
- Phishing keywords (verify account, confirm identity, etc.)
- Requests for personal/financial information
- Download/attachment prompts

### Medium Risk Indicators (5-15 points)
- Suspicious email domains
- Invalid email formats
- Urgency language
- Excessive capitalization

### Low Risk Indicators (3 points each)
- Suspicious repetitive keywords
- Generic greetings

### Risk Score Breakdown
- **0-30%**: Safe ✅
- **30-70%**: Suspicious ⚠️
- **70-100%**: Fraud 🚫

## 📊 API Endpoints

### Analysis
- `POST /check-email` - Analyze email for fraud
  ```json
  {
    "senderEmail": "sender@example.com",
    "emailText": "Email content here..."
  }
  ```

### History
- `GET /api/history` - Get analysis history
- `GET /api/analysis/:id` - Get specific analysis
- `DELETE /api/analysis/:id` - Delete analysis
- `POST /api/clear-history` - Clear all history

### Statistics
- `GET /api/statistics` - Get overall statistics

### Export
- `GET /api/export/csv` - Export as CSV file

## 🎨 Advanced CSS Features

- **Glassmorphism Design** - Modern frosted glass effect
- **Gradient Backgrounds** - Dynamic color gradients
- **Smooth Animations** - Fade, slide, and bounce effects
- **Responsive Grid Layout** - Adapts to all screen sizes
- **Custom Components** - Styled buttons, forms, cards
- **Dark Mode** - Eye-friendly dark theme
- **Accessibility** - Proper contrast ratios and focus states

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env file
- Verify credentials are correct
- Ensure IP is whitelisted in MongoDB Atlas
- Check internet connection

### Server won't start
- Ensure port 5000 is not in use
- Check Node.js is installed: `node --version`
- Check npm packages: `npm list`

### Frontend errors
- Clear browser cache: Ctrl+Shift+Del
- Check browser console: F12
- Verify server is running

## 📝 Project Structure

```
Email/
├── index.html          - Main application page
├── about.html          - About page with documentation
├── server.js           - Express server & API routes
├── db.js               - MongoDB connection
├── models.js           - Mongoose schema
├── fraudDetection.js   - Fraud detection algorithm
├── script.js           - Frontend JavaScript
├── style.css           - Advanced CSS styling
├── package.json        - Dependencies configuration
└── .env                - Environment variables
```

## 🔐 Security Recommendations

1. **Never commit .env file** - Add to .gitignore
2. **Use strong passwords** - For MongoDB Atlas
3. **Validate input** - All user inputs are validated
4. **Use HTTPS** - In production deployment
5. **Rate limiting** - Consider adding for API endpoints
6. **Input sanitization** - Prevents injection attacks

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/)
- [Node.js Docs](https://nodejs.org/docs/)

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created as an advanced email fraud detection system with modern web technologies.

## 🎯 Future Enhancements

- Machine learning model integration
- Real-time email header analysis
- Attachment scanning
- User authentication & login
- Email templates for reports
- API rate limiting
- Advanced analytics
- Mobile app version

---

**Stay Safe Online! 🛡️**
