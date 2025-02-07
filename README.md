# Hello, this is a repository for the DPMPTSP Whistleblowing System (WBS) Backend

# WBS (Whistle Blowing System) API Specification

## Base URL
```
https://api.wbs-dpmptsp.padang.go.id/v1
```

## Authentication
All API endpoints except public endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication
#### Register
```http
POST /auth/register
```
Request Body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string"
}
```
Response: `201 Created`
```json
{
  "message": "Registration successful",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "pelapor"
  }
}
```

#### Login
```http
POST /auth/login
```
Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```
Response: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Reports
#### Create Report
```http
POST /reports
```
Request Body (multipart/form-data):
```json
{
  "title": "string",
  "violation": "string",
  "location": "string",
  "date": "date",
  "actors": "string",
  "detail": "text",
  "is_anonymous": "boolean",
  "evidence_files[]": "file"
}
```
Response: `201 Created`
```json
{
  "message": "Report created successfully",
  "data": {
    "id": "integer",
    "title": "string",
    "unique_code": "string (if anonymous)",
    "status": "menunggu-verifikasi"
  }
}
```

#### Get Reports List (Admin)
```http
GET /reports
```
Query Parameters:
- status: string (menunggu-verifikasi|diproses|ditolak|selesai)
- page: integer
- per_page: integer

Response: `200 OK`
```json
{
  "data": [{
    "id": "integer",
    "title": "string",
    "violation": "string",
    "location": "string",
    "date": "date",
    "status": "string",
    "created_at": "datetime",
    "is_anonymous": "boolean",
    "reporter": {
      "id": "integer",
      "name": "string"
    }
  }],
  "meta": {
    "current_page": "integer",
    "last_page": "integer",
    "per_page": "integer",
    "total": "integer"
  }
}
```

#### Get Report Detail
```http
GET /reports/{id}
```
Response: `200 OK`
```json
{
  "data": {
    "id": "integer",
    "title": "string",
    "violation": "string",
    "location": "string",
    "date": "date",
    "actors": "string",
    "detail": "text",
    "status": "string",
    "rejection_reason": "text|null",
    "admin_notes": "text|null",
    "verified_at": "datetime|null",
    "completed_at": "datetime|null",
    "created_at": "datetime",
    "is_anonymous": "boolean",
    "files": [{
      "id": "integer",
      "file_path": "string",
      "file_type": "string"
    }],
    "reporter": {
      "id": "integer",
      "name": "string"
    },
    "processor": {
      "id": "integer",
      "name": "string"
    }
  }
}
```

#### Get Anonymous Report
```http
GET /reports/anonymous/{unique_code}
```
Response: Same as Get Report Detail

#### Process Report
```http
POST /reports/{id}/process
```
Response: `200 OK`
```json
{
  "message": "Report is now being processed",
  "data": {
    "id": "integer",
    "status": "diproses"
  }
}
```

#### Reject Report
```http
POST /reports/{id}/reject
```
Request Body:
```json
{
  "rejection_reason": "text"
}
```
Response: `200 OK`
```json
{
  "message": "Report has been rejected",
  "data": {
    "id": "integer",
    "status": "ditolak"
  }
}
```

#### Complete Report
```http
POST /reports/{id}/complete
```
Request Body (multipart/form-data):
```json
{
  "admin_notes": "text",
  "handling_proof[]": "file"
}
```
Response: `200 OK`
```json
{
  "message": "Report has been completed",
  "data": {
    "id": "integer",
    "status": "selesai"
  }
}
```

### Chats
#### Get Report Chats
```http
GET /reports/{report_id}/chats
```
Response: `200 OK`
```json
{
  "data": [{
    "id": "integer",
    "message": "text",
    "created_at": "datetime",
    "user": {
      "id": "integer",
      "name": "string",
      "role": "string"
    }
  }]
}
```

#### Send Chat Message
```http
POST /reports/{report_id}/chats
```
Request Body:
```json
{
  "message": "text"
}
```
Response: `201 Created`
```json
{
  "data": {
    "id": "integer",
    "message": "text",
    "created_at": "datetime",
    "user": {
      "id": "integer",
      "name": "string",
      "role": "string"
    }
  }
}
```

### Admin Management (Super Admin Only)
#### Get Admins List
```http
GET /admins
```
Response: `200 OK`
```json
{
  "data": [{
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string",
    "created_at": "datetime"
  }]
}
```

#### Create Admin
```http
POST /admins
```
Request Body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin-verifikator|admin-prosesor"
}
```
Response: `201 Created`
```json
{
  "message": "Admin created successfully",
  "data": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Update Admin
```http
PUT /admins/{id}
```
Request Body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string|null",
  "role": "admin-verifikator|admin-prosesor"
}
```
Response: `200 OK`
```json
{
  "message": "Admin updated successfully",
  "data": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Delete Admin
```http
DELETE /admins/{id}
```
Response: `200 OK`
```json
{
  "message": "Admin deleted successfully"
}
```

### Dashboard Statistics
#### Get Overview Statistics
```http
GET /statistics/overview
```
Response: `200 OK`
```json
{
  "data": {
    "total_reports": "integer",
    "completed_reports": "integer",
    "processing_reports": "integer",
    "pending_reports": "integer",
    "rejected_reports": "integer"
  }
}
```

## Error Responses
All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "field": ["error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```