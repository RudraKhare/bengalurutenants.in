# User Uniqueness & Dashboard System

## 🔐 How User Uniqueness Works

### **1. User Identification System**

#### **Primary Identification:**
- **User ID**: Auto-increment integer primary key (`users.id`)
- **Email**: Unique constraint ensures no duplicate emails (`users.email`)
- **JWT Tokens**: Contain user ID in the `sub` (subject) claim

#### **Authentication Flow:**
```
1. User signs up/logs in with email
2. System creates/finds user record by email
3. JWT access token issued with user_id in payload
4. Token included in all subsequent API requests
5. Backend extracts user_id from token to identify user
```

### **2. Review Ownership System**

#### **Database Relationships:**
```sql
reviews.user_id → users.id (Foreign Key)
reviews.property_id → properties.id (Foreign Key)
properties.property_owner_id → users.id (Foreign Key)
```

#### **User-Review Association:**
- Each review has `user_id` foreign key
- Users can only edit/delete their own reviews
- System prevents duplicate reviews from same user on same property

### **3. Property Ownership System**

#### **Property Creation:**
- When user creates property through review form, `property_owner_id` is set to current user
- Users can see all properties they've created/listed
- Enables landlord dashboard functionality

## 🏠 Dashboard API Endpoints

### **User's Reviews: `/api/v1/reviews/my-reviews`**
```http
GET /api/v1/reviews/my-reviews
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "reviews": [
    {
      "id": 123,
      "rating": 5,
      "comment": "Great place!",
      "property_type": "FLAT_APARTMENT",
      "verification_level": "verified",
      "created_at": "2025-09-17T10:30:00",
      "property": {
        "id": 456,
        "address": "123 Sample Street",
        "city": "Bengaluru",
        "area": "Koramangala"
      }
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 50
}
```

### **User's Properties: `/api/v1/reviews/my-properties`**
```http
GET /api/v1/reviews/my-properties  
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 456,
    "address": "123 Sample Street, Koramangala",
    "city": "Bengaluru", 
    "area": "Koramangala",
    "property_type": "FLAT_APARTMENT",
    "avg_rating": 4.5,
    "review_count": 3,
    "created_at": "2025-09-17T09:15:00",
    "photo_keys": "photo1.jpg,photo2.jpg"
  }
]
```

## 🔒 Security Features

### **JWT Token Security:**
- **Access tokens**: Long-lived (7 days default) for API access
- **Magic tokens**: Short-lived (10 minutes) for email verification
- **Signature verification**: Prevents token tampering
- **Expiry checks**: Prevents old token reuse

### **Authorization Checks:**
- Users can only access their own reviews and properties
- Edit/delete operations verify ownership
- Property creation automatically sets current user as owner

### **Database Constraints:**
- Email uniqueness prevents duplicate accounts
- Foreign key constraints maintain data integrity
- User ID references ensure valid user associations

## 🚀 Frontend Integration

### **Authentication State Management:**
```typescript
// Store JWT token after login
localStorage.setItem('token', accessToken);

// Include in API requests
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### **Dashboard Data Fetching:**
```typescript
// Get user's reviews
const userReviews = await fetch('/api/v1/reviews/my-reviews', { headers });

// Get user's properties  
const userProperties = await fetch('/api/v1/reviews/my-properties', { headers });
```

### **User Session Persistence:**
- JWT tokens stored in localStorage/sessionStorage
- Token includes user ID for backend identification
- Frontend can decode token to show user info
- Automatic re-authentication on page reload

## 🎯 Key Benefits

1. **Unique User Identification**: Email-based uniqueness with numeric IDs
2. **Secure Authentication**: JWT-based stateless authentication
3. **Data Ownership**: Clear user-data relationships
4. **Dashboard Ready**: Dedicated endpoints for user-specific data
5. **Scalable**: Supports multi-user environment with proper isolation

## 📱 Next Steps for Frontend

1. **Create Dashboard Page**: Show user's reviews and properties
2. **Add Authentication Guards**: Protect dashboard routes
3. **Implement Review Management**: Edit/delete user's own reviews
4. **Property Management**: View and manage user's properties
5. **Profile Management**: User settings and account info
