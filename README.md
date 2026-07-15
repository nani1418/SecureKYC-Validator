# SecureKYC Validator

A hackathon-winning, production-grade GovTech & FinTech compliance application designed to validate Indian **PAN (Permanent Account Number)** and **Aadhaar** numbers. 

To minimize backend server overhead, SecureKYC incorporates client-side format checks and input normalization before executing strict validation on the Java Spring Boot microservice. The application features a glassmorphic dashboard with dark mode, real-time feedback, interactive analytics, and audit log exporting.

---

## Enhanced Hackathon-Grade Features

1. **Interactive API Documentation (Swagger/OpenAPI):** Integrated Springdoc OpenAPI. Direct endpoint testing UI is live on `http://localhost:8080/swagger-ui/index.html`.
2. **Debounced Live Pre-Validation:** Validates inputs automatically while typing, with a 300ms debounce buffer to prevent backend request flooding.
3. **Animated Validation Pipeline:** Visualizes real-time ledger progress through sequence states: Input Sanitization → Structural Matching → Category Checks → Checksum (Verhoeff) Analysis.
4. **Dynamic Segment-Level Highlighting:** Renders character inputs as individual segment arrays in real-time. Highlights incorrect digits or characters in red and displays validation badges.
5. **FinTech Security and Quality Scoring:** Computes three dynamic metrics for each validation transaction:
   *   **Confidence Score:** Metric showing syntax verification reliability (up to 99%).
   *   **Input Quality Score:** Tracks entry cleanliness, deducting points for lowercase letters, space removals, and hyphen sanitizations.
   *   **Security Score:** Shows network safety parameters.
6. **Detailed Diagnostic Explanations:** Explains precisely why a check failed (e.g. "Your input contains a digit where an alphabet was expected") and displays a suggestion checklist.
7. **Line Chart Analytics:** Renders a third interactive trendline SVG chart mapping validations timeline blocks, alongside success donut quality loops and volume bar graphs.
8. **Sorting, Filtering, & Pagination:** Logs table supports paging (5 rows per page), query strings filters, outcome status filters, and time-block sorting.
9. **Global Exception Controller:** Implemented `@RestControllerAdvice` mapping validation and argument anomalies to structured JSON models.

---

## Directory Structure

```
SecureKYC-Validator/
├── backend/
│   ├── src/
│   │   ├── main/java/com/securekyc/validator/
│   │   │   ├── config/          # CORS policies
│   │   │   ├── controller/      # REST Endpoints (Swagger Annotated)
│   │   │   ├── dto/             # Java 21 Records DTOs
│   │   │   ├── exception/       # Global Exception Handler Mapping
│   │   │   ├── service/         # PAN & Aadhaar Services
│   │   │   ├── util/            # Verhoeff tables & scoring utils
│   │   │   └── SecureKycApplication.java
│   │   └── test/java/com/securekyc/validator/
│   │       ├── service/         # JUnits for validation logic
│   │       └── controller/      # JUnits for MockMvc REST integrations
│   ├── pom.xml                  # Maven Config (OpenAPI Starter UI)
│   └── mvnw.cmd                 # Self-bootstrapping Maven script
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Hero & bank graphic vectors
│   │   │   ├── DashboardPage.tsx # Form console, SVG line chart, pipeline, history logs
│   │   │   └── AboutPage.tsx     # GovTech business spec sheet
│   │   ├── api.ts                # Axios client configurations
│   │   ├── App.tsx               # Theme and Router config
│   │   ├── index.css             # Tailwind & Glassmorphic variables
│   │   └── main.tsx
│   ├── postcss.config.js
│   ├── tailwind.config.js        # Banking design color extensions
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── documentation.md         # API documentation & architecture specs
│   └── presentation.md          # Hackathon slides markdown
└── README.md
```

---

## Getting Started (Run directly in VS Code)

### Prerequisites
*   **Java Development Kit (JDK) 21** or higher.
*   **Node.js (v18+)** and `npm` package manager.

---

### Step 1: Run the Backend Service
The backend project has a self-bootstrapping Maven script (`mvnw.cmd`). If Maven is not installed on your system, the script will automatically download Apache Maven 3.9.6 into the `backend/.maven` folder.

1. Open your terminal in VS Code.
2. Navigate to the `backend` directory and start the server:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
3. The server will start on port `http://localhost:8080`.
4. Open your browser and navigate to `http://localhost:8080/swagger-ui/index.html` to view the API documentation.

To run JUnit 5 tests (services + controller integrations), use:
```powershell
.\mvnw.cmd test
```

---

### Step 2: Run the Frontend Application
1. Open a new terminal tab in VS Code.
2. Navigate to the `frontend` directory:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## System Configuration Details
*   **API Base URL:** `http://localhost:8080/api`
*   **CORS Allowances:** Configured globally on the backend controller to accept cross-origin requests from frontend hosts (`*`).
*   **Persistent Variables:** Validation logs are saved in-memory inside the Spring Boot container (limited to the last 20 elements). Resetting/clearing the logs resets statistics.
