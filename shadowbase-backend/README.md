# ShadowBase — Zero-Downtime Schema Migration Sandbox

Test schema changes against a disposable clone of production, fed with real
live traffic, before ever touching production.

## What it does

1. Your production Postgres DB runs normally.
2. **Debezium** watches its write-ahead log and streams every insert/update/delete to **Kafka** (this is Change Data Capture — no app code changes needed).
3. **ShadowBase's Java backend** spins up a temporary, disposable DB clone using **Testcontainers**, applies your migration script to it, then consumes the Kafka stream and replays each production query against that clone.
4. If your migration broke something (dropped a column something still queries, added a constraint something now violates), the clone throws a real SQL exception — caught and shown on the **React dashboard** in real time.
5. You fix the migration script and repeat, all without production ever seeing the risk.

## Prerequisites

- Java 21+
- Maven 3.9+
- Docker Desktop (running) — Testcontainers and docker-compose both need this
- Node.js 18+ (only if you build the full React frontend instead of the static dashboard HTML)

## Run it — step by step

### 1. Start the infrastructure (production DB, Kafka, Debezium)
```bash
docker compose up -d
```
Wait ~20 seconds for everything to report healthy:
```bash
docker compose ps
```

### 2. Register the Debezium connector against the mock production DB
```bash
curl -i -X POST -H "Accept:application/json" -H "Content-Type:application/json" \
  http://localhost:8083/connectors/ -d @debezium/register-postgres-connector.json
```
Verify it's running:
```bash
curl http://localhost:8083/connectors/dbserver1-connector/status
```

### 3. Build and run the Spring Boot backend
```bash
mvn clean install
mvn spring-boot:run
```
The backend starts on **http://localhost:8080**.

### 4. Create a shadow environment (spins up a disposable Postgres clone)
```bash
curl -X POST http://localhost:8080/api/environments \
  -H "Content-Type: application/json" \
  -d '{"baseSchemaSql": "CREATE TABLE orders (id SERIAL PRIMARY KEY, customer_name VARCHAR(100), amount NUMERIC(10,2), status VARCHAR(20));"}'
```
This returns an `environmentId` — keep it, you'll pass it alongside replayed queries.

### 5. Test a migration script before running it on production
```bash
curl -X POST http://localhost:8080/api/migrations/analyze \
  -H "Content-Type: application/json" \
  -d '{"sql": "ALTER TABLE orders DROP COLUMN legacy_ref;"}'
```
Then apply it to the shadow clone only:
```bash
curl -X POST http://localhost:8080/api/environments/<envId>/migrate \
  -H "Content-Type: application/json" \
  -d '{"sql": "ALTER TABLE orders DROP COLUMN legacy_ref;"}'
```

### 6. Generate some "production" traffic to replay
```bash
docker exec -it shadowbase-postgres-prod psql -U prod -d prod_db \
  -c "INSERT INTO orders (customer_name, amount, legacy_ref) VALUES ('Test User', 42.00, 'LR-9999');"
```
Debezium picks this up → Kafka → your backend's `CdcReplayConsumer` replays it against the
shadow clone. If the clone dropped `legacy_ref` in step 5, this INSERT will now fail there —
exactly the breakage you wanted to catch before it hit production.

### 7. View the dashboard
Open `shadowbase-dashboard.html` in a browser (or serve the real React app), and point its
API calls at `http://localhost:8080/api/metrics/summary` and `/api/metrics/exceptions`.

### 8. Tear down
```bash
curl -X DELETE http://localhost:8080/api/environments/<envId>
docker compose down -v
```

## Project structure
```
shadowbase-backend/
├── docker-compose.yml          # prod Postgres, Kafka, Zookeeper, Debezium Connect, MySQL metadata store
├── init/01-schema.sql          # seeds the mock production DB
├── debezium/register-postgres-connector.json
├── pom.xml
└── src/main/java/com/infotact/shadowbase/
    ├── ShadowBaseApplication.java
    ├── controller/
    │   ├── EnvironmentController.java   # create/migrate/destroy shadow clones
    │   ├── MetricsController.java       # dashboard summary + exception feed
    │   └── MigrationController.java     # AST-based "drops a column" warnings
    └── service/
        ├── ShadowEnvironmentService.java  # Testcontainers lifecycle
        ├── CdcReplayConsumer.java         # Kafka listener, replays CDC events
        ├── CdcEventTranslator.java        # Debezium JSON -> SQL
        ├── MetricsService.java            # live counters + exception log
        └── MigrationAnalysisService.java  # JSqlParser AST checks
```

## Notes for your report / viva

- **Functional requirements**: spin up isolated DB clones, capture live CDC traffic, replay it against the clone, surface SQL errors in real time, statically warn about risky DDL (dropped columns) before running.
- **Non-functional requirements**: isolation (shadow never touches prod), low replay latency, disposability (clones are ephemeral, cheap to recreate), observability (dashboard).
- **One-line answer**: ShadowBase is a DevOps tool that spins up isolated database clones, captures live production traffic via Debezium and Kafka, replays it against the clone, and surfaces SQL errors in real time — letting DBAs test schema changes safely with zero downtime.
