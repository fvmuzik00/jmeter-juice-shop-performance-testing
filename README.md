# OWASP Juice Shop Performance Testing Framework

[![JMeter](https://img.shields.io/badge/JMeter-5.6.3-orange)](https://jmeter.apache.org/)
[![Java](https://img.shields.io/badge/Java-17-red)](https://openjdk.org/)

Performance testing framework for OWASP Juice Shop using Apache JMeter + GitHub Actions.

## Test Coverage

| Test Type | Purpose | Users | Duration |
|-----------|---------|-------|----------|
| **Load** | Normal conditions | 10 | 5 min |
| **Stress** | Breaking point | 50 | 5 min |
| **Spike** | Traffic surges | 5-30-5 | 2.5 min |
| **Endurance** | Memory leaks | 5 | 1 hour |

## Quick Start

```bash
git clone https://github.com/Trittton/jmeter-juice-shop-performance-testing.git
jmeter -n -t ./tests/juice_shop_load.jmx -l ./results/log.jtl
```

## Success Criteria

| Metric | Target |
|--------|--------|
| P95 Response Time | ≤ 800ms |
| Error Rate | ≤ 1% |
| Throughput | ≥ 10 RPS |
