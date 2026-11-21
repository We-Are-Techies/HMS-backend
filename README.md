# Varma Nursing Home - Patient Registration Backend

Enterprise NestJS REST API backend for **Varma Nursing Home Patient Registration System**, built with **TypeORM**, **MongoDB**, **Swagger**, and **URI Versioning**.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** NestJS 12 (TypeScript, ESM)
- **Database:** MongoDB (Database: `varma_nursing_home`, Collection: `patient_registrations`)
- **ORM:** TypeORM (`@nestjs/typeorm`, `typeorm`, `@ObjectIdColumn`)
- **API Documentation:** Swagger UI at `/api/docs`
- **Versioning:** URI-based (`/api/v1/patient-registrations`)
- **Validation:** Global `ValidationPipe` with `class-validator` and `class-transformer`
- **Security:** Automatic server-side registration timestamp generation & CORS enabled for frontend

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/varma_nursing_home
MONGODB_DATABASE=varma_nursing_home
```

---

## 📡 REST API Endpoints (`v1`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/patient-registrations` | Register a new patient (Identity, Vitals, Body Measurements) | `201 Created` |
| `GET` | `/api/v1/patient-registrations` | Get all patient registrations (Paginated: `?page=1&limit=10`) | `200 OK` |
| `GET` | `/api/v1/patient-registrations/:id` | Get patient registration by MongoDB ObjectId | `200 OK` |
| `PATCH` | `/api/v1/patient-registrations/:id` | Update patient registration details | `200 OK` |
| `DELETE` | `/api/v1/patient-registrations/:id` | Delete patient registration record | `200 OK` |

Interactive Swagger Documentation:
- **Swagger UI:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **OpenAPI JSON:** `http://localhost:5000/api/docs-json`

---

## 🗄️ MongoDB Document Schema (`patient_registrations`)

```json
{
  "_id": "673ee85fa9123b456c789012",
  "patientIdentity": {
    "name": "Rajesh Varma",
    "age": 42,
    "gender": "Male"
  },
  "bodyMeasurements": {
    "height": 172,
    "weight": 68
  },
  "bloodPressureVitals": {
    "systolic": 120,
    "diastolic": 80
  },
  "registrationTimestamp": {
    "date": "2026-11-21",
    "time": "14:02:00"
  },
  "createdAt": "2026-11-21T14:02:00.123Z",
  "updatedAt": "2026-11-21T14:02:00.123Z"
}
```

---

## 🚀 Running the Backend

### 1. Ensure MongoDB is Running
```powershell
mongod --port 27017
```

### 2. Install Dependencies
```powershell
cd D:\Mypersonal\HMS\HMS_Backend
npm install
```

### 3. Start Development Server
```powershell
npm run start:dev
```
Backend will start on `http://localhost:5000`.

### 4. Build for Production
```powershell
npm run build
npm run start:prod
```
