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

# Project Comments

## Add comment

```
➜  ~ curl -X POST -H "Authorization: Bearer ${TOKEN}" -d "content=test%20comment" http://localhost:5001/api/projects/bdd44533-110f-404a-a6cd-b84defb914e2/comments
{"comment":{"author_user_id":"6f542a55-e140-469e-bacb-d2879f61db96","author_username":"test","content":"test comment","created_at":"2025-11-22T15:34:50.393828","id":"5726163b-9ef6-4231-8779-6928e565760f","updated_at":"2025-11-22T15:34:50.393830"},"status_code":"success"}
```

## Get project comments

```
➜  ~ curl -X GET -H "Authorization: Bearer ${TOKEN}" http://localhost:5001/api/projects/bdd44533-110f-404a-a6cd-b84defb914e2/comments
{"comments":[{"author_user_id":"6f542a55-e140-469e-bacb-d2879f61db96","author_username":"test","content":"test comment","created_at":"2025-11-22T15:34:50.393828","id":"5726163b-9ef6-4231-8779-6928e565760f","updated_at":"2025-11-22T15:34:50.393830"},{"author_user_id":"6f542a55-e140-469e-bacb-d2879f61db96","author_username":"test","content":"test comment","created_at":"2025-11-22T15:33:30.974943","id":"3ccfe166-4778-4975-8cb4-5919aae451d8","updated_at":"2025-11-22T15:33:30.974948"}],"status_code":"success"}
```
