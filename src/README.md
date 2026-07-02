# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Teacher-only activity registration and unregistering
- Session-based teacher login backed by a local JSON credentials file

## Getting Started

1. Install the dependencies:

   ```
   pip install -r ../requirements.txt
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| GET    | `/auth/status`                                                    | Get the current teacher authentication state                        |
| POST   | `/auth/login`                                                     | Log in as a teacher                                                 |
| POST   | `/auth/logout`                                                    | Log out the current teacher                                         |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister a student from an activity                            |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

## Teacher Credentials

Teacher credentials are stored in `teachers.json` and checked by the backend. This keeps setup simple while the project still runs without a database.

All activity data is stored in memory, which means activity registrations will reset when the server restarts.
