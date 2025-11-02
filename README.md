# 🌍 Country Explorer

A full-stack web application that displays comprehensive country information with an elegant, responsive interface. Built with React 19, TypeScript, Express.js, and MongoDB.

## ✨ Features

### 🎨 Frontend Features
- 🏳️ **Country Flags**: Display high-quality flags for all countries
- 🏛️ **Capital Cities**: Show capital cities with proper formatting
- 👥 **Population Data**: Display formatted population numbers with commas
- � **Search Functionality**: Search countries by name in real-time
- 🌍 **Region Filtering**: Filter countries by geographic regions
- �📱 **Responsive Design**: Beautiful, mobile-first interface
- 📄 **Server-Side Pagination**: Efficient pagination with 25 countries per page
- 💾 **Persistent State**: Remembers page position and preferences
- 🔄 **Alphabetical Sorting**: Countries automatically sorted A-Z
- ⚡ **Fast Loading**: Optimized with caching and efficient data fetching

### � Backend Features
- 🚀 **Express.js API**: RESTful API with TypeScript
- 🗄️ **MongoDB Integration**: Persistent data storage with Mongoose
- 🔒 **Security**: Helmet, CORS, and rate limiting
- 📊 **Caching**: 1-hour cache for improved performance
- 🛡️ **Error Handling**: Comprehensive error responses
- 📈 **Health Monitoring**: Built-in health check endpoints
- 🔍 **Search & Filter**: Backend search and region filtering
- 📄 **Pagination**: Server-side pagination for optimal performance

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **Vite** for fast development and building  
- **CSS Modules** for component-scoped styling
- **Axios** for API communication

### Backend
- **Node.js** with **Express.js** framework
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Express Rate Limit** for API protection
- **NodeCache** for response caching

### External APIs
- **REST Countries API** for comprehensive country data

## 🚀 Quick Start

### Prerequisites
- **Node.js** (version 18 or higher)
- **MongoDB** (version 6 or higher)
- **npm** or **yarn**

### 🎯 One-Command Setup

```bash
# Clone and start everything
git clone https://github.com/Willistic/country-explorer.git
cd country-explorer
chmod +x start-backend.sh
./start-backend.sh
```

Then in a new terminal:
```bash
npm run dev
```

### 📋 Manual Setup

#### 1. Clone & Install
```bash
git clone https://github.com/Willistic/country-explorer.git
cd country-explorer
npm install
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB connection string
```

#### 3. Start MongoDB
```bash
# Option 1: Using our startup script
./start-backend.sh

# Option 2: Manual MongoDB start
mongod --port 27017 --dbpath /tmp/mongodb-data
```

#### 4. Start Backend Server
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5001
```

#### 5. Start Frontend
```bash
# In project root
npm run dev
# Frontend runs on http://localhost:5174
```

## 📁 Project Structure

```
country-explorer/
├── 📂 src/                     # Frontend source code
│   ├── 📂 component/           # React components
│   │   ├── CountryTable.tsx    # Main countries table
│   │   ├── Pagination.tsx      # Pagination controls
│   │   ├── WorldMapHeader.tsx  # Animated header
│   │   └── *.module.css        # Component styles
│   ├── 📂 store/               # Redux store
│   │   ├── countriesSlice.ts   # Countries state management
│   │   ├── store.ts            # Store configuration
│   │   └── hooks.ts            # Typed Redux hooks
│   ├── 📂 context/             # React context providers
│   ├── 📂 hooks/               # Custom React hooks
│   └── App.tsx                 # Main application
├── 📂 backend/                 # Backend API server
│   ├── 📂 src/
│   │   ├── 📂 controllers/     # Route controllers
│   │   ├── 📂 middleware/      # Express middleware
│   │   ├── 📂 models/          # MongoDB models
│   │   ├── 📂 routes/          # API routes
│   │   ├── 📂 services/        # Business logic
│   │   ├── 📂 types/           # TypeScript types
│   │   └── server.ts           # Main server file
│   └── 📂 tests/               # API tests
├── 📂 shared/                  # Shared types/utilities
├── start-backend.sh            # Quick start script
├── test-backend.sh             # Backend testing script
└── README.md
```

## 🌐 API Endpoints

### Countries API
```bash
# Get all countries (paginated)
GET /api/v1/countries?page=1&limit=25

# Search countries
GET /api/v1/countries?search=united&limit=10

# Filter by region
GET /api/v1/countries?region=Europe&page=2

# Combined filters
GET /api/v1/countries?search=united&region=Americas&page=1&limit=5
```

### Health Check
```bash
# Check API health
GET /health
```

## 🧪 Testing

### Backend API Testing
```bash
# Run comprehensive API tests
./test-backend.sh

# Or run TypeScript tests
cd backend
npx tsx tests/api.test.ts

# Manual testing with curl
curl "http://localhost:5001/health" | jq
curl "http://localhost:5001/api/v1/countries?limit=3" | jq
```

## 🎨 Screenshots & Demo

The application features:
- **Modern UI**: Clean, responsive design with smooth animations
- **Fast Search**: Real-time country search with highlighting
- **Smart Pagination**: Server-side pagination with page memory
- **Mobile-First**: Fully responsive across all devices
- **Error Handling**: Graceful error states and loading indicators

## 🔧 Development

### Environment Variables

Create `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/country-explorer
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run test suite

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render)
```bash
# Set environment variables
MONGODB_URI=your_mongodb_connection_string
PORT=5001
NODE_ENV=production

# The app will build and start automatically
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [REST Countries API](https://restcountries.com/) for comprehensive country data
- [Flagcdn](https://flagcdn.com/) for high-quality flag images
- The open-source community for amazing tools and libraries

---

**Built with ❤️ using React 19, TypeScript, Express.js, and MongoDB**
