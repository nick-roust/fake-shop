# Configuration Guide

## Purpose

Describe planned fake-shop configuration documentation.

## Status

Active foundation.

## Description

This guide explains current public configuration for local development.

## Environment Variables

The project is designed to run locally with minimal configuration.

Supported local variables:

```text
FAKE_SHOP_MODE=mock
FAKE_SHOP_PUBLIC_URL=http://localhost:3000
FAKE_SHOP_SMOKE_BASE_URL=http://127.0.0.1:3000
```

The application defaults to mock mode for local demo usage.

## Mock Mode

Mock mode is the default local checkout mode. It works without external infrastructure and supports
success, failure, and cancellation scenarios for developer inspection.

## External Mode

External mode is optional. It prepares the adapter boundary for future external API experiments
without storing credentials, requiring secrets, or calling external services by default.
