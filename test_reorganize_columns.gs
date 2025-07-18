/**
 * Test patterns for reorganize_columns.gs error handling
 * テスト用のパターンとヘルパー関数
 */

/**
 * Test helper class for reorganize_columns.gs functions
 */
class TestReorganizeColumns {
  constructor() {
    this.testResults = [];
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    this.capturedErrors = [];
    this.capturedWarnings = [];
  }

  /**
   * Start capturing console output for testing
   */
  startCapturingConsole() {
    this.capturedErrors = [];
    this.capturedWarnings = [];
    
    console.error = (...args) => {
      this.capturedErrors.push(args.join(' '));
      this.originalConsoleError(...args);
    };
    
    console.warn = (...args) => {
      this.capturedWarnings.push(args.join(' '));
      this.originalConsoleWarn(...args);
    };
  }

  /**
   * Stop capturing console output and restore original functions
   */
  stopCapturingConsole() {
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
  }

  /**
   * Add test result
   */
  addResult(testName, passed, message = '') {
    this.testResults.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date()
    });
  }

  /**
   * Get test summary
   */
  getSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    
    return {
      total: total,
      passed: passed,
      failed: failed,
      results: this.testResults
    };
  }

  /**
   * Test Add_del_columns class with null sheet
   */
  testAddDelColumnsWithNullSheet() {
    this.startCapturingConsole();
    
    try {
      const addDel = new Add_del_columns(null);
      const result = addDel.get_setup_closing_range();
      
      const hasError = this.capturedErrors.some(err => err.includes('Sheet is not defined'));
      this.addResult('Add_del_columns with null sheet', hasError && result === null, 
                    'Should log error and return null for null sheet');
    } catch (error) {
      this.addResult('Add_del_columns with null sheet', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test add_target setter with invalid input
   */
  testAddTargetSetterValidation() {
    this.startCapturingConsole();
    
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const addDel = new Add_del_columns(sheet);
      
      // Test with null input
      addDel.add_target = null;
      const hasNullError = this.capturedErrors.some(err => err.includes('Invalid target_array provided'));
      
      // Test with invalid array
      addDel.add_target = ['test'];
      const hasInvalidArrayError = this.capturedErrors.some(err => err.includes('Invalid target_array provided'));
      
      // Test with invalid data types
      addDel.add_target = ['test', 'test', 'not_a_number'];
      const hasInvalidTypeError = this.capturedErrors.some(err => err.includes('Invalid target_head or target_columns_count'));
      
      this.addResult('add_target setter validation', 
                    hasNullError && hasInvalidArrayError && hasInvalidTypeError,
                    'Should validate input and log appropriate errors');
    } catch (error) {
      this.addResult('add_target setter validation', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test show_hidden_cols with invalid inputs
   */
  testShowHiddenColsErrorHandling() {
    this.startCapturingConsole();
    
    try {
      // Test with null sheet
      show_hidden_cols(null);
      const hasNullSheetError = this.capturedErrors.some(err => err.includes('Target sheet is not provided'));
      
      this.addResult('show_hidden_cols error handling', hasNullSheetError,
                    'Should handle null sheet gracefully');
    } catch (error) {
      this.addResult('show_hidden_cols error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test get_years_target_col with invalid inputs
   */
  testGetYearsTargetColErrorHandling() {
    this.startCapturingConsole();
    
    try {
      // Test with null sheet
      const result1 = get_years_target_col(null, '合計');
      const hasNullSheetError = this.capturedErrors.some(err => err.includes('Sheet is not provided'));
      
      // Test with null target string
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const result2 = get_years_target_col(sheet, null);
      const hasNullTargetError = this.capturedErrors.some(err => err.includes('Target string is not provided'));
      
      this.addResult('get_years_target_col error handling', 
                    hasNullSheetError && hasNullTargetError && result1 === null && result2 === null,
                    'Should handle null inputs and return null');
    } catch (error) {
      this.addResult('get_years_target_col error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test get_goukei_row with invalid inputs
   */
  testGetGoukeiRowErrorHandling() {
    this.startCapturingConsole();
    
    try {
      // Test with null sheet
      const result = get_goukei_row(null);
      const hasNullSheetError = this.capturedErrors.some(err => err.includes('Sheet is not provided'));
      
      this.addResult('get_goukei_row error handling', 
                    hasNullSheetError && result === null,
                    'Should handle null sheet and return null');
    } catch (error) {
      this.addResult('get_goukei_row error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test extract_target_sheet error handling
   */
  testExtractTargetSheetErrorHandling() {
    this.startCapturingConsole();
    
    try {
      // This will test the function's ability to handle missing properties
      const result = extract_target_sheet();
      
      // Check if function returns empty array when properties are missing
      const isArray = Array.isArray(result);
      
      this.addResult('extract_target_sheet error handling', isArray,
                    'Should return array even when properties are missing');
    } catch (error) {
      this.addResult('extract_target_sheet error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Test recursive function loop prevention
   */
  testRecursiveLoopPrevention() {
    this.startCapturingConsole();
    
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const addDel = new Add_del_columns(sheet);
      
      // Test that remove_col doesn't infinite loop
      // This is hard to test directly, but we can at least verify it completes
      const startTime = new Date().getTime();
      addDel.remove_col();
      const endTime = new Date().getTime();
      const executionTime = endTime - startTime;
      
      // If it takes more than 10 seconds, it might be in an infinite loop
      const completedInReasonableTime = executionTime < 10000;
      
      this.addResult('recursive loop prevention', completedInReasonableTime,
                    `remove_col completed in ${executionTime}ms`);
    } catch (error) {
      this.addResult('recursive loop prevention', false, 
                    `Unexpected exception: ${error.toString()}`);
    } finally {
      this.stopCapturingConsole();
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('Starting reorganize_columns.gs error handling tests...');
    
    this.testAddDelColumnsWithNullSheet();
    this.testAddTargetSetterValidation();
    this.testShowHiddenColsErrorHandling();
    this.testGetYearsTargetColErrorHandling();
    this.testGetGoukeiRowErrorHandling();
    this.testExtractTargetSheetErrorHandling();
    this.testRecursiveLoopPrevention();
    
    const summary = this.getSummary();
    console.log(`Tests completed: ${summary.passed}/${summary.total} passed`);
    
    if (summary.failed > 0) {
      console.log('Failed tests:');
      summary.results.filter(r => !r.passed).forEach(r => {
        console.log(`- ${r.name}: ${r.message}`);
      });
    }
    
    return summary;
  }
}

/**
 * Main test function to run all reorganize_columns tests
 */
function testReorganizeColumnsErrorHandling() {
  const tester = new TestReorganizeColumns();
  return tester.runAllTests();
}

/**
 * Test specific scenarios for column operations
 */
function testColumnOperationScenarios() {
  console.log('Testing column operation scenarios...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const addDel = new Add_del_columns(sheet);
    
    // Test normal operation
    console.log('Testing normal init_cols operation...');
    addDel.init_cols();
    console.log('init_cols completed successfully');
    
    // Test with valid target array
    console.log('Testing valid add_target assignment...');
    addDel.add_target = ['Test Header', 'Test Value', 3];
    console.log('add_target assignment completed successfully');
    
    return true;
  } catch (error) {
    console.error('Column operation test failed:', error.toString());
    return false;
  }
}

/**
 * Test the complete workflow
 */
function testCompleteWorkflow() {
  console.log('Testing complete reorganize_columns workflow...');
  
  try {
    // Test the main function with error handling
    total2_3_add_del_cols();
    console.log('Complete workflow test completed');
    return true;
  } catch (error) {
    console.error('Complete workflow test failed:', error.toString());
    return false;
  }
}
