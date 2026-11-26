<div align="center">

  <h1> 🔧 ToolShare</h1>

<p>
A scalable <b>microservices-based community tool sharing platform</b> built with
<b>Spring Boot</b>, <b>Spring Cloud</b>, <b>React</b>,
<b>PostgreSQL</b>, <b>RabbitMQ</b>, and <b>Docker</b>.
</p>

<p>
Empowering communities to share tools efficiently through
location-aware discovery, secure bookings,
real-time updates and availability,
and event-driven microservices.
</p>

</div>

---

---

<p align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.12-brightgreen?style=for-the-badge&logo=springboot)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-Microservices-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Event_Driven-orange?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-Caching-red?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</p>

---

# 🌐 Live Demo

> **Coming Soon**

Once deployed, update this section with your production URLs.

Frontend

```
https://your-frontend-url.com
```

Backend API Gateway

```
https://your-api-url.com
```

---

# 📖 Overview

ToolShare is a **community-driven tool sharing platform** that enables individuals to lend and borrow tools securely within their local communities.

Instead of purchasing expensive tools that are rarely used, users can list their equipment, discover nearby tools, book them for specific dates, and manage the complete borrowing lifecycle through a modern web application.

The project is built using a **distributed microservices architecture**, where each business domain operates independently while collaborating through REST APIs and asynchronous messaging.

Unlike traditional monolithic applications, ToolShare demonstrates enterprise-grade backend engineering practices including service discovery, API gateway routing, event-driven communication, distributed caching, JWT authentication, and containerized deployment.

---

# ✨ Key Features

## 👤 User Management

- Secure user registration and authentication
- JWT-based authorization
- Refresh token mechanism
- Email verification using OTP
- Profile management
- Avatar upload
- Password management

---

## 🔨 Tool Marketplace

- Publish tool listings
- Upload multiple tool images
- Organize tools into categories
- Set pricing and deposits
- Manage availability
- View owner information
- Browse all available tools

---

## 📍 Location-Based Search

Find nearby tools using geospatial queries powered by **PostGIS**.

Features include:

- Radius search
- Distance calculation
- Nearby recommendations
- Map integration
- OpenStreetMap geocoding

---

## 📅 Booking Management

Complete rental lifecycle support.

- Create bookings
- Availability validation
- Date conflict detection
- Booking approval
- Return workflow
- Booking history
- Suggested available dates

---

## 📨 Event-Driven Notifications

RabbitMQ enables asynchronous communication between services.

Automatic notifications include:

- Welcome emails
- Booking requests
- Booking approvals
- Booking returns
- Password reset emails
- Email verification

---

## ⚡ Performance Optimization

Designed for scalability and responsiveness.

- Redis caching
- Rate limiting
- Circuit breaker
- Database indexing
- Independent scaling
- Stateless authentication

---

## 🔒 Enterprise Security

- Spring Security
- JWT Authentication
- BCrypt password hashing
- API Gateway authorization
- Protected REST APIs
- Role-based access control
- Secure service communication

---

# 🌟 Highlights

- 🏗 Microservices Architecture
- 🔍 Location-based Search
- 📦 Dockerized Deployment
- 🔄 Event-driven Communication
- 🚀 Spring Cloud Ecosystem
- 📨 RabbitMQ Messaging
- ⚡ Redis Caching
- 🌍 PostGIS Spatial Queries
- 🔐 JWT Authentication
- 📱 Responsive React Frontend
- ☁ Cloud Ready
- 📈 Horizontally Scalable

---

# 🏗 System Architecture

```text
                         React Frontend
                                │
                                │
                        HTTP / HTTPS
                                │
                                ▼
                     Spring Cloud Gateway
             Authentication │ Routing │ Security
                                │
      ┌─────────────┬──────────────┬──────────────┬
      ▼             ▼              ▼              ▼
 Auth Service   User Service   Tool Service   Booking Service
      │             │              │              │
      └─────────────┴──────────────┴──────────────┘
                        │
                  Eureka Server
                        │
              Service Discovery
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
   RabbitMQ                         Redis
 Event Messaging                   Caching
        │
        ▼
 Notification Service
```

