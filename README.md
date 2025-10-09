# Fynd PLM Headless (Minimal Express + PostgreSQL JSONB)

This is a minimal, working headless PLM scaffold in Node.js that follows the approach:
- **Relational core + JSONB**: keep core columns relational and custom fields in `jsonb`.
- **Per-tenant JSON Schema**: validate payloads with Ajv from schemas stored in DB.
- **Multi-tenancy**: every row has `tenant_id`. APIs require `X-Tenant-Id`.
- **Rules engine hook**: ready to add defaulting/conditional logic.
- **Transactions**: writes are wrapped in DB transactions.

## Stack
- Node.js, Express
- PostgreSQL (JSONB)
- Ajv + ajv-formats
- json-rules-engine (optional usage hook)

## Setup

1) Install dependencies
```bash
npm install
```

2) Set environment
- Copy `.env.example` to `.env` and set `DATABASE_URL` or granular PG vars.

Example:
```bash
cp .env.example .env
# edit .env to point to your Postgres
```

3) Create database (if needed)
```bash
# example using psql; adjust user/pass/host
createdb fynd_plm || true
```

4) Run migrations
```bash
npm run migrate
```

5) Seed a sample tenant schema
```bash
# Ensure DATABASE_URL or PG* vars are set in your shell or .env
npm run seed
```

6) Start the server
```bash
npm run dev
# or
npm start
```

Server runs at `http://localhost:3000`.

## API

Headers: always include
```
X-Tenant-Id: 11111111-1111-1111-1111-111111111111
Content-Type: application/json
```

### Health
```
GET /health
```

### Create Style
```
POST /styles
{
  "code": "STY-1001",
  "name": "Classic Tee",
  "status": "draft",
  "custom": {
    "season": "SS25",
    "brand": "Fynd",
    "targetGender": "unisex",
    "launchDate": "2025-10-01",
    "mrp": 999
  }
}
```

### List Styles
```
GET /styles
```

### Get Style by Id
```
GET /styles/:id
```

### Update Style
```
PUT /styles/:id
{
  "code": "STY-1001",
  "name": "Classic Tee Updated",
  "status": "active",
  "custom": {
    "season": "FW25",
    "brand": "Fynd",
    "targetGender": "unisex",
    "launchDate": "2025-12-01",
    "mrp": 1099
  }
}
```

## Notes
- Add expression indexes for hot fields, e.g. `create index ... on styles((data->>'season'));`
- To rotate schemas, insert a new `tenant_schemas` row with higher `version` and set `is_active=true` (constraint ensures only one active).
- Replace the seed `tenant_id` with your real tenant GUID.
- This scaffold prefers Express for simplicity. You can later swap to LoopBack 4 to auto-generate OpenAPI and repositories from metadata.




## Notes of the flow - 

The End-to-End Flow: From API Call to Database Record
Here is the journey of a single API request, which perfectly demonstrates how all your manager's requirements are met.

Scenario: A user sends a request to create a new style.

API Request: The user sends a POST request to http://localhost:3000/styles with the new style's data in the JSON body.
The Sequence Takes Over (
src/sequence.ts
):
LoopBack receives the request and hands it to our custom 
MySequence
.
The sequence's first job is to find the right controller method to handle this request (it finds 
StyleController.create
).
Requirement Met: The sequence then calls our custom validation logic. This is where we injected our schema validation.
Dynamic Validation (
src/services/validator.service.ts
):
The 
ValidatorService
 is called. It looks at the X-Tenant-Id header.
It queries the tenant_schemas table in PostgreSQL to find the active JSON Schema for a style object for that tenant.
It uses the Ajv library to validate the incoming JSON body against the schema it just fetched.
If the data is invalid (e.g., a required field is missing), it throws an error and stops the process.
Requirement Met: This step fulfills the core requirement of using Ajv and database-stored JSON Schemas for automatic, dynamic validation.
The Controller Acts (
src/controllers/style.controller.ts
):
If validation passes, the request continues to the 
create
 method in the 
StyleController
.
The controller's only job is to take the validated data and pass it to the repository.
Requirement Met: This controller, and its methods, are what LoopBack uses to auto-generate the REST API and the API documentation.
The Repository Saves (
src/repositories/style.repository.ts
):
The styleRepository receives the new style object.
It translates this object into the correct SQL INSERT statement.
It uses the connection details from the fynd-plm.datasource.ts to execute the SQL command on your PostgreSQL database.
Database Confirmation: The new row is saved to the styles table. You can see this new row immediately in TablePlus.
Success Response: The API sends a 200 OK response back to the user with a copy of the newly created style object, including its new id.




http://localhost:3000/explorer/#/GenericController ------------------------------->