# WBS (Whistle Blowing System) API Specification

## Base URL

```
https://wbs-api.dpmptsp.padang.go.id/v1
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
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
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
  "message": "Login Successful",
  "access_token": "string",
  "refresh_token": "string",
  "token_type": "Bearer",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Forgot Password

```http
POST /auth/forgot-password
```

Request Body:

```json
{
  "email": "string"
}
```

Response: `200 OK`

```json
{
  "message": "Password reset link sent"
}
```

### Reset Password

```http
POST /auth/reset-password
```

Request Body:

```json
{
  "token": "string",
  "new_password": "string"
}
```

Response: `200 OK`

```json
{
  "message": "Password has been reset successfully"
}
```

#### Update Profile

```http
PUT /auth/profile
```

Request Body:

```json
{
  "name": "string"
}
```

Response: `200 OK`

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Update Password

```http
PUT /auth/password
```

Request Body:

```json
{
  "current_password": "string",
  "new_password": "string",
  "new_password_confirmation": "string"
}
```

Response: `200 OK`

```json
{
  "message": "Password updated successfully"
}
```

#### Logout

```http
POST /auth/logout
```

Request Body:

```json
{
  "refresh_token": "string"
}
```

Response: `200 OK`

```json
{
  "message": "Logout successful"
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
  "data": [
    {
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
    }
  ],
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
    "files": [
      {
        "id": "integer",
        "file_path": "string",
        "file_type": "string"
      }
    ],
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
  "data": [
    {
      "id": "integer",
      "message": "text",
      "created_at": "datetime",
      "user": {
        "id": "integer",
        "name": "string",
        "role": "string"
      }
    }
  ]
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
  "data": [
    {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "string",
      "created_at": "datetime"
    }
  ]
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

### Dashboard (Role-Based)

#### Get User Dashboard

```http
GET /dashboard/user
```

Response: `200 OK`

```json
{
  "active_reports": {
    "total": "integer",
    "waiting_verification": "integer",
    "in_process": "integer",
    "completed": "integer"
  },
  "latest_activities": [
    {
      "type": "string",
      "report_id": "integer",
      "message": "string",
      "timestamp": "datetime"
    }
  ],
  "unread_messages": "integer"
}
```

#### Get Verifikator Dashboard

```http
GET /dashboard/verifikator
```

Response: `200 OK`

```json
{
  "pending_verifications": {
    "total": "integer",
    "urgent": "integer"
  },
  "verification_stats": {
    "today_verified": "integer",
    "today_rejected": "integer",
    "weekly_performance": [
      {
        "date": "date",
        "verified": "integer",
        "rejected": "integer"
      }
    ]
  }
}
```

#### Get Prosesor Dashboard

```http
GET /dashboard/prosesor
```

Response: `200 OK`

```json
{
  "active_cases": {
    "total": "integer",
    "need_update": "integer",
    "near_deadline": "integer"
  },
  "workload_stats": {
    "assigned_reports": "integer",
    "completed_reports": "integer",
    "average_completion_time": "string"
  }
}
```

#### Get Super Admin Dashboard

```http
GET /dashboard/super-admin
```

Response: `200 OK`

```json
{
  "system_stats": {
    "total_users": "integer",
    "total_reports": "integer",
    "completion_rate": "float",
    "average_process_time": "string"
  },
  "admin_performance": [
    {
      "admin_id": "integer",
      "name": "string",
      "role": "string",
      "reports_handled": "integer",
      "average_response_time": "string"
    }
  ]
}
```

### Notifications

#### Get User Notifications

```http
GET /notifications
```

Query Parameters:

- read: boolean
- page: integer
- per_page: integer

Response: `200 OK`

```json
{
  "data": [
    {
      "id": "integer",
      "type": "string",
      "message": "string",
      "read": "boolean",
      "created_at": "datetime",
      "report_id": "integer|null"
    }
  ],
  "meta": {
    "unread_count": "integer",
    "current_page": "integer",
    "total_pages": "integer"
  }
}
```

#### Mark Notification as Read

```http
PUT /notifications/{id}/read
```

Response: `200 OK`

```json
{
  "message": "Notification marked as read"
}
```

#### Mark All Notifications as Read

```http
PUT /notifications/read-all
```

Response: `200 OK`

```json
{
  "message": "All notifications marked as read"
}
```

#### Get Notification Settings

```http
GET /notifications/settings
```

Response: `200 OK`

```json
{
  "email_notifications": "boolean",
  "browser_notifications": "boolean",
  "notification_types": {
    "report_status": "boolean",
    "new_message": "boolean",
    "system_updates": "boolean"
  }
}
```

#### Update Notification Settings

```http
PUT /notifications/settings
```

Request Body:

```json
{
  "email_notifications": "boolean",
  "browser_notifications": "boolean",
  "notification_types": {
    "report_status": "boolean",
    "new_message": "boolean",
    "system_updates": "boolean"
  }
}
```

Response: `200 OK`

```json
{
  "message": "Notification settings updated successfully"
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