---

## 🏛 Architecture Principles

ToolShare follows modern enterprise software design principles.

### Microservices

Each service owns a single business capability and maintains its own database.

### Database per Service

Every microservice manages its own persistence layer to ensure loose coupling.

### Event-Driven Design

RabbitMQ is used for asynchronous workflows and eventual consistency.

### API Gateway Pattern

All external traffic passes through a centralized gateway responsible for authentication, routing, logging, and rate limiting.

### Service Discovery

Netflix Eureka enables dynamic registration and discovery of all services.

### Distributed Caching

Redis minimizes repeated database queries and improves response time.

### Containerization

Every service is independently containerized using Docker, enabling consistent deployment across environments.

---

# 🛠 Technology Stack

## Backend

| Technology | Purpose |
|------------|---------|
| Java 17 | Programming Language |
| Spring Boot | Microservices Framework |
| Spring Security | Authentication & Authorization |
| Spring Cloud Gateway | API Gateway |
| Netflix Eureka | Service Discovery |
| Spring Data JPA | ORM |
| Hibernate | Persistence |
| RabbitMQ | Event Messaging |
| Redis | Distributed Cache |
| PostgreSQL | Relational Database |
| PostGIS | Spatial Queries |
| Maven | Dependency Management |

---

## Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | User Interface |
| React Router | Client-side Routing |
| Axios | REST Client |
| Bootstrap | Responsive UI |
| React Bootstrap | Components |
| Leaflet | Interactive Maps |
| React Leaflet | Map Integration |
| React Toastify | Notifications |

---

## DevOps & Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local Orchestration |
| Git | Version Control |
| GitHub | Repository Hosting |
| Spring Boot Actuator | Monitoring |
| Micrometer | Metrics Collection |

---

# 📊 System Components

| Component | Responsibility |
|------------|----------------|
| API Gateway | Authentication, Routing, Rate Limiting |
| Eureka Server | Service Discovery |
| Auth Service | User Authentication |
| User Service | Profile Management |
| Tool Service | Tool Listings |
| Booking Service | Booking Lifecycle |
| Notification Service | Email Notifications |
| RabbitMQ | Event Broker |
| Redis | Caching |
| PostgreSQL | Persistent Storage |
| React Frontend | User Experience |

---

# 🎯 Why ToolShare?

Traditional tool ownership often results in expensive equipment remaining unused for long periods.

ToolShare promotes the **sharing economy** by allowing communities to maximize resource utilization while reducing unnecessary purchases.

The platform combines modern cloud-native technologies with a user-friendly interface, making it an excellent demonstration of enterprise backend development, distributed systems, and scalable software architecture.

---
# 🧩 Microservices Overview

ToolShare follows a **domain-driven microservices architecture**, where every service is independently deployable, maintains its own database, and communicates through REST APIs and asynchronous events.

---

## 🔐 Authentication Service

**Port:** `8081`

Responsible for identity management and application security.

### Responsibilities

- User Registration
- User Login
- JWT Generation
- Refresh Token Management
- Email Verification
- Password Encryption
- Token Validation

### Core Technologies

- Spring Security
- JWT
- BCrypt
- PostgreSQL
- Feign Client

---

## 👤 User Service

**Port:** `8082`

Manages user profiles and location information.

### Responsibilities

- User Profiles
- Profile Images
- Address Management
- Location Storage
- Password Updates
- OTP Verification

### Features

- Avatar Upload
- User Ratings
- Profile Management
- Geolocation Storage

---

## 🔨 Tool Service

**Port:** `8083`

Handles the complete marketplace for tool listings.

### Responsibilities

- Tool Listings
- Categories
- Tool Images
- Availability
- Ownership
- Nearby Search

### Features

- Multiple Images
- Category Filtering
- Spatial Queries
- Redis Cache
- Ownership Validation

---

## 📅 Booking Service

**Port:** `8084`

Manages the complete rental lifecycle.

### Responsibilities

