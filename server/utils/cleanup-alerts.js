import db from '../config/database.js';

/**
 * Cleanup utility to remove invalid alerts from the database
 * This addresses the issue where documents with far-future dates (like 2027) 
 * were incorrectly marked as expired due to data validation issues
 */
export const cleanupInvalidAlerts = async () => {
  try {
    console.log('Starting invalid alerts cleanup...');
    
    // Get all alerts with their associated document information
    const [allAlerts] = await db.execute(`
      SELECT 
        a.id as alert_id,
        a.document_id,
        a.driver_document_id,
        a.alert_type,
        a.alert_date,
        COALESCE(d.expiry_date, dd.expiry_date) as expiry_date
      FROM alerts a
      LEFT JOIN documents d ON a.document_id = d.id
      LEFT JOIN driver_documents dd ON a.driver_document_id = dd.id
      WHERE a.is_sent = FALSE
    `);
    
    let cleanedCount = 0;
    
    for (const alert of allAlerts) {
      let expiryDate;
      
      // Parse the expiry date
      if (typeof alert.expiry_date === 'string' && alert.expiry_date.includes('/')) {
        const parts = alert.expiry_date.split('/');
        expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
      } else if (alert.expiry_date) {
        expiryDate = new Date(alert.expiry_date);
      }
      
      // Check if expiry date is valid
      if (!expiryDate || isNaN(expiryDate.getTime())) {
        // Invalid date, remove the alert
        await db.execute('DELETE FROM alerts WHERE id = ?', [alert.alert_id]);
        console.log(`Removed alert ${alert.alert_id} - invalid expiry date: ${alert.expiry_date}`);
        cleanedCount++;
        continue;
      }
      
      // Check if expiry date is too far in the future (> 50 years)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(today.getFullYear() + 50);
      
      if (expiryDate > maxFutureDate) {
        // Date too far in the future, likely invalid data
        await db.execute('DELETE FROM alerts WHERE id = ?', [alert.alert_id]);
        console.log(`Removed alert ${alert.alert_id} - expiry date too far in future: ${alert.expiry_date}`);
        cleanedCount++;
        continue;
      }
      
      // Check if expiry date is too far in the past (< 1970)
      const minValidDate = new Date();
      minValidDate.setFullYear(1970);
      
      if (expiryDate < minValidDate) {
        // Date too far in the past, likely invalid data
        await db.execute('DELETE FROM alerts WHERE id = ?', [alert.alert_id]);
        console.log(`Removed alert ${alert.alert_id} - expiry date too far in past: ${alert.expiry_date}`);
        cleanedCount++;
        continue;
      }
      
      // Calculate days until expiry to validate alert type
      const diffTime = expiryDate.getTime() - today.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Validate if the alert type makes sense for the days until expiry
      let isValidAlert = false;
      
      switch (alert.alert_type) {
        case 'expired':
          isValidAlert = daysUntilExpiry <= 0;
          break;
        case '3_days':
          isValidAlert = daysUntilExpiry > 0 && daysUntilExpiry <= 3;
          break;
        case '7_days':
          isValidAlert = daysUntilExpiry > 3 && daysUntilExpiry <= 7;
          break;
        case '15_days':
          isValidAlert = daysUntilExpiry > 7 && daysUntilExpiry <= 15;
          break;
        case '30_days':
          isValidAlert = daysUntilExpiry > 15 && daysUntilExpiry <= 30;
          break;
        default:
          isValidAlert = false;
      }
      
      if (!isValidAlert) {
        // Alert type doesn't match the actual days until expiry
        await db.execute('DELETE FROM alerts WHERE id = ?', [alert.alert_id]);
        console.log(`Removed alert ${alert.alert_id} - invalid alert type '${alert.alert_type}' for ${daysUntilExpiry} days until expiry`);
        cleanedCount++;
      }
    }
    
    console.log(`Cleanup completed. Removed ${cleanedCount} invalid alerts.`);
    return cleanedCount;
  } catch (error) {
    console.error('Error during alerts cleanup:', error);
    throw error;
  }
};

// For standalone execution
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupInvalidAlerts()
    .then(() => {
      console.log('Cleanup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup script failed:', error);
      process.exit(1);
    });
}