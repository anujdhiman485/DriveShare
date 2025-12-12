# DriveShare API Testing Guide

## 🧪 Quick API Tests

Use any REST client (Postman, Thunder Client, Insomnia, or curl)

## Base URL
```
http://localhost:8000/api/v1
```

---

## 1️⃣ Health Check (No Auth)

### Request
```http
GET http://localhost:8000/api/v1/health
```

### Expected Response
```json
{
  "status": "success",
  "message": "DriveShare API is running!"
}
```

---

## 2️⃣ Register a User (No Auth)

### Request
```http
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "phone": "9876543210"
}
```

### Expected Response
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "9876543210",
    "avatar": "https://via.placeholder.com/150",
    "location": "",
    "city": "",
    "coordinates": {
      "lat": 0,
      "lon": 0
    },
    "isVerified": false,
    "rating": 0,
    "totalRatings": 0,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "User registered Successfully",
  "success": true
}
```

---

## 3️⃣ Login (No Auth)

### Request
```http
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

### Expected Response
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "...",
      "fullName": "Test User",
      "username": "testuser",
      "email": "test@example.com",
      "phone": "9876543210",
      ...
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged In Successfully",
  "success": true
}
```

**📝 Important**: Copy the `accessToken` from the response. You'll need it for protected routes!

---

## 4️⃣ Get Current User (Protected)

### Request
```http
GET http://localhost:8000/api/v1/auth/current-user
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### Expected Response
```json
{
  "statusCode": 200,
  "data": {
    "_id": "...",
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    ...
  },
  "message": "User fetched successfully",
  "success": true
}
```

---

## 5️⃣ Create a Car (Protected)

### Request
```http
POST http://localhost:8000/api/v1/cars/create
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "brand": "Honda",
  "model": "City",
  "year": 2022,
  "type": "sedan",
  "transmission": "automatic",
  "fuelType": "petrol",
  "seats": 5,
  "pricePerDay": 1200,
  "location": "Mumbai",
  "area": "Andheri West",
  "coordinates": {
    "lat": 19.1200,
    "lon": 72.8467
  },
  "availableFor": "rent",
  "description": "Well-maintained Honda City with all features",
  "features": ["AC", "Music System", "GPS", "Power Windows"],
  "registrationNumber": "MH01AB1234"
}
```

### Expected Response
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "owner": "...",
    "brand": "Honda",
    "model": "City",
    "year": 2022,
    "type": "sedan",
    "transmission": "automatic",
    "fuelType": "petrol",
    "seats": 5,
    "pricePerDay": 1200,
    "location": "Mumbai",
    "area": "Andheri West",
    "coordinates": {
      "type": "Point",
      "coordinates": [72.8467, 19.1200]
    },
    "availableFor": "rent",
    "isAvailable": true,
    "rating": 0,
    "totalRatings": 0,
    "totalBookings": 0,
    ...
  },
  "message": "Car created successfully",
  "success": true
}
```

---

## 6️⃣ Get All Cars (No Auth)

### Request - Basic
```http
GET http://localhost:8000/api/v1/cars
```

### Request - With Filters
```http
GET http://localhost:8000/api/v1/cars?availableFor=rent&type=sedan&page=1&limit=10
```

### Request - Location-Based Search (Nearby Cars)
```http
GET http://localhost:8000/api/v1/cars?lat=19.0760&lon=72.8777&maxDistance=50&availableFor=rent&sortBy=price-low
```

**Query Parameters:**
- `lat` - User's latitude
- `lon` - User's longitude
- `maxDistance` - Search radius in km (e.g., 50)
- `availableFor` - rent/exchange/both/all
- `type` - sedan/suv/hatchback/luxury/sports/electric
- `transmission` - manual/automatic
- `fuelType` - petrol/diesel/electric/hybrid
- `minPrice` - Minimum price per day
- `maxPrice` - Maximum price per day
- `search` - Search in brand/model/location/area
- `sortBy` - price-low/price-high/rating/newest
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

### Expected Response
```json
{
  "statusCode": 200,
  "data": {
    "cars": [
      {
        "_id": "...",
        "brand": "Honda",
        "model": "City",
        "year": 2022,
        "pricePerDay": 1200,
        "location": "Mumbai",
        "area": "Andheri West",
        "coordinates": {
          "type": "Point",
          "coordinates": [72.8467, 19.1200]
        },
        "owner": {
          "fullName": "Test User",
          "email": "test@example.com",
          "phone": "9876543210",
          "rating": 0,
          "avatar": "..."
        },
        ...
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  },
  "message": "Cars fetched successfully",
  "success": true
}
```

---

## 7️⃣ Get Car by ID (No Auth)

### Request
```http
GET http://localhost:8000/api/v1/cars/CAR_ID_HERE
```

### Expected Response
```json
{
  "statusCode": 200,
  "data": {
    "car": {
      "_id": "...",
      "brand": "Honda",
      "model": "City",
      ...
      "owner": {
        "fullName": "Test User",
        "email": "test@example.com",
        "phone": "9876543210",
        "rating": 0,
        "location": "Mumbai",
        "city": "Mumbai"
      }
    },
    "reviews": []
  },
  "message": "Car details fetched successfully",
  "success": true
}
```

---

## 8️⃣ Create a Booking (Protected)

### Request
```http
POST http://localhost:8000/api/v1/bookings/create
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "carId": "CAR_ID_HERE",
  "startDate": "2024-12-15",
  "endDate": "2024-12-20",
  "message": "Need the car for a business trip",
  "pickupLocation": "Andheri West"
}
```

### Expected Response
```json
{
  "statusCode": 201,
  "data": {
    "_id": "...",
    "car": {
      "_id": "...",
      "brand": "Honda",
      "model": "City",
      "year": 2022,
      "images": [],
      "location": "Mumbai"
    },
    "renter": "...",
    "owner": {
      "_id": "...",
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "9876543210",
      "avatar": "..."
    },
    "startDate": "2024-12-15T00:00:00.000Z",
    "endDate": "2024-12-20T00:00:00.000Z",
    "totalDays": 5,
    "pricePerDay": 1200,
    "totalPrice": 6000,
    "status": "pending",
    "paymentStatus": "pending",
    "message": "Need the car for a business trip",
    "pickupLocation": "Andheri West",
    ...
  },
  "message": "Booking created successfully",
  "success": true
}
```

---

## 9️⃣ Get My Bookings (Protected)

### Request
```http
GET http://localhost:8000/api/v1/bookings/my-bookings
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

### With Status Filter
```http
GET http://localhost:8000/api/v1/bookings/my-bookings?status=pending
```

**Status Options**: pending, confirmed, ongoing, completed, cancelled, all

---

## 🔟 Get My Cars (Protected)

### Request
```http
GET http://localhost:8000/api/v1/cars/my-cars
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 1️⃣1️⃣ Update Car (Protected)

### Request
```http
PATCH http://localhost:8000/api/v1/cars/CAR_ID_HERE/update
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "pricePerDay": 1500,
  "description": "Updated description",
  "features": ["AC", "Music System", "GPS", "Power Windows", "Sunroof"]
}
```

---

## 1️⃣2️⃣ Toggle Car Availability (Protected)

### Request
```http
PATCH http://localhost:8000/api/v1/cars/CAR_ID_HERE/toggle-availability
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