- Booking Creation
- Availability Checking
- Conflict Detection
- Booking Status
- Tool Return
- Suggested Dates

### Booking Lifecycle

```text
PENDING
    │
    ▼
CONFIRMED
    │
    ▼
ACTIVE
    │
    ▼
RETURNED

or

PENDING
    │
    ▼
CANCELLED
```

---

## 📨 Notification Service

**Port:** `8085`

Processes asynchronous events from RabbitMQ.

### Responsibilities

- Welcome Emails
- Booking Notifications
- Password Reset Emails
- Email Verification
- Booking Approval Messages

---

## 🌐 API Gateway

**Port:** `8080`

Acts as the single entry point for every client request.

### Responsibilities

- Authentication
- Authorization
- Routing
- Logging
- Rate Limiting
- Circuit Breaker
- CORS

---

## 📡 Eureka Server

**Port:** `8761`

Provides service registration and discovery.

### Responsibilities

- Dynamic Service Discovery
- Health Monitoring
- Load Balancing Support
- Service Registry

---

# 🔄 Service Communication

ToolShare uses two communication styles.

## Synchronous Communication

Used when an immediate response is required.

```text
React
   │
   ▼
API Gateway
   │
   ▼
Booking Service
   │
   ▼
Tool Service
```

Used for:

- Authentication
- Availability Checks
- User Profile Retrieval
- Booking Validation

---

## Asynchronous Communication

RabbitMQ enables event-driven workflows.

```text
Booking Service
       │
       ▼
RabbitMQ Exchange
       │
       ▼
Notification Service
       │
       ▼
Email Sent
```

This improves:

- Scalability
- Fault Tolerance
- Loose Coupling
- Performance

---

# 📂 Project Structure

```text
toolshare/

├── auth-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── user-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── tool-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── booking-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── notification-service/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── gateway/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── eureka-server/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# 🚀 Getting Started

## Prerequisites

Before running ToolShare, install:

| Software | Version |
|------------|----------|
| Java | 17+ |
| Maven | 3.9+ |
| Docker | Latest |
| Docker Compose | Latest |
| Node.js | 18+ |
| Git | Latest |

---

## Clone Repository

```bash
git clone https://github.com/<your-username>/toolshare.git

cd toolshare
```

---

# 🐳 Running with Docker (Recommended)

Build all services.

```bash
docker compose build
```

Start every service.

```bash
docker compose up -d
```

Verify containers.

```bash
docker ps
```

Stop services.

```bash
docker compose down
```

---

# 💻 Running Locally

## Step 1

Start Eureka Server

```bash
cd eureka-server

mvn spring-boot:run
```

---

## Step 2

Start each microservice.

```bash
auth-service

user-service

tool-service

booking-service

notification-service

gateway
```

Each service can be started using

```bash
mvn spring-boot:run
```

---

## Step 3

Run React Frontend

```bash
cd frontend

npm install

npm start
```

Frontend

```
http://localhost:3000
```

Backend Gateway

```
http://localhost:8080
```

---

# ⚙️ Environment Variables

Example configuration:

```env
JWT_SECRET=your-secret-key

DB_USERNAME=postgres

DB_PASSWORD=password

REDIS_HOST=localhost

RABBITMQ_HOST=localhost

MAIL_USERNAME=your-email@gmail.com

MAIL_PASSWORD=your-app-password
```

---

# 🔌 API Overview

## Public APIs

| Method | Endpoint | Description |
|----------|---------------------------|----------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login |
| GET | `/api/tools` | Browse Tools |
| GET | `/api/tools/{id}` | Tool Details |
| GET | `/api/categories` | Categories |
| GET | `/api/tools/nearby` | Nearby Search |

---

## Protected APIs

JWT Required.

| Method | Endpoint | Description |
|----------|--------------------------|----------------|
| GET | `/api/users/profile` | Profile |
| PUT | `/api/users/profile` | Update Profile |
| POST | `/api/tools` | Create Tool |
| PUT | `/api/tools/{id}` | Update Tool |
| DELETE | `/api/tools/{id}` | Delete Tool |
| POST | `/api/bookings` | Create Booking |
| GET | `/api/bookings/user/{id}` | User Bookings |
| POST | `/api/bookings/{id}/return` | Return Tool |

---

# 🔐 Authentication Flow

```text
User Login
      │
      ▼
