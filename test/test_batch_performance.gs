/**
 * Performance test for batch column operations
 */
function testBatchPerformanceImprovement() {
  console.log('Testing batch processing performance...');
  
  try {
    // Test with a sheet that has multiple duplicate columns
    const testSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('BatchTest');
    
    // Setup test data with duplicates
    const headers = ['A', 'B', 'B', 'B', 'C', 'C', 'D', '', '', 'E'];
    testSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add some data rows for more realistic testing
    for (let row = 2; row <= 10; row++) {
      const rowData = headers.map((_, col) => `Data${row}-${col + 1}`);
      testSheet.getRange(row, 1, 1, headers.length).setValues([rowData]);
    }
    
    const startTime = new Date().getTime();
    
    // Test the optimized batch operations
    const cache = new ConfigCache();
    const addDel = new Add_del_columns(testSheet, cache);
    
    // Test batch removal of duplicate columns
    addDel.remove_col();
    
    // Test batch removal of empty columns
    addDel.remove_cols_without_header();
    
    const endTime = new Date().getTime();
    console.log(`Batch operations completed in ${endTime - startTime}ms`);
    
    // Verify the results
    const finalHeaders = testSheet.getRange(1, 1, 1, testSheet.getLastColumn()).getValues()[0];
    console.log('Final headers after batch operations:', finalHeaders);
    
    // Cleanup
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(testSheet);
    
    console.log('✅ Batch performance test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Batch performance test failed:', error.toString());
    return false;
  }
}

/**
 * Test batch column addition performance
 */
function testBatchColumnAddition() {
  console.log('Testing batch column addition performance...');
  
  try {
    const testSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('BatchAddTest');
    
    // Setup test data
    const headers = ['Setup', 'Year1', 'Closing'];
    testSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add some data
    for (let row = 2; row <= 5; row++) {
      const rowData = headers.map((_, col) => `Data${row}-${col + 1}`);
      testSheet.getRange(row, 1, 1, headers.length).setValues([rowData]);
    }
    
    const startTime = new Date().getTime();
    
    // Test batch column addition
    const cache = new ConfigCache();
    const addDel = new Add_del_columns(testSheet, cache);
    addDel.add_target = ['Year1', 'Test', 5];
    addDel.add_cols();
    
    const endTime = new Date().getTime();
    console.log(`Batch column addition completed in ${endTime - startTime}ms`);
    
    // Verify the results
    const finalHeaders = testSheet.getRange(1, 1, 1, testSheet.getLastColumn()).getValues()[0];
    console.log('Final headers after batch addition:', finalHeaders);
    
    // Cleanup
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(testSheet);
    
    console.log('✅ Batch column addition test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Batch column addition test failed:', error.toString());
    return false;
  }
}

/**
 * Run all batch performance tests
 */
function runAllBatchPerformanceTests() {
  console.log('🧪 Starting batch performance test suite...');
  
  const results = [];
  results.push(testBatchPerformanceImprovement());
  results.push(testBatchColumnAddition());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`📊 Batch performance tests completed: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ All batch performance tests passed!');
  } else {
    console.log('❌ Some batch performance tests failed');
  }
  
  return passed === total;
}
