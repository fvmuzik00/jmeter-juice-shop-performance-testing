# OWASP Juice Shop Performance Testing Framework

[![Performance Tests](https://github.com/Trittton/jmeter-juice-shop-performance-testing/actions/workflows/performance-ci.yml/badge.svg)](https://github.com/Trittton/jmeter-juice-shop-performance-testing/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-orange)](https://jmeter.apache.org/)
[![Java](https://img.shields.io/badge/Java-17-red)](https://openjdk.org/)
[![Live Report](https://img.shields.io/badge/Report-Live-green)](https://trittton.github.io/jmeter-juice-shop-performance-testing/)

Performance testing framework for the [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) using **Apache JMeter + GitHub Actions**.

## Live Test Report

View the latest automated test results: [**Live Dashboard**](https://trittton.github.io/jmeter-juice-shop-performance-testing/)

*Reports auto-update after each test run*

---

## Overview

This framework validates performance characteristics of the OWASP Juice Shop e-commerce application through automated load, stress, spike, and endurance testing.

**Target Application:** [https://preview.owasp-juice.shop/](https://preview.owasp-juice.shop/)

### Features
- 4 performance test types (Load, Stress, Spike, Endurance)
- Realistic e-commerce user journey simulation
- Dynamic user registration (unique credentials per thread)
- CI/CD integration with GitHub Actions
- Automated HTML dashboard generation
- Configurable test parameters
- Performance threshold validation

## Test Metrics

- **4 Test Types** covering different performance scenarios
- **5 User Journey Steps** (Home → Search → Register → Login → Add to Basket)
- **Response Time SLA**: P95 ≤ 800ms
- **Error Rate SLA**: ≤ 1%
- **Throughput Target**: ≥ 10 RPS
- **Automated Execution**: Weekly on Monday at 6 AM UTC + manual trigger

## Technology Stack

- **Test Tool**: Apache JMeter 5.6.3
- **Runtime**: Java 17 (Temurin)
- **CI/CD**: GitHub Actions
- **Reporting**: JMeter HTML Dashboard + GitHub Pages
- **Dynamic Data**: Groovy JSR223 PreProcessor
- **Correlation**: JSON Extractors (JWT, Basket ID)

---

## Prerequisites

- **JMeter 5.6.3** (for local execution)
- **Java 17+** runtime
- **Git** for repository management

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Trittton/jmeter-juice-shop-performance-testing.git
   cd jmeter-juice-shop-performance-testing
   ```

2. Verify JMeter installation:
   ```bash
   jmeter --version
   ```

3. Run a test locally:
   ```bash
   jmeter -n -t ./tests/juice_shop_load.jmx -l ./results/log.jtl -e -o ./results/dashboard/
   ```

---

## Repository Structure

```
/
├── .github/workflows/
│   └── performance-ci.yml        # CI/CD pipeline with test type selection
├── data/
│   ├── users.csv                 # Legacy credentials (not used)
│   └── search_terms.csv          # Product search parameters
├── docs/
│   └── performance-plan.md       # Test strategy document
├── results/
│   └── .gitkeep                  # Placeholder (results not committed)
├── tests/
│   ├── juice_shop_load.jmx       # Load Test - normal conditions
│   ├── juice_shop_stress.jmx     # Stress Test - find breaking point
│   ├── juice_shop_spike.jmx      # Spike Test - sudden traffic surge
│   └── juice_shop_endurance.jmx  # Endurance Test - long-running stability
└── README.md                     # This file
```

---

## Usage

### Run Load Test (Normal Conditions)
```bash
jmeter -n -t ./tests/juice_shop_load.jmx -l ./results/log.jtl -e -o ./results/dashboard/
```

### Run Stress Test (Find Breaking Point)
```bash
jmeter -n -t ./tests/juice_shop_stress.jmx -l ./results/log.jtl -e -o ./results/dashboard/
```

### Run Spike Test (Sudden Traffic Surge)
```bash
jmeter -n -t ./tests/juice_shop_spike.jmx -l ./results/log.jtl -e -o ./results/dashboard/
```

### Run Endurance Test (Long-Running Stability)
```bash
jmeter -n -t ./tests/juice_shop_endurance.jmx -l ./results/log.jtl -e -o ./results/dashboard/
```

### Custom Parameters
Override default values via command-line properties:
```bash
jmeter -n -t ./tests/juice_shop_load.jmx \
  -JTHREAD_COUNT=20 \
  -JDURATION=600 \
  -JRAMP_UP=60 \
  -l ./results/log.jtl -e -o ./results/dashboard/
```

---

## Test Coverage

| Test Type | Purpose | Default Users | Duration |
|-----------|---------|---------------|----------|
| **Load** | Validate normal conditions | 10 | 5 min |
| **Stress** | Find breaking point | 50 | 5 min |
| **Spike** | Test sudden surges | 5→30→5 | 2.5 min |
| **Endurance** | Detect memory leaks | 5 | 1 hour |

### User Journey Steps

| Step | Action | Endpoint | Method |
|------|--------|----------|--------|
| 1 | Visit Home Page | `/` | GET |
| 2 | Search for Product | `/rest/products/search?q={term}` | GET |
| 3 | Register User (once) | `/api/Users` | POST |
| 4 | Login to Account | `/rest/user/login` | POST |
| 5 | Add Item to Basket | `/api/BasketItems` | POST |

> **Note:** User registration generates unique credentials per virtual user to avoid conflicts.

---

## Reports

After running tests, HTML reports are generated in:
```
results/dashboard/index.html
```

Open in browser to view:
- Response time graphs
- Throughput statistics
- Error analysis
- Request/response details

**CI Reports:** Available as artifacts in GitHub Actions workflow runs (retained for 30 days).

---

## CI/CD

Tests run automatically on:
- **Scheduled**: Weekly on Monday at 6 AM UTC
- **Manual**: Trigger via workflow_dispatch

**Manual trigger:** Go to Actions → JMeter Performance Tests → Run workflow

### Running via GitHub Actions

1. Navigate to **Actions** tab in GitHub
2. Select **JMeter Performance Tests** workflow
3. Click **Run workflow**
4. Configure parameters:
   - **Test Type**: load, stress, spike, or endurance
   - **Thread Count**: Number of virtual users
   - **Ramp-up Period**: Seconds to reach full load
   - **Duration**: Test duration in seconds
5. Download artifacts after completion

### Viewing Results

After workflow completion:
1. Click on the completed workflow run
2. View **Summary** section for quick metrics
3. Scroll to **Artifacts** section
4. Download `jmeter-{test_type}-results-{run_number}`
5. Extract and open `dashboard/index.html` in browser

---

## Configuration

### User Defined Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | preview.owasp-juice.shop | Target server hostname |
| `PROTOCOL` | https | HTTP protocol |
| `THREAD_COUNT` | 10 | Number of virtual users |
| `RAMP_UP` | 30 | Ramp-up period (seconds) |
| `DURATION` | 300 | Test duration (seconds) |
| `THINK_TIME_MIN` | 1000 | Minimum think time (ms) |
| `THINK_TIME_MAX` | 3000 | Maximum think time (ms) |

---

## Success Criteria

| Metric | Target | Description |
|--------|--------|-------------|
| **P95 Response Time** | ≤ 800ms | 95th percentile response time |
| **Error Rate** | ≤ 1% | Percentage of failed requests |
| **Throughput** | ≥ 10 RPS | Requests per second |

---

## Troubleshooting

### Authentication Failures
- Check if user registration is succeeding (View Results Tree)
- Verify `securityQuestionId: 1` in registration payload
- Check if tokens are being extracted correctly from login response

### Rate Limiting
- Reduce thread count if receiving 429 errors
- Increase think time between requests

### Connection Timeouts
- Verify target URL is accessible
- Check network connectivity from runner

### High Error Rates
The preview server has limited capacity. This is expected behavior:
- Reduce virtual users from 10 to 5
- The "Add to Basket" endpoint has known issues under concurrent load

### Debug Mode
Enable View Results Tree listener in JMeter GUI for request/response inspection:
```bash
jmeter -t ./tests/juice_shop_load.jmx
```

---

## Data-Driven Testing

### Dynamic User Registration

Each virtual user thread dynamically registers a unique account:
- **Email format**: `perf_{timestamp}_{threadId}@test.local`
- **Password**: `TestPass123`
- **Registration**: Once per thread via `OnceOnlyController`

This approach avoids credential conflicts between concurrent test threads.

### Parameterized Data

CSV files provide test data:
- [data/search_terms.csv](data/search_terms.csv) - Product search terms (apple, juice, banana, etc.)

### Test Data Security

All test accounts are **dynamically created** during test execution against the OWASP Juice Shop preview environment. No real credentials are stored or committed.

---

## Dynamic Correlation

The test plans extract and use dynamic values:

| Variable | Extraction Method | Usage |
|----------|------------------|-------|
| **Unique Email** | Groovy JSR223 PreProcessor | Registration & Login |
| **JWT Token** | JSON Extractor from login | Authorization header |
| **Basket ID** | JSON Extractor from login | Add to basket API |
| **Product ID** | Random (1-9) | Add to basket API |

> **Conditional Execution:** Add to Basket only runs if login succeeds (`authToken != "TOKEN_NOT_FOUND"`)

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-test`
3. Make changes following existing patterns
4. Test locally: `jmeter -n -t ./tests/juice_shop_load.jmx`
5. Commit and push
6. Open pull request

---

## License

This project is for educational and testing purposes. OWASP Juice Shop is licensed under MIT.

---

## References

- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [Apache JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)

---

## Support

For issues or questions:
- Open an issue in [GitHub Issues](https://github.com/Trittton/jmeter-juice-shop-performance-testing/issues)
- Review test plans in `tests/` folder
- Check [JMeter Documentation](https://jmeter.apache.org/usermanual/index.html)