Auth Service
      │
      ▼
JWT Generated
      │
      ▼
Client Stores Token
      │
      ▼
Every Request
      │
      ▼
API Gateway
      │
      ▼
JWT Validation
      │
      ▼
Requested Service
```

The API Gateway validates every protected request before forwarding it to downstream services.

---

# 🛡 Security Features

- JWT Authentication
- Refresh Tokens
- BCrypt Password Encryption
- Role-Based Access Control
- Protected APIs
- Secure Gateway Routing
- CORS Configuration
- Rate Limiting
- Circuit Breaker
- Service Isolation

---
# 📨 Event-Driven Architecture

ToolShare leverages **RabbitMQ** to decouple services and process asynchronous tasks efficiently. This design improves scalability, resilience, and overall system performance by allowing services to communicate through events rather than direct synchronous calls.

## Event Flow

```text
                    Booking Created
                           │
                           ▼
                  Booking Service
                           │
                Publish Booking Event
                           │
                           ▼
                      RabbitMQ Exchange
                  ┌────────┴────────┐
                  ▼                 ▼
        Notification Service   Analytics Service*
                  │
                  ▼
             Email Sent

*Future Enhancement
```

---

## Published Events

| Event | Producer | Consumer |
|--------|----------|----------|
| User Registered | Auth Service | Notification Service |
| Email Verification | Auth Service | Notification Service |
| Password Reset | Auth Service | Notification Service |
| Booking Created | Booking Service | Notification Service |
| Booking Approved | Booking Service | Notification Service |
| Booking Cancelled | Booking Service | Notification Service |
| Booking Returned | Booking Service | Notification Service |

---

# 🗄 Database Design

Each microservice follows the **Database per Service** pattern to ensure loose coupling and independent scalability.

## Database Ownership

| Service | Database |
|---------|----------|
| Auth Service | PostgreSQL |
| User Service | PostgreSQL |
| Tool Service | PostgreSQL + PostGIS |
| Booking Service | PostgreSQL |
| Notification Service | PostgreSQL |

---

## Core Entities

### User

```text
User
├── id
├── firstName
├── lastName
├── email
├── password
├── phone
├── avatar
├── latitude
├── longitude
├── createdAt
└── updatedAt
```

---

### Tool

```text
Tool
├── id
├── ownerId
├── title
├── description
├── category
├── pricePerDay
├── deposit
├── availability
├── latitude
├── longitude
├── createdAt
└── updatedAt
```

---

### Booking

```text
Booking
├── id
├── toolId
├── borrowerId
├── ownerId
├── startDate
├── endDate
├── status
├── totalCost
├── createdAt
└── updatedAt
```

---

# 📍 Location Intelligence

ToolShare uses **PostGIS** to support geospatial operations and location-aware tool discovery.

### Supported Features

- Radius-based search
- Nearby recommendations
- Distance calculations
- Geospatial indexing
- Location filtering
- Interactive maps

Example:

```text
Find all available drills within 5 km of the user's location.
```

---

# ⚡ Redis Caching

Redis improves response times and reduces database load by caching frequently accessed data.

## Cached Data

- Tool Categories
- Popular Listings
- Nearby Search Results
- User Sessions
- JWT Blacklist (optional)
- Frequently Accessed Profiles

### Benefits

- Lower latency
- Reduced database traffic
- Faster search results
- Better scalability

---

# 📊 Monitoring & Observability

ToolShare includes built-in monitoring capabilities for production deployments.

## Spring Boot Actuator

Provides operational endpoints for:

- Health Checks
- Metrics
- Environment Information
- Thread Dumps
- Application Info

Example:

```text
GET /actuator/health
GET /actuator/metrics
```

---

## Logging

Each microservice maintains independent application logs.

Recommended logging stack:

- Logback
- ELK Stack (Future)
- Grafana Loki (Future)

---

# 🚀 Deployment

ToolShare is fully containerized and can be deployed to any cloud provider supporting Docker.

## Docker Compose

Run the complete platform locally:

```bash
docker compose up --build
```

Open the frontend at [http://localhost:3000](http://localhost:3000). By default, it calls the API gateway at `http://localhost:8080`. For another deployment URL, set `REACT_APP_API_URL` and `REACT_APP_API_GATEWAY_URL` before building; these values are embedded in the frontend bundle.

