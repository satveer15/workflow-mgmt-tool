<div align="center">

# Daily Workflow Management System

### 🚀 A Modern Task Management Platform with Role-Based Access Control

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack task management system featuring JWT authentication, drag-and-drop Kanban boards, real-time notifications, advanced analytics, and comprehensive role-based permissions. Built with modern technologies and containerized for easy deployment.

[Features](#features) • [Quick Start](#getting-started) • [API Docs](#api-documentation) • [Contributing](#contributing)

---

</div>

## 📋 Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Quick Start](#quick-start-recommended)
  - [Development with Hot Reload](#development-with-hot-reload)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [User Endpoints](#user-endpoints)
  - [Notification Endpoints](#notification-endpoints)
  - [Analytics Endpoints](#analytics-endpoints)
- [Features Guide](#features-guide)
- [Development Phases](#development-phases)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Performance Tips](#performance-tips)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## ✨ Features

- **User Authentication**: JWT-based authentication with role-based access control (Admin, Manager, Employee)
- **Task Management**: Create, assign, update, and track tasks with priority levels and due dates
- **Kanban Board**: Drag-and-drop interface for visual task management across different statuses
- **Advanced Search**: Real-time search across tasks with instant results
- **User Filtering**: Filter tasks by user, priority, status, and "My Tasks Only" view
- **Quick Status Updates**: Click any task to quickly update its status
- **Role-Based Permissions**: Granular permission system based on user roles
- **Notifications**: Real-time notifications for task assignments and updates
- **Analytics Dashboard**: Task statistics, productivity metrics, and visual charts
- **Responsive UI**: Modern, clean interface that works across devices
- **Dark Mode Support**: Automatic dark mode for better viewing experience

## 📸 Screenshots

<div align="center">

### Dashboard & Task Management
<img width="1726" height="954" alt="image" src="https://github.com/user-attachments/assets/e954e56c-5a18-4a3f-8e10-12e291946f3c" />

### Kanban Board with Drag & Drop
<img width="1724" height="954" alt="image" src="https://github.com/user-attachments/assets/3382d358-3ae0-4f0d-95d3-591c2d64e135" />


### Real-time Notifications
<img width="1723" height="955" alt="image" src="https://github.com/user-attachments/assets/cde19f7a-69b5-4ef6-a02e-76a0cab0feb8" />


### Analytics Dashboard
<img width="1725" height="963" alt="image" src="https://github.com/user-attachments/assets/c6b846df-4d6e-49bf-a847-5365e89b1329" />

<img width="1727" height="957" alt="image" src="https://github.com/user-attachments/assets/546a234c-078d-4a30-a512-8a36cf92a924" />

</div>

> **Note**: Replace the placeholders above with actual screenshots of your application. Recommended image dimensions: 1200x800px.

## 🛠️ Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.0**
  - Spring Web
  - Spring Data JPA
  - Spring Security
  - Spring Validation
- **MySQL 8.0**
- **JWT (JSON Web Tokens)** for authentication
- **Maven** for dependency management
- **Lombok** for code generation

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management
- **@dnd-kit/core** for drag-and-drop functionality
- **Recharts** for analytics visualizations

### DevOps
- **Docker & Docker Compose** for containerization
- **Multi-stage Docker builds** for optimized images
- **Hot-reload development** with volume mounting

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **Git**

That's it! Docker Compose will handle everything else.

## 📁 Project Structure

```
daily-workflow-management/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/workflow/management/
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── exception/       # Custom exceptions
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   ├── security/        # Security configs & JWT
│   │   │   │   ├── service/         # Business logic
│   │   │   │   └── WorkflowManagementApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API services
│   │   ├── types/                   # TypeScript types
│   │   ├── utils/                   # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Quick Start (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd daily-workflow-management
   ```

2. **Start backend services with Docker**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MySQL database on port 3306
   - Spring Boot backend on port 8080

3. **Start frontend development server**
   ```bash
   cd frontend
   npm install  # Only needed first time
   npm run dev
   ```

   The frontend will start on port 3000 with hot-reload enabled.

4. **Verify services are running**
   ```bash
   docker-compose ps  # Should show mysql and backend running
   ```

5. **Access the application**
   - **Frontend UI**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **MySQL Database**: localhost:3306

5. **Login with default credentials**
   ```
   Admin User:
   Username: admin
   Password: admin123

   Manager User:
   Username: manager
   Password: manager123

   Employee User:
   Username: employee
   Password: employee123
   ```

6. **View logs**
   ```bash
   # All services
   docker-compose logs -f

   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mysql
   ```

7. **Stop services**
   ```bash
   docker-compose down
   ```

### Development with Hot Reload

The frontend container is configured with volume mounting, enabling hot-reload during development:

```bash
# Start services
docker-compose up -d

# Make changes to frontend code in ./frontend/src/
# Changes will automatically reload in the browser
```

### Rebuilding After Code Changes

If you make changes to the backend code or dependencies:

```bash
# Rebuild and restart specific service
docker-compose up -d --build backend

# Rebuild all services
docker-compose up -d --build
```

## ⚙️ Configuration

### Environment Variables

#### Backend (docker-compose.yml)
```yaml
SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/workflow_db
SPRING_DATASOURCE_USERNAME: workflow_user
SPRING_DATASOURCE_PASSWORD: workflow_pass
```

#### Frontend (docker-compose.yml)
```yaml
VITE_API_BASE_URL: http://localhost:8080
```

### Database Configuration

Database credentials are set in `docker-compose.yml`:

```yaml
MYSQL_DATABASE: workflow_db
MYSQL_USER: workflow_user
MYSQL_PASSWORD: workflow_pass
MYSQL_ROOT_PASSWORD: root_password
```

## 🗄️ Database Schema

The following tables are created automatically by JPA:

- **users**: User accounts and credentials
- **user_roles**: User-to-role mappings (many-to-many)
- **tasks**: Task information with status, priority, assignments
- **notifications**: User notifications for task updates

### User Roles

- **ADMIN**: Full system access, can manage all users and tasks
- **MANAGER**: Can create, assign, and manage tasks for all users
- **EMPLOYEE**: Can view and update assigned tasks

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "email": "admin@workflow.com",
    "roles": ["ADMIN"]
  }
}
```

#### Validate Token
```http
GET /api/auth/validate
Authorization: Bearer <token>
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### Get Task by ID
```http
GET /api/tasks/{id}
Authorization: Bearer <token>
```

#### Search Tasks
```http
GET /api/tasks/search?query=urgent
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs",
  "priority": "HIGH",
  "status": "TODO",
  "dueDate": "2025-02-15",
  "assignedToId": 2
}
```

#### Update Task
```http
PUT /api/tasks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "status": "IN_PROGRESS",
  "dueDate": "2025-02-20"
}
```

#### Update Task Status
```http
PATCH /api/tasks/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "DONE"
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
Authorization: Bearer <token>
```

### User Endpoints

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

### Notification Endpoints

#### Get User Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Task Statistics
```http
GET /api/analytics/tasks/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalTasks": 45,
    "todoCount": 12,
    "inProgressCount": 18,
    "doneCount": 13,
    "cancelledCount": 2
  }
}
```

## 🎯 Features Guide

### Kanban Board
- Drag and drop tasks between columns (TODO, IN_PROGRESS, DONE, CANCELLED)
- Filter by priority, user, or "My Tasks Only"
- Click any task to quickly update its status
- Real-time updates across all users

### Task Management
- Create tasks with title, description, priority, due date, and assignment
- Edit existing tasks
- Quick status updates via modal
- Delete tasks with confirmation
- Filter and sort by multiple criteria
- Auto-refresh every 30 seconds

### Search
- Real-time search across all tasks
- Searches in title and description
- Displays status and priority badges
- Click result to navigate to task

### Notifications
- Automatic notifications for task assignments
- Badge showing unread count
- Mark individual or all as read
- Dropdown with recent notifications

### Analytics
- Task statistics with visual charts
- Productivity metrics
- Task distribution by status
- Priority breakdown

## 🏗️ Development Phases

### Phase 1: Project Setup ✅
- [x] Create project structure
- [x] Initialize Spring Boot with Maven
- [x] Configure MySQL database
- [x] Set up Docker environment

### Phase 2: Database & Backend Core ✅
- [x] Design and implement database schema
- [x] Create JPA entities and repositories
- [x] Implement JWT authentication
- [x] Configure Spring Security
- [x] Create base REST API structure

### Phase 3: API Development ✅
- [x] Implement authentication APIs
- [x] Implement task management APIs
- [x] Implement user management APIs
- [x] Implement notification APIs
- [x] Implement analytics APIs

### Phase 4: Frontend Foundation ✅
- [x] Set up React with TypeScript and Vite
- [x] Create project structure
- [x] Implement routing
- [x] Create reusable UI components
- [x] Set up Context API for state management

### Phase 5: Core Frontend Features ✅
- [x] Implement authentication flow
- [x] Create task management pages
- [x] Build Kanban board
- [x] Integrate with backend APIs

### Phase 6: Advanced Features ✅
- [x] Add notifications system
- [x] Implement analytics dashboard
- [x] Add search functionality
- [x] Create user profile management
- [x] Implement role-based UI rendering

### Phase 7: Local Development ✅
- [x] Create Docker Compose setup for all services
- [x] Add frontend to Docker Compose
- [x] Configure hot-reload for development
- [x] Write comprehensive documentation
- [x] Test end-to-end workflows

## 🔧 Troubleshooting

### Ports Already in Use

If ports 3000, 8080, or 3306 are already in use:

```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8080
lsof -i :3306

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Database Connection Issues

1. Verify MySQL is running and healthy:
   ```bash
   docker-compose ps
   docker-compose logs mysql
   ```

2. Check backend logs for connection errors:
   ```bash
   docker-compose logs backend
   ```

3. Restart services:
   ```bash
   docker-compose restart mysql backend
   ```

### Frontend Not Loading

1. Check frontend logs:
   ```bash
   docker-compose logs frontend
   ```

2. Verify frontend container is running:
   ```bash
   docker ps | grep workflow-frontend
   ```

3. Rebuild frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### API Requests Failing

1. Verify backend is accessible:
   ```bash
   curl http://localhost:8080/api/auth/validate
   ```

2. Check CORS configuration in backend (should allow http://localhost:3000)

3. Check browser console for detailed error messages

### Hot Reload Not Working

1. Verify volume mounts in docker-compose.yml:
   ```yaml
   volumes:
     - ./frontend:/app
     - /app/node_modules
   ```

2. Restart frontend container:
   ```bash
   docker-compose restart frontend
   ```

### Complete Reset

If you encounter persistent issues:

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test

# With coverage
mvn test jacoco:report
```

### Manual Testing
1. Start all services: `docker-compose up -d`
2. Open browser to http://localhost:3000
3. Login with default credentials
4. Test each feature:
   - Create/edit/delete tasks
   - Drag tasks on Kanban board
   - Search for tasks
   - Check notifications
   - View analytics

## ⚡ Performance Tips

### For Development
- Use hot-reload: Changes to frontend code automatically refresh
- Backend changes require rebuild: `docker-compose up -d --build backend`
- Keep containers running to avoid startup time

### For Production
- Build optimized frontend: `npm run build`
- Use production Docker images with multi-stage builds
- Configure environment-specific settings
- Enable HTTPS with reverse proxy (nginx/caddy)

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For issues, questions, or suggestions:

- **Issues**: [Open an issue](https://github.com/yourusername/daily-workflow-management/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/daily-workflow-management/discussions)
- **Email**: your.email@example.com

---

<div align="center">

### ⭐ Star us on GitHub — it motivates us a lot!

**Current Status**: Phase 7 Complete ✅ | Production Ready 🚀

Made with ❤️ by developers, for developers

[⬆ Back to Top](#daily-workflow-management-system)

</div>
