
# EventHub

EventHub is a full-stack event management application developed as an academic project for the Systems Development course.

The application allows authenticated users to manage events, register participants, control event capacity, and manage registrations through a web dashboard.

## Technologies

### Backend

- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT
- SQLite (local development)

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Version Control

- Git
- GitHub

## Features

### Authentication

- User authentication using JWT.
- Access and refresh tokens.
- Automatic access token renewal.
- Protected dashboard routes.
- Logout functionality.

### Event Management

- Create events.
- List available events.
- Edit events.
- Delete events.
- View event details.
- Display event capacity and remaining seats.
- Restrict event management to authorized organizers.

### Participant Management

- Register new participants.
- Register participants without assigning an event.
- View registered participants.
- Update participant information.
- Reuse existing participants in event registrations.

### Registration Management

- Register participants for events.
- List registrations.
- View participant information.
- Cancel registrations.
- Reactivate cancelled registrations.
- Permanently delete registrations.
- Prevent duplicate active registrations.
- Validate event availability.

### Capacity Management

Event capacity is automatically maintained by the backend.

- Active registrations occupy available seats.
- Cancelled registrations release seats.
- Reactivated registrations occupy seats again.
- Deleting active registrations releases seats.
- Registrations cannot exceed event capacity.

Django signals are responsible for updating seat availability.

### Dashboard

- Event overview.
- Recent events.
- Platform statistics.
- Navigation between dashboard, events, and registrations.
- Light and dark themes.
- Persistent theme preference in the browser.

## Project Structure

```text
proj_integrador_ds1/
├── backend/
│   ├── events/
│   ├── participants/
│   ├── manage.py
│   └── ...
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── eventos/
│   │   │   └── inscricoes/
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   ├── events/
│   │   ├── registrations/
│   │   └── layout/
│   ├── lib/
│   │   └── api.ts
│   └── package.json
└── README.md
```

## Installation

### Requirements

Before running the project, install:

- Python
- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Cesar-Chaves-Terra/EventHub.git
cd EventHub
```

### 2. Backend Setup

Open the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```cmd
.venv\Scripts\activate
```

Install the Python dependencies listed in the backend requirements file, if available.

Apply database migrations:

```bash
python manage.py migrate
```

Create an administrator account if needed:

```bash
python manage.py createsuperuser
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file inside the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Start the Next.js development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

## API

The backend uses Django REST Framework to expose REST endpoints.

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/` | List events |
| POST | `/api/events/` | Create an event |
| GET | `/api/events/{id}/` | Retrieve event details |
| PATCH | `/api/events/{id}/` | Update an event |
| DELETE | `/api/events/{id}/` | Delete an event |

### Participants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/participants/` | List accessible participants |
| POST | `/api/participants/` | Create a participant |
| GET | `/api/participants/{id}/` | Retrieve participant details |
| PATCH | `/api/participants/{id}/` | Update participant information |

### Registrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/registrations/` | List registrations |
| POST | `/api/registrations/` | Create a registration |
| PATCH | `/api/registrations/{id}/` | Update registration status |
| DELETE | `/api/registrations/{id}/` | Delete a registration |
| POST | `/api/registrations/enroll/` | Create a participant and registration atomically |

### Authentication

The application uses JWT access and refresh tokens.

Protected API endpoints require an authorization header:

```http
Authorization: Bearer <access_token>
```

## Business Rules

### Events

- Event management requires authentication.
- Organizers can manage their own events.
- Event capacity must be respected.
- Capacity cannot be reduced below the number of active registrations.

### Participants

- Participants have a unique email address.
- Participants may exist without event registrations.
- Existing participants can be registered for additional events.
- Participant information can be updated through authorized API requests.

### Registrations

- A registration links one participant to one event.
- Each participant can have only one registration record per event.
- Registrations can be active or cancelled.
- Cancelled registrations can be reactivated if seats are available.
- Deleting an active registration restores its occupied seat.
- Registration operations are validated by the backend.

## Testing

### Backend

Run Django system checks:

```bash
python manage.py check
```

Run automated tests:

```bash
python manage.py test
```

### Frontend

Run ESLint:

```bash
npm run lint
```

Check TypeScript:

```bash
npx tsc --noEmit
```

Build the application:

```bash
npm run build
```

## User Interface

EventHub uses a dark visual identity inspired by nightlife and entertainment environments.

The interface includes:

- Dark purple backgrounds.
- Pink and purple accents.
- Light-colored typography.
- Event cards and capacity indicators.
- A light theme with soft, low-glare backgrounds.

Users can switch between light and dark themes from the dashboard.

## Development

This project was developed for educational purposes, focusing on:

- REST API development.
- Relational database modeling.
- CRUD operations.
- JWT authentication.
- Django serializers and viewsets.
- Django signals.
- React component reuse.
- Frontend and backend integration.
- Version control with Git.

## License

This project was developed for academic and educational purposes.
