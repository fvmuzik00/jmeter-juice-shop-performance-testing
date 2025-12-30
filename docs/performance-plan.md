# Performance Test Plan

## Document Information

| Field | Value |
|-------|-------|
| **Project** | OWASP Juice Shop Performance Testing |
| **Version** | 1.0 |
| **Author** | QA Automation Team |
| **Last Updated** | January 2026 |

---

## 1. Introduction

### 1.1 Purpose

This document defines the performance testing strategy for the OWASP Juice Shop application. It outlines the approach, scope, success criteria, and execution methodology for load and stress testing.

### 1.2 Scope

**In Scope:**
- User journey performance (Home → Search → Login → Add to Basket)
- API response time validation
- Throughput measurement under load
- Error rate monitoring

**Out of Scope:**
- Security/penetration testing
- UI rendering performance
- Database performance tuning
- Infrastructure capacity planning

### 1.3 References

- [OWASP Juice Shop Documentation](https://owasp.org/www-project-juice-shop/)
- [Apache JMeter Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- Performance Testing Assignment Requirements

---

## 2. Test Environment

### 2.1 System Under Test (SUT)

| Component | Details |
|-----------|---------|
| **Application** | OWASP Juice Shop |
| **URL** | https://preview.owasp-juice.shop |
| **Type** | Angular SPA with Node.js backend |
| **API** | RESTful JSON |

### 2.2 Test Infrastructure

| Component | Specification |
|-----------|---------------|
| **Load Generator** | GitHub Actions Ubuntu Runner |
| **JMeter Version** | 5.6.3 (LTS) |
| **Java Version** | 17 (Temurin) |
| **Network** | GitHub-hosted runner network |

### 2.3 Test Data

| Data Set | Source | Records | Notes |
|----------|--------|---------|-------|
| User Credentials | Dynamic Registration | N/A | Generated per thread via Groovy script |
| Search Terms | `data/search_terms.csv` | 5 terms | apple, juice, banana, orange, lemon |

> **Dynamic User Registration**: Each virtual user thread generates a unique email address using the pattern `perf_{timestamp}_{threadId}@test.local` to avoid conflicts with existing users or other test threads.

---

## 3. Test Scenarios

### 3.1 User Journey Flow

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐    ┌─────────┐    ┌────────────────┐
│  Home Page  │ -> │ Search Product  │ -> │ Register User│ -> │  Login  │ -> │ Add to Basket  │
│   GET /     │    │ GET /rest/      │    │ POST /api/   │    │ POST    │    │ POST /api/     │
│             │    │ products/search │    │ Users        │    │ /rest/  │    │ BasketItems    │
└─────────────┘    └─────────────────┘    │ (Once Only)  │    │ user/   │    └────────────────┘
                                          └──────────────┘    │ login   │
                                                              └─────────┘
```

> **Note:** User registration happens once per virtual user thread using a OnceOnlyController. Each thread generates a unique email address to avoid conflicts.

### 3.2 Transaction Details

#### TC_01: Home Page
- **Request**: GET /
- **Expected Response**: 200 OK
- **Timeout**: 1500ms
- **Purpose**: Validate initial page load performance

#### TC_02: Search Product
- **Request**: GET /rest/products/search?q={searchTerm}
- **Expected Response**: 200 OK, JSON with product data
- **Correlation**: Extract first product ID for basket operation
- **Timeout**: 1500ms

#### Setup: Register User (Once per thread)
- **Controller**: OnceOnlyController (executes once per virtual user)
- **Pre-processor**: JSR223 Groovy script generates unique email
- **Request**: POST /api/Users
- **Body**:
  ```json
  {
    "email": "perf_{timestamp}_{threadId}@test.local",
    "password": "TestPass123",
    "passwordRepeat": "TestPass123",
    "securityQuestionId": 1,
    "securityAnswer": "test"
  }
  ```
- **Expected Response**: 200 OK
- **Purpose**: Create unique test user for each virtual user thread

#### TC_03: Login
- **Request**: POST /rest/user/login
- **Body**: `{"email":"{uniqueEmail}","password":"{uniquePassword}"}`
- **Expected Response**: 200 OK, JSON with authentication token
- **Correlation**: Extract JWT token (`authToken`) and basket ID (`basketId`)
- **Timeout**: 1500ms

#### TC_04: Add to Basket (Conditional)
- **Controller**: IfController (only executes if login succeeded)
- **Condition**: `authToken != "TOKEN_NOT_FOUND" && basketId != "0"`
- **Request**: POST /api/BasketItems
- **Headers**: Authorization: Bearer {authToken}
- **Body**: `{"ProductId":${__Random(1,9)},"BasketId":"{basketId}","quantity":1}`
- **Expected Response**: 200 or 201
- **Timeout**: 1500ms
- **Note**: ProductId uses random value 1-9 to avoid duplicate item errors and invalid product IDs

---

## 4. Workload Model

### 4.1 Load Profile

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Virtual Users | 10 | Moderate load for preview environment |
| Ramp-up Period | 30 seconds | Gradual user injection |
| Steady State | 270 seconds | Sustained load for metrics |
| Total Duration | 300 seconds | 5-minute test window |

### 4.2 Pacing Configuration

| Setting | Value |
|---------|-------|
| Target Throughput | 600 requests/minute (10 RPS) |
| Think Time | 1000-3000ms (Uniform Random) |
| Calculation Mode | All active threads |

### 4.3 Load Distribution

```
Users
  ^
10│                    ┌──────────────────────────┐
  │                   /                            \
  │                  /                              \
  │                 /                                \
 0│────────────────┴────────────────────────────────┴────> Time
  0s             30s                              300s

  └── Ramp-up ──┘└────── Steady State ──────────────┘
```

---

## 5. Success Criteria

### 5.1 Performance SLAs

| Metric | Threshold | Priority |
|--------|-----------|----------|
| P95 Response Time | <= 800ms | Critical |
| Error Rate | <= 1% | Critical |
| Throughput | >= 10 RPS | High |
| Avg Response Time | <= 500ms | Medium |

### 5.2 Pass/Fail Criteria

**PASS**: All critical thresholds met
**FAIL**: Any critical threshold exceeded

### 5.3 Metric Collection

| Metric | Collection Method |
|--------|-------------------|
| Response Time | JMeter sampler results |
| Throughput | Aggregate Report |
| Error Rate | Calculated from failures |
| Percentiles | JMeter statistics |

---

## 6. Test Execution

### 6.1 Execution Modes

| Mode | Use Case | Command |
|------|----------|---------|
| GUI | Debugging, development | `jmeter -t test.jmx` |
| Non-GUI | Actual testing, CI/CD | `jmeter -n -t test.jmx` |

### 6.2 Pre-Execution Checklist

- [ ] Target environment accessible
- [ ] Test data files present
- [ ] JMeter version verified
- [ ] Results directory created
- [ ] Previous results cleared

### 6.3 Execution Schedule

| Type | Frequency | Trigger |
|------|-----------|---------|
| Regression | Weekly | Scheduled (Monday 6 AM UTC) |
| On-Demand | As needed | Manual workflow dispatch |
| Pre-Release | Before deployments | Manual trigger |

---

## 7. Reporting

### 7.1 Report Types

| Report | Format | Audience |
|--------|--------|----------|
| HTML Dashboard | Interactive web | Technical team |
| GitHub Summary | Markdown | All stakeholders |
| JTL Raw Data | CSV | Detailed analysis |

### 7.2 Dashboard Metrics

- Response Time Distribution
- Throughput Over Time
- Active Threads Over Time
- Response Codes Summary
- Top 5 Errors by Type

### 7.3 Artifact Retention

| Artifact | Retention Period |
|----------|------------------|
| HTML Dashboard | 30 days |
| JTL Results | 30 days |
| Execution Logs | 30 days |

---

## 8. Risks and Mitigations

### 8.1 Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Rate limiting on preview server | High | Medium | Use conservative thread counts |
| Test account lockout | Medium | Low | Use multiple test accounts |
| Network variability | Medium | Medium | Run multiple iterations |
| JWT token expiration | High | Low | Keep test duration reasonable |
| Preview server unavailability | High | Low | Implement retry logic |

### 8.2 Assumptions

- Preview environment has similar characteristics to production
- Test accounts remain valid throughout testing
- Network latency from GitHub runners is acceptable
- No other load testing is occurring simultaneously

### 8.3 Dependencies

- OWASP Juice Shop preview environment availability
- GitHub Actions runner availability
- JMeter binary availability from Apache archive

---

## 9. Appendix

### 9.1 JMeter Properties

```properties
# Thread Configuration
THREAD_COUNT=10
RAMP_UP=30
DURATION=300

# Timer Configuration
THINK_TIME_MIN=1000
THINK_TIME_MAX=3000
TARGET_THROUGHPUT=600

# Server Configuration
BASE_URL=preview.owasp-juice.shop
PROTOCOL=https
```

### 9.2 API Endpoint Reference

| Endpoint | Method | Auth Required | Notes |
|----------|--------|---------------|-------|
| / | GET | No | Home page |
| /rest/products/search | GET | No | Search with `?q=` parameter |
| /api/Users | POST | No | User registration |
| /rest/user/login | POST | No | Returns JWT token and basket ID |
| /api/BasketItems | POST | Yes (Bearer) | Requires valid ProductId (1-9) |

### 9.3 User Registration Payload

```json
{
  "email": "unique_email@test.local",
  "password": "TestPass123",
  "passwordRepeat": "TestPass123",
  "securityQuestionId": 1,
  "securityAnswer": "test"
}
```

> **Important**: Use `securityQuestionId` (integer) not a nested `securityQuestion` object. The API expects a flat structure.

### 9.3 Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 201 | Created | Continue |
| 401 | Unauthorized | Check token |
| 429 | Rate Limited | Reduce load |
| 500 | Server Error | Log and continue |

---

## 10. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Test Lead | | | |
| QA Manager | | | |
| Technical Lead | | | |
