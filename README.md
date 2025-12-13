# Origin Take-Home Interview - Therapist Session Dashboard

A full-stack web application for managing therapy sessions, built with Next.js 15+, React 19, TypeScript, and PostgreSQL.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   DATABASE_URL="your-neon-postgres-connection-string"
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js App Router pages and components
  - `api/` - RESTful API routes
    - `sessions/` - Session CRUD operations
      - `route.ts` - GET (list) and POST (create) endpoints
      - `[id]/route.ts` - GET, PATCH, and DELETE endpoints for individual sessions
    - `therapists/route.ts` - GET endpoint for searching therapists
    - `patients/route.ts` - GET endpoint for searching patients
  - `components/` - React components
    - `SessionsList.tsx` - Main session list container with filters and pagination
    - `SessionTable.tsx` - Table component for displaying sessions
    - `SessionFilters.tsx` - Filter controls for status, therapist, and date range
    - `CreateSessionModal.tsx` - Modal for creating new sessions
    - `SearchableDropdown.tsx` - Reusable searchable dropdown component
    - `ToastContainer.tsx` - Toast notification container
  - `contexts/ToastContext.tsx` - Toast notification context provider
  - `page.tsx` - Main dashboard page
  - `layout.tsx` - Root layout component
- `lib/` - Utility functions and shared code
  - `db.ts` - PostgreSQL connection pool
  - `validations.ts` - Zod schemas for request validation
  - `types.ts` - TypeScript type definitions
  - `api.ts` - Client-side API functions for making requests

## API Endpoints

### Sessions
- `GET /api/sessions` - List sessions with filtering, sorting, and pagination
  - Query params:
    - `status` (optional) - Filter by status: `Scheduled`, `Completed`, `Canceled`, or `No Show`
    - `therapist_id` (optional) - Filter by therapist ID
    - `therapist_name` (optional) - Filter by therapist name (partial match, case-insensitive)
    - `date_from` (optional) - Filter sessions from this date (inclusive)
    - `date_to` (optional) - Filter sessions up to this date (inclusive)
    - `sort_order` (optional) - Sort order: `ASC` or `DESC` (default: `ASC`)
    - `page` (optional) - Page number for pagination (default: `1`)
    - `limit` (optional) - Number of results per page (default: `10`)
  - Returns: Paginated response with `data` array and `pagination` metadata
- `POST /api/sessions` - Create a new session
  - Body: `{ therapist_id, patient_id, date, status? }`
  - Returns: Created session with therapist and patient names
- `GET /api/sessions/[id]` - Get a single session by ID
  - Returns: Session with therapist and patient names
- `PATCH /api/sessions/[id]` - Update a session
  - Body: Partial update object with any of: `{ therapist_id?, patient_id?, date?, status? }`
  - Returns: Updated session with therapist and patient names
- `DELETE /api/sessions/[id]` - Delete a session
  - Returns: Success message

### Therapists
- `GET /api/therapists` - Search therapists by name
  - Query params:
    - `search` (optional) - Search term for therapist name (partial match, case-insensitive)
  - Returns: Array of therapists (id, name, specialty), limited to 20 results

### Patients
- `GET /api/patients` - Search patients by name
  - Query params:
    - `search` (optional) - Search term for patient name (partial match, case-insensitive)
  - Returns: Array of patients (id, name, dob), limited to 20 results

## Design Choices
### Assumptions
- Therapists and patients can have the same name (currently allowed by the db schema)
- Only one therapist can be filtered for at one time
- Only one status can be filtered for at one time
- Only one time range can be filtered for at one time

### Approach
I'm a primarily visual person, so I drew out a mental map of the backend before creating a paper sketch of the frontend. I then asked Cursor to create some boilerplate code, and then I played with the prototype and made iterative changes and enhancements until the project was complete.

My API design is in the API endpoints section. I decided to allow the user to search by name instead of ID for both the therapist and patient, so I had to add endpoints to search by name. One edge case I found was that people in the test database can have the same name. For therapists, we only know their specialty, so I decided to show that. For patients, I decided to show their DOB, which seemed to be more unique.

Component organization is shown in the Project Structure section. I tried to separate UI state from business logic as much as possible, so state is only shared when necessary. The sessions state lives in SessionTable, but it could just as easily be put into a more robust state manager like Redux.

For the filtering, I considered using a calendar system to select date ranges, similar to Google Maps' interface when the user creates an event. I decided to keep the filter simple for now to avoid unnecessary complexity.

### Real world approach
I think the sessions list needs to be modified for specific types of users. It doesn't really make sense to show all sessions for either therapists or patients. Therapists should only see their own sessions or sessions that are shared with them. Patients (or rather, the parents or guardians of those patients) should only be able to see the sessions of their patients. I'd separate the auth experience between Therapists and Patients; therapists should have a separate login experience from patients and a separate dashboard.

I think this view could be useful for an Origin Therapy administrator to see all active sessions at a glance, but it's not very user-friendly. If you scale to 1000s of sessions over many years, this could easily become unwieldy to search through.