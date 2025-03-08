## API Endpoints

Base url

```bash
http://localhost:3000/
```

### Authentication

1. Sign Up

Endpoint:

```bash
/auth/sign-up
```

Request body:

```bash
{
    "email":"jane@gmail.com",
    "name":"Jane Doe",
    "password":"12345"
}
```

2. Login

Endpoint:

```bash
/auth/login
```

Request body:

```bash
{
    "email":"jane@gmail.com",
    "password":"12345"
}
```

Return format:

```bash
{
    "message": "Logged in successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY3Y2M1ZmE5MGY2Y2VhNjdlNTIzOWE0YSIsIm5hbWUiOiJaZWUiLCJlbWFpbCI6InplZUBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRmWHlMU3NDSzNsV3JiVTJTWENyNkYuNUQ2NlhLR2c0UEJiY0ZvLndKMXBZZ2tVR054UTJJLiIsIm1vbnRobHlCdWRnZXQiOjAsImN1cnJlbmN5IjoiVVNEIiwiY3JlYXRlZEF0IjoiMjAyNS0wMy0wOFQxNToxODowMS4wNjFaIiwidXBkYXRlZEF0IjoiMjAyNS0wMy0wOFQxNToxODowMS4wNjNaIiwiX192IjowfSwiaWF0IjoxNzQxNDQ3NzM4LCJleHAiOjE3NDE0OTA5Mzh9.XPmwMjcMdrQRKHN0GnnglgZPB86ygGIL5_wbBDWmuoQ"
}
```

### Bill Upload

Set `Authorization` header to `Bearer eyJhbGciOiJIUzI1NiIsInR5cC...`

This is the token returned as response when the user tries to login.

Request body:

Set formdata field key to `bill` and attach the corresponding image of the bill to it.

Endpoint:

```bash
/process-bill
```

Return format:

```bash
{
    "message":"Bill processed successfully",
    "structuredData":{
        "items":[{
            "name":"Frozen French Fries",
            "price":1.35,
            "quantity":2,
            "category":"Frozen Food"
        },
        {
            "name":"Cream Of Mushroom Soup",
            "price":0.62,
            "quantity":1,
            "category":"Soup"
        }],
    "totalAmount":35.77}
}
```
