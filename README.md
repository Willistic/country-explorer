# 🌍 Countries Explorer

A modern React application that displays country information with flags, capitals, and populations from around the world.

## ✨ Features

- 🏳️ **Country Flags**: Display flags for all countries
- 🏛️ **Capital Cities**: Show capital cities for each country  
- 👥 **Population Data**: Display formatted population numbers
- 📱 **Responsive Design**: Beautiful, mobile-friendly interface
- 📄 **Pagination**: Navigate through countries with 25 per page
- 💾 **Persistent State**: Remembers your page position across refreshes
- 🔄 **Alphabetical Order**: Countries automatically sorted A-Z

## 🛠️ Technologies Used

- **React 19** with TypeScript
- **Redux Toolkit** for state management  
- **Vite** for fast development and building
- **CSS Modules** for component-scoped styling
- **REST Countries API** for country data

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/countries-explorer.git
   cd countries-explorer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── component/           # React components
│   ├── CountryTable.tsx     # Main table component
│   ├── Pagination.tsx       # Pagination controls
│   └── *.module.css        # Component styles
├── store/              # Redux store
│   ├── countriesSlice.ts   # Countries state management
│   ├── store.ts           # Store configuration
│   └── hooks.ts           # Typed Redux hooks
├── hooks/              # Custom React hooks
└── App.tsx             # Main application component
```

## 🌐 API

This application uses the [REST Countries API](https://restcountries.com/) to fetch country data including:
- Country names
- Capital cities  
- Population figures
- Flag images

## 📱 Screenshots

The application displays a clean, modern interface with:
- Responsive table design
- Country flags and information
- Smooth pagination controls
- Loading and error states
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
