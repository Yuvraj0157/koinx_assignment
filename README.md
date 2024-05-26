# koinx_assignment

## Technologies Used

- Node.js
- Express.js
- Mongoose
- Multer
- csv-parser

## Setup

1. **Clone the repository**

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Configure MongoDB**
    - Ensure MongoDB is running and update the MongoDB URI in the `server.js` file:
    ```javascript
    const mongoURI = 'your_mongo_db_uri';
    ```

4. **Run the server**
    ```sh
    node server.js
    ```

## Endpoints

### 1. Upload CSV

**URL:** `/upload`

**Method:** `POST`

**Description:** Uploads a CSV file containing trade data and stores it in MongoDB.

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- Form-data with a single file field named `file`.

### 2. Get Asset Balance

**URL:** `/balance`

**Method:** `POST`

**Description:** Retrieves the asset-wise balance of the account at the specified timestamp.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "timestamp": "YYYY-MM-DD HH:MM:SS"
}
