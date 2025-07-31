# Backend Tests

This folder contains various test scripts for the backend functionality.

## Test Files

### Database Tests

- **`test-mongodb.js`** - Comprehensive MongoDB connection and operation tests
- **`test-mongodb-connection.js`** - Basic MongoDB connection testing
- **`test-mongodb-clean.js`** - Database cleanup and maintenance tests

### API Tests

- **`test-api.js`** - General API endpoint testing
- **`test-notification.js`** - Notification system testing

### Reality Check Tests

- **`test-reality-check.js`** - Basic reality check functionality testing
- **`test-reality-check-scheduler.js`** - Reality check scheduler testing
- **`test-reality-check-fixes.js`** - Reality check bug fixes and improvements testing

### Profile Tests

- **`test-profile-picture.js`** - Profile picture upload and management testing

## Running Tests

To run a specific test:

```bash
# From the backend directory
node tests/test-mongodb.js
node tests/test-api.js
# etc.
```

## Test Categories

### Database Tests

These tests verify MongoDB connectivity, data operations, and database maintenance functions.

### API Tests

These tests check API endpoint functionality, request/response handling, and error scenarios.

### Feature Tests

These tests focus on specific application features like reality checks, notifications, and profile management.

## Notes

- All tests require proper environment variables to be set (MONGODB_URI, etc.)
- Some tests may modify database data - use with caution in production
- Tests are designed to be run individually rather than as a test suite
