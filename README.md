# Gym Schedule Application

A modern, full-stack web application for managing gym workout schedules and notes. Built with Next.js 16, MongoDB, and Docker, featuring automated CI/CD pipelines.

![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

- 📅 **Gym Schedule Management** - Create and manage weekly workout routines
- 📝 **Notes & Tasks** - Keep track of fitness goals and progress
- 🎯 **Day-wise Organization** - Organize workouts by day of the week
- 💪 **Exercise Tracking** - Track sets, reps, and weights for each exercise
- 🎨 **Modern UI** - Clean, responsive design with dark/light mode support
- 🐳 **Docker Ready** - Containerized for easy deployment
- 🚀 **CI/CD Pipeline** - Automated testing and Docker image builds

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Mongoose
- **Deployment:** Docker, GitHub Actions
- **Font:** Inter (Google Fonts)

## 📋 Prerequisites

- Node.js 20.x or higher
- MongoDB Atlas account (or local MongoDB)
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Utkarsh-Sorathia/Gym-schedule-application.git
cd Gym-schedule-application
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build --build-arg MONGODB_URI="your_mongodb_uri" -t gym-schedule-app:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  gym-schedule-app:latest
```

### Using Pre-built Docker Image

Download the Docker image artifact from GitHub Actions:

```bash
# Load the image
docker load -i gym-schedule-app.tar

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  gym-schedule-app:latest
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
gym-schedule-application/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── notes/        # Notes CRUD endpoints
│   │   │   └── schedule/     # Schedule CRUD endpoints
│   │   ├── notes/            # Notes page
│   │   ├── schedule/         # Schedule page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   ├── lib/                  # Utilities (DB connection)
│   └── models/               # Mongoose models
├── .github/
│   └── workflows/            # CI/CD pipelines
│       ├── ci.yml            # Continuous Integration
│       └── cd.yml            # Continuous Deployment
├── Dockerfile                # Docker configuration
├── next.config.ts            # Next.js configuration
└── tailwind.config.ts        # Tailwind CSS configuration
```

## 🔄 CI/CD Pipeline

### Continuous Integration (CI)
- Runs on every push and pull request to `main`
- Lints code with ESLint
- Builds the application
- Uploads build artifacts

### Continuous Deployment (CD)
- Triggers after successful CI completion
- Builds optimized Docker image
- Saves image as TAR artifact
- Available for download from GitHub Actions

## 🌐 API Endpoints

### Schedule API

- `GET /api/schedule` - Get all schedules
- `GET /api/schedule?day=Monday` - Get schedule for specific day
- `POST /api/schedule` - Create/update schedule
- `PUT /api/schedule/[id]` - Update specific schedule
- `DELETE /api/schedule/[id]` - Delete schedule

### Notes API

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## 🎨 Features in Detail

### Gym Schedule
- Create workout plans for each day of the week
- Add multiple exercises per day
- Track sets, reps, and weights
- Edit and delete exercises
- Persistent storage in MongoDB

### Notes & Tasks
- Create and manage fitness notes
- Mark tasks as complete
- Edit and delete notes
- Organized list view

## 🔧 Configuration

### Next.js Config
- Standalone output for optimized Docker builds
- TypeScript support
- Tailwind CSS integration

### Docker Optimization
- Multi-stage build for smaller image size
- Non-root user for security
- Standalone Next.js server
- Optimized layer caching

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NODE_ENV` | Environment (production/development) | Auto-set |
| `PORT` | Server port (default: 3000) | No |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Utkarsh Sorathia**

- GitHub: [@Utkarsh-Sorathia](https://github.com/Utkarsh-Sorathia)
- Repository: [Gym-schedule-application](https://github.com/Utkarsh-Sorathia/Gym-schedule-application)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Tailwind CSS for the styling system

---

**Note:** Make sure to set up your MongoDB connection string in the environment variables before running the application.
