# Authentication

## Setup

Add `SECRET_KEY` environment variable, otherwise tokens will be invalidated after each application restart.

## Get JWT token

```
➜  ~ curl -X POST -d "username=test&password=test" http://localhost:5001/api/auth/token
{"status_code":"success","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNzgwYWFjZDMtOWMxZS00MGEwLWIwNDItZDU0NDAwYzY0OTk3IiwiZXhwIjoxNzYzMzA2NDIzfQ.cDLRWWG34OsDqCOS3yKWjzcXxXoqBXXkFOXsZrIeofg"}
```

## Make authenticated request

Supply header `Authorization` with value `Bearer <token>`, e.g.:

```
➜  ~ curl -H "Authorization: Bearer ${TOKEN}" http://localhost:5001/api/users
{"status_code":"success","users":[{"id":"780aacd3-9c1e-40a0-b042-d54400c64997","is_active":true}]}
```

# User management

## Create user

```
➜  ~ curl -X POST -d "username=test&password=test" -H "Authorization: Bearer ${TOKEN}" http://localhost:5001/api/users         
{"id":"780aacd3-9c1e-40a0-b042-d54400c64997","status_code":"success"}
```

## List users

```
➜  ~ curl -H "Authorization: Bearer ${TOKEN}" http://localhost:5001/api/users
{"status_code":"success","users":[{"id":"780aacd3-9c1e-40a0-b042-d54400c64997","is_active":true}]}
```

## Update user password

```
➜  ~ curl -X PATCH -H "Authorization: Bearer ${TOKEN}" -d "old_password=test&new_password=test" http://localhost:5001/api/users/780aacd3-9c1e-40a0-b042-d54400c64997
{"id":"780aacd3-9c1e-40a0-b042-d54400c64997","status_code":"success"}
```