---

## 1️⃣3️⃣ Create a Review (Protected)

### Request
```http
POST http://localhost:8000/api/v1/reviews/create
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "carId": "CAR_ID_HERE",
  "rating": 5,
  "comment": "Excellent car! Very well maintained and the owner was very cooperative.",
  "reviewType": "car"
}
```

---

## 1️⃣4️⃣ Create Exchange Request (Protected)

### Request
```http
POST http://localhost:8000/api/v1/exchanges/create
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json

{
  "requestedCarId": "TARGET_CAR_ID",
  "offeredCarId": "MY_CAR_ID",
  "startDate": "2024-12-15",
  "endDate": "2024-12-20",
  "message": "Would like to exchange my BMW for your Mercedes",
  "exchangeLocation": "Mumbai"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "statusCode": 400,
  "message": "All fields are required",
  "errors": []
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized request",
  "errors": []
}
```

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You are not authorized to update this car",
  "errors": []
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Car not found",
  "errors": []
}
```

### 409 Conflict
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User with email or username already exists",
  "errors": []
}
```

---

## 🎯 Testing Workflow

### Complete Test Flow:

1. ✅ Health check
2. ✅ Register a user
3. ✅ Login with that user
4. ✅ Copy the access token
5. ✅ Get current user (verify token works)
6. ✅ Create a car
7. ✅ Get all cars (see your car in the list)
8. ✅ Get car by ID
9. ✅ Create another user (different email)
10. ✅ Login with second user
11. ✅ Create a booking for the first user's car
12. ✅ Check bookings (both received and sent)
13. ✅ Create a review
14. ✅ Test location search with coordinates

---

## 🛠️ VS Code REST Client Extension

If you have REST Client extension, create a file `test.http`:

```http
### Variables
@baseUrl = http://localhost:8000/api/v1
@token = YOUR_TOKEN_HERE

### Health Check
GET {{baseUrl}}/health

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123",
  "phone": "9876543210"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}

### Get Current User
GET {{baseUrl}}/auth/current-user
Authorization: Bearer {{token}}

### Create Car
POST {{baseUrl}}/cars/create
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "brand": "Honda",
  "model": "City",
  "year": 2022,
  "type": "sedan",
  "transmission": "automatic",
  "fuelType": "petrol",
  "seats": 5,
  "pricePerDay": 1200,
  "location": "Mumbai",
  "area": "Andheri West",
  "coordinates": {
    "lat": 19.1200,
    "lon": 72.8467
  },
  "availableFor": "rent"
}

### Get All Cars
GET {{baseUrl}}/cars

### Get Nearby Cars
GET {{baseUrl}}/cars?lat=19.0760&lon=72.8777&maxDistance=50
```

---

## 📱 Test from Frontend

Once both servers are running:
1. Frontend: http://localhost:5173
2. Backend: http://localhost:8000

Go to the frontend and:
1. Click "Register" - Create a new account
2. Login with your credentials
3. Go to "List Car" and add a car
4. Go to "Browse Cars" - Your car should appear
5. Test location search features

---

**Happy Testing! 🎉**
