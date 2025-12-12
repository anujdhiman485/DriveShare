# Testing Guide for Network Error

## Problem: Network Error when adding car

## Checklist to Debug:

### 1. Check Backend Server
- ✅ Backend is running at http://localhost:8000
- Test: Open http://localhost:8000/api/v1/health in browser
- Should see: `{"status":"success","message":"DriveShare API is running!"}`

### 2. Check Frontend Server
- ✅ Frontend is running at http://localhost:5174
- Test: Open http://localhost:5174 in browser

### 3. Check Authentication
**IMPORTANT**: You must be logged in to add a car!

Steps:
1. Open http://localhost:5174
2. Click "Register" (if new user)
3. Fill in details and register
4. You'll be auto-logged in and redirected to dashboard
5. Now click "List Car"

### 4. Check Browser Console
Open browser console (F12) and check for errors:
- Red errors indicate problems
- Look for "Network Error" or CORS errors
- Look for 401 (unauthorized) or 404 (not found) errors

### 5. Fill Car Form Completely
Required fields:
- ✅ Brand (e.g., Honda)
- ✅ Model (e.g., City)
- ✅ Year (e.g., 2022)
- ✅ Fuel Type (select from dropdown)
- ✅ Transmission (select from dropdown)
- ✅ Seating Capacity (e.g., 5)
- ✅ City (select from dropdown) - This auto-sets coordinates
- ✅ Area/Locality (e.g., Andheri West)
- ✅ Price Per Day (required if not "Exchange Only")
- ✅ Available For (select rent/exchange/both)
- ✅ Description (describe your car)

### 6. Common Errors & Solutions

#### Error: "Network error. Please check if backend is running"
**Solution**: Backend server stopped
```bash
cd E:\DriveShare\Server
npm run dev
```

#### Error: "Please login to add a car"
**Solution**: You're not logged in
- Go to /login
- Login with your credentials
- Then go to /add-car

#### Error: "Unauthorized request" (401)
**Solution**: Token expired or invalid
- Logout
- Login again
- Try adding car again

#### Error: "All required fields must be provided" (400)
**Solution**: Missing required fields
- Make sure to select a **City** (not just type it)
- Enter **Area/Locality**
- Fill **Description**
- If "Rent" selected, enter **Price**

#### Error: "Valid coordinates (lat, lon) are required"
**Solution**: Coordinates not set
- Make sure you **select** a city from dropdown (not manually type)
- This auto-fills coordinates
- You should see green checkmark: "✓ Location coordinates set: 19.0760, 72.8777"

### 7. Test API Manually

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"success","message":"DriveShare API is running!"}
```

### 8. Check Console Logs

After clicking "List My Car", check browser console for:
- "Sending car data:" - Shows what data is being sent
- "API Response:" - Shows server response
- Any red errors

### 9. Updated Features

✅ Better error messages
✅ Authentication check before submission
✅ All fields validated
✅ Console logging for debugging
✅ CORS properly configured
✅ Network error detection

### 10. Quick Test Flow

1. **Backend**: http://localhost:8000/api/v1/health → Should return success
2. **Frontend**: http://localhost:5174 → Should load
3. **Register**: Create new account
4. **Add Car**: Fill ALL fields, select city, click submit
5. **Check Dashboard**: Go to "My Cars" tab
6. **Success**: Your car should appear!

## Current Status
- ✅ Backend running on port 8000
- ✅ Frontend running on port 5174
- ✅ MongoDB connected
- ✅ CORS configured
- ✅ Better error handling added
- ✅ Validation improved

## If Still Getting Error

Please check browser console (F12 → Console tab) and share:
1. The exact error message
2. Any red errors shown
3. What shows in "Network" tab when you click submit

This will help identify the exact issue!
