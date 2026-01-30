# Document Expiration Alerts Fix Documentation

## Problem Description
The system was incorrectly displaying alerts for documents with far-future expiration dates (like 2027) as expired or about to expire. This caused confusion and unnecessary alerts for documents that were actually valid for many years.

## Root Cause Analysis
1. **Date Validation Issues**: The system didn't properly validate whether expiration dates were realistic
2. **No Upper Bound Limits**: Documents with dates too far in the future (> 50 years) were processed as if they were near expiration
3. **Lack of Data Sanitization**: Invalid dates weren't filtered out before alert generation
4. **Accumulation of Invalid Alerts**: Old incorrect alerts remained in the system without cleanup

## Solution Implemented

### Backend Changes (`/server/routes/alerts.js`)
1. **Added Date Validation**:
   - Check for valid date formats and values
   - Reject dates too far in the future (> 50 years from now)
   - Reject dates too far in the past (< 1970)
   - Properly handle both DD/MM/YYYY and YYYY-MM-DD formats

2. **Improved Alert Logic**:
   - Only generate alerts for documents within the valid range (0-30 days before/after expiration)
   - Prevent creation of alerts for documents with unrealistic expiration dates

### Utility Functions (`/server/utils/cleanup-alerts.js`)
1. **Created Cleanup Utility**:
   - Identifies and removes existing invalid alerts from the database
   - Validates alert types against actual days until expiration
   - Removes alerts with invalid or unrealistic dates

### Server Enhancements (`/server/index.js`)
1. **Added Daily Cleanup Job**:
   - Runs daily at 2:00 AM to clean up invalid alerts
   - Prevents accumulation of incorrect alerts over time

### Frontend Compatibility (`/src/components/AlertsPanel.tsx`)
1. **Maintained Compatibility**:
   - No changes needed as the frontend correctly displayed alerts
   - Backend fixes ensure only valid alerts reach the frontend

## Key Features of the Fix

### Input Validation
```javascript
// Check if expiry date is valid
if (!expiryDate || isNaN(expiryDate.getTime())) {
  // Invalid date, remove the alert
}

// Check if expiry date is too far in the future (> 50 years)
const maxFutureDate = new Date();
maxFutureDate.setFullYear(today.getFullYear() + 50);
if (expiryDate > maxFutureDate) {
  // Date too far in the future, likely invalid data
}
```

### Alert Type Validation
```javascript
// Validate if the alert type makes sense for the days until expiry
switch (alert.alert_type) {
  case 'expired':
    isValidAlert = daysUntilExpiry <= 0;
    break;
  case '3_days':
    isValidAlert = daysUntilExpiry > 0 && daysUntilExpiry <= 3;
    break;
  // etc...
}
```

## Usage Instructions

### To Run Cleanup Manually
```bash
node run-alerts-cleanup.js
```

### Automatic Cleanup
The system will automatically clean up invalid alerts daily at 2:00 AM server time.

## Benefits
1. **Eliminated False Positives**: Documents with far-future dates no longer show as expired
2. **Improved Data Quality**: Only valid, relevant alerts are displayed
3. **Automatic Maintenance**: System maintains itself through daily cleanup jobs
4. **Better User Experience**: Users see only actionable alerts for documents that are actually expiring soon

## Testing Results
- Documents with expiration dates in 2027 and beyond are no longer marked as expired
- Valid documents expiring within 30 days continue to show appropriate alerts
- Existing invalid alerts are removed from the system
- New alerts are generated only for documents with realistic expiration dates