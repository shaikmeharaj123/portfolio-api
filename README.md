# Portfolio API

A complete, production-ready RESTful API for personal portfolio websites, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: Secure JWT-based auth with access and refresh tokens.
- **Role-Based Access Control**: Different permissions for Super Admin, Admin, and Editor.
- **Portfolio Management**: CRUD operations for:
  - Projects
  - Skills
  - Experience
  - Education
  - Blogs
  - Achievements
  - Certifications
  - Testimonials
  - Stats
- **File Uploads**: Integration with Cloudinary for single and multiple file uploads.
- **Security**: Helmet, CORS, and Rate Limiting implemented.
- **Error Handling**: Centralized error handling and standardized API responses.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Storage**: Cloudinary
- **Validation**: Joi

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Start the server: `npm run dev`

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | `http://localhost:5000/api/auth/register` | Register a new admin | No |
| POST | `http://localhost:5000/api/auth/login` | Login and get tokens | No |
| POST | `http://localhost:5000/api/auth/logout` | Logout and revoke refresh token | No |
| POST | `http://localhost:5000/api/auth/refresh-token` | Get a new access token | No |
| GET | `http://localhost:5000/api/auth/me` | Get current admin profile | Yes |

### Portfolio

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/portfolio` | Get all portfolio data in one request | No |

### Achievements

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/achievements` | List all achievements | No |
| POST | `http://localhost:5000/api/achievements` | Create a new achievement | Yes |
| GET | `http://localhost:5000/api/achievements/:id` | Get a single achievement by ID | No |
| PATCH | `http://localhost:5000/api/achievements/:id` | Update an achievement | Yes |
| DELETE | `http://localhost:5000/api/achievements/:id` | Delete an achievement | Yes |

### Blogs

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/blogs` | List all blogs | No |
| POST | `http://localhost:5000/api/blogs` | Create a new blog | Yes |
| GET | `http://localhost:5000/api/blogs/:id` | Get a single blog by ID | No |
| PATCH | `http://localhost:5000/api/blogs/:id` | Update a blog | Yes |
| DELETE | `http://localhost:5000/api/blogs/:id` | Delete a blog | Yes |

### Certifications

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/certifications` | List all certifications | No |
| POST | `http://localhost:5000/api/certifications` | Create a new certification | Yes |
| GET | `http://localhost:5000/api/certifications/:id` | Get a single certification by ID | No |
| PATCH | `http://localhost:5000/api/certifications/:id` | Update a certification | Yes |
| DELETE | `http://localhost:5000/api/certifications/:id` | Delete a certification | Yes |

### Education

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/education` | List all education entries | No |
| POST | `http://localhost:5000/api/education` | Create a new education entry | Yes |
| GET | `http://localhost:5000/api/education/:id` | Get a single education entry by ID | No |
| PATCH | `http://localhost:5000/api/education/:id` | Update an education entry | Yes |
| DELETE | `http://localhost:5000/api/education/:id` | Delete an education entry | Yes |

### Experience

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/experience` | List all experience entries | No |
| POST | `http://localhost:5000/api/experience` | Create a new experience entry | Yes |
| GET | `http://localhost:5000/api/experience/:id` | Get a single experience entry by ID | No |
| PATCH | `http://localhost:5000/api/experience/:id` | Update an experience entry | Yes |
| DELETE | `http://localhost:5000/api/experience/:id` | Delete an experience entry | Yes |

### Personal Info

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/personal-info` | List all personal info | No |
| POST | `http://localhost:5000/api/personal-info` | Create a new personal info entry | Yes |
| GET | `http://localhost:5000/api/personal-info/:id` | Get a single personal info entry by ID | No |
| PATCH | `http://localhost:5000/api/personal-info/:id` | Update a personal info entry | Yes |
| DELETE | `http://localhost:5000/api/personal-info/:id` | Delete a personal info entry | Yes |

### Projects

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/projects` | List all projects | No |
| POST | `http://localhost:5000/api/projects` | Create a new project | Yes |
| GET | `http://localhost:5000/api/projects/:id` | Get a single project by ID | No |
| PATCH | `http://localhost:5000/api/projects/:id` | Update a project | Yes |
| DELETE | `http://localhost:5000/api/projects/:id` | Delete a project | Yes |

### Skills

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/skills` | List all skills | No |
| POST | `http://localhost:5000/api/skills` | Create a new skill | Yes |
| GET | `http://localhost:5000/api/skills/:id` | Get a single skill by ID | No |
| PATCH | `http://localhost:5000/api/skills/:id` | Update a skill | Yes |
| DELETE | `http://localhost:5000/api/skills/:id` | Delete a skill | Yes |

### Social Links

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/social-links` | List all social links | No |
| POST | `http://localhost:5000/api/social-links` | Create a new social link | Yes |
| GET | `http://localhost:5000/api/social-links/:id` | Get a single social link by ID | No |
| PATCH | `http://localhost:5000/api/social-links/:id` | Update a social link | Yes |
| DELETE | `http://localhost:5000/api/social-links/:id` | Delete a social link | Yes |

### Stats

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/stats` | List all stats | No |
| POST | `http://localhost:5000/api/stats` | Create a new stat | Yes |
| GET | `http://localhost:5000/api/stats/:id` | Get a single stat by ID | No |
| PATCH | `http://localhost:5000/api/stats/:id` | Update a stat | Yes |
| DELETE | `http://localhost:5000/api/stats/:id` | Delete a stat | Yes |

### Testimonials

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| GET | `http://localhost:5000/api/testimonials` | List all testimonials | No |
| POST | `http://localhost:5000/api/testimonials` | Create a new testimonial | Yes |
| GET | `http://localhost:5000/api/testimonials/:id` | Get a single testimonial by ID | No |
| PATCH | `http://localhost:5000/api/testimonials/:id` | Update a testimonial | Yes |
| DELETE | `http://localhost:5000/api/testimonials/:id` | Delete a testimonial | Yes |

### Uploads

| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | `http://localhost:5000/api/upload/single` | Upload a single file | Yes |
| POST | `http://localhost:5000/api/upload/multiple` | Upload multiple files (max 10) | Yes |
