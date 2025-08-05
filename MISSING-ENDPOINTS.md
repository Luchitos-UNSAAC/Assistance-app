**Endpoints Futuros**(Para implementación con backend)
```ts
// Autenticación
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Voluntarios
GET    /api/volunteers
POST   /api/volunteers
GET    /api/volunteers/:id
PUT    /api/volunteers/:id
DELETE /api/volunteers/:id

// Asistencias
GET    /api/attendances
POST   /api/attendances
GET    /api/attendances/:id
PUT    /api/attendances/:id
DELETE /api/attendances/:id
GET    /api/attendances/volunteer/:volunteerId
GET    /api/attendances/date/:date

// Estadísticas
GET /api/stats/dashboard
GET /api/stats/volunteer/:id
GET /api/stats/attendance-rate
```