Services started:

- API Gateway
- Eureka Server
- Auth Service
- User Service
- Tool Service
- Booking Service
- Notification Service
- PostgreSQL
- Redis
- RabbitMQ
- React Frontend

---

## Cloud Deployment Options

| Platform | Status |
|----------|--------|
| Docker | ✅ Supported |
| Render | ✅ Supported |
| Railway | ✅ Supported |
| Fly.io | ✅ Supported |
| AWS ECS | ✅ Supported |
| Azure Container Apps | ✅ Supported |
| Google Cloud Run | ✅ Supported |
| Kubernetes | Planned |

---

# 📈 Scalability

ToolShare is designed with scalability in mind.

Current architecture supports:

- Independent service deployment
- Horizontal scaling
- Stateless authentication
- Distributed caching
- Event-driven communication
- Database isolation

Future improvements include:

- Load Balancing
- API Rate Limiting
- Distributed Tracing
- Service Mesh
- Kubernetes Orchestration

---

# 🧪 Testing

Run all backend tests:

```bash
mvn test
```

Run frontend tests:

```bash
npm test
```

Recommended testing strategy:

- Unit Tests
- Integration Tests
- API Tests
- End-to-End Tests
- Load Testing

---

# 🛣 Roadmap

Future enhancements planned for ToolShare include:

- [ ] Real-time chat between borrowers and owners
- [ ] Payment gateway integration
- [ ] QR Code-based tool pickup
- [ ] Push notifications
- [ ] AI-powered tool recommendations
- [ ] Advanced search filters
- [ ] Wishlist functionality
- [ ] Ratings and reviews
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline with GitHub Actions
- [ ] OpenAPI / Swagger documentation
- [ ] Prometheus & Grafana monitoring

---

# 🤝 Contributing

Contributions are welcome!

To contribute:

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature/my-feature
```

3. Commit your changes.

```bash
git commit -m "Add awesome feature"
```

4. Push your branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

Please ensure that your code follows the project's coding standards and includes appropriate documentation.

---

# 📚 Documentation

Additional project documentation can be placed inside the `docs/` directory.

```text
docs/
├── architecture.md
├── api-reference.md
├── deployment.md
├── event-driven.md
├── security.md
├── database.md
├── docker.md
└── contributing.md
```

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this software in accordance with the terms of the license.

See the `LICENSE` file for more details.

---

# 👨‍💻 Author

**Praveen Verma**

Computer Science Engineering Student

### Interests

- Backend Development
- Microservices Architecture
- Distributed Systems
- Cloud Computing
- Java & Spring Ecosystem
- Data Structures & Algorithms
- Artificial Intelligence


---

# 🙏 Acknowledgements

Special thanks to the amazing open-source technologies that made ToolShare possible:

- Java
- Spring Boot
- Spring Cloud
- Spring Security
- Netflix Eureka
- Spring Cloud Gateway
- PostgreSQL
- PostGIS
- RabbitMQ
- Redis
- React
- Docker
- Maven
- GitHub

---

# ⭐ Support

If you found this project helpful or interesting:

- ⭐ Star the repository
- 🍴 Fork the project
- 🐞 Report issues
- 💡 Suggest improvements
- 🤝 Contribute to the project

Your support helps improve the project and encourages future development.

---

<p align="center">

**Built with ❤️ using Spring Boot, Spring Cloud, React, RabbitMQ, Redis, PostgreSQL, and Docker**

*Connecting communities through smarter, scalable, and secure tool sharing.*

</p>
