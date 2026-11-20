# HMS Backend

NestJS backend development setup configured with **TypeORM** and **MongoDB**.

---

## 🛠️ Configuration

The application is configured using `@nestjs/config` and connects to MongoDB via `@nestjs/typeorm`.

### Environment Variables (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hms_db
MONGODB_DATABASE=hms_db
```

- **Database:** MongoDB
- **ORM:** TypeORM (`type: 'mongodb'`)
- **Auto-load Entities:** Enabled (`autoLoadEntities: true`)
- **CORS:** Enabled for frontend integration

---

## 🚀 Getting Started

### 1. Install dependencies (if needed)
```bash
npm install
```

### 2. Start development server
```bash
npm run start:dev
```
The server will start at `http://localhost:5000`.

### 3. Build for production
```bash
npm run build
```

### 4. Run tests
```bash
npm run test
```
