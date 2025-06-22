# 🌤️ Real-time Weather Dashboard

A modern, full-stack weather application with real-time updates, database storage, and a beautiful dashboard interface.

## ✨ Features

- **Real-time Weather Data**: Live weather information from WeatherStack API
- **Database Storage**: Persistent SQLite database for weather history
- **Beautiful Dashboard**: Modern UI with responsive design
- **Weather History**: Track and analyze weather patterns over time
- **Multiple Locations**: Support for multiple cities
- **Real-time Updates**: WebSocket integration for live data
- **Weather Analytics**: Dashboard statistics and trends

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Lightweight database
- **WebSockets** - Real-time communication
- **WeatherStack API** - Weather data provider

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- Git

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Usage

1. **Start both servers**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Submit Weather Request**:
   - Enter date, location, and optional notes
   - Click submit to create a weather record

3. **View Weather Data**:
   - Use the lookup feature to retrieve weather by ID
   - View dashboard statistics
   - Browse weather history

## 📊 API Endpoints

- `POST /weather` - Create weather record
- `GET /weather/{id}` - Get weather by ID
- `GET /weather` - Get all weather records
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /weather/location/{location}` - Get weather by location
- `WS /ws` - WebSocket for real-time updates

## 🔧 Development

### Project Structure
```
├── backend/
│   ├── main.py          # FastAPI application
│   ├── database.py      # Database models
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   └── lib/         # Utility functions
│   └── package.json     # Node.js dependencies
└── README.md
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
WEATHERSTACK_API_KEY=your_api_key_here
```

## 🎯 Future Enhancements

- [ ] Weather maps integration
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Weather alerts
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- WeatherStack for weather data API
- Next.js team for the amazing framework
- FastAPI for the modern Python web framework
