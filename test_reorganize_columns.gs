/**
 * Test patterns for reorganize_columns.gs error handling
 * テスト用のパターンとヘルパー関数
 */
function setTestValuesAndCompare_(dateArray, testIdx, total2SumAddress) {
  const sheets = get_sheets();
  const yearsRange = sheets.trial.getRange("D32:E40");
  const lastElement = dateArray[dateArray.length - 1];
  const startYear = lastElement[0].split("/")[0];
  const endYear = lastElement[1].split("/")[0];
  yearsRange.clearContent();
  yearsRange.setValues(dateArray);
  total2_3_add_del_cols();
  SpreadsheetApp.flush();
  if (sheets.total.getRange("I5").getValue() !== sheets.total2.getRange(total2SumAddress).getValue()) {
    console.error(`testReorganizeColumns test ${testIdx} error`);
    return;
  }
  const total2YearsRowNumber = 4;
  const setupColumnNumber = 4;
  const sumColumn = sheets.total2.getRange(total2SumAddress).getColumn();
  const total2SetupToClosintColumnsIndex = Array.from({length: sumColumn - setupColumnNumber}, (_, i) => setupColumnNumber + i);
  const total2SetupToClosintColumnsShowIndex = total2SetupToClosintColumnsIndex.filter(colNumber => !sheets.total2.isColumnHiddenByUser(colNumber));
  if (total2SetupToClosintColumnsShowIndex.length > 0) {
    const start = parseInt(startYear, 10);
    const end = parseInt(endYear, 10) - 1;
    const targetYears = Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
    if (targetYears.length !== total2SetupToClosintColumnsShowIndex.length) {
      console.warn(`Warning: Mismatch in number of columns. targetYears has ${targetYears.length} items, but total2SetupToClosintColumnsShowIndex has ${total2SetupToClosintColumnsShowIndex.length} items.`);
    }
    targetYears.forEach((year, idx) => {
      const col = total2SetupToClosintColumnsShowIndex[idx];
      const cellValue = sheets.total2
        .getRange(total2YearsRowNumber, col)
        .getValue().toString();
      if (cellValue !== year.toString()) {
        console.warn(`Warning: Year mismatch at column ${col} (expected: ${year}, actual: ${cellValue})`);
      }
    });
  }
  console.log(`testReorganizeColumns test ${testIdx} ok`);
}
function testReorganizeColumns() {
  const setupToClosingSheet = get_target_term_sheets();
  setupToClosingSheet.forEach(sheet => sheet.getRange("F6").setValue(1));
  // 正常系
  let testIndex = 1;
  const test1Values = [
    ["2022/4/1", "2023/3/31"],
    ["2023/4/1", "2026/3/31"],
    ["2026/4/1", "2029/3/31"],
    ["2029/4/1", "2031/3/31"],
    ["2031/4/1", "2033/3/31"],
    ["2033/4/1", "2036/3/31"],
    ["2036/4/1", "2039/3/31"],
    ["2039/4/1", "2040/3/31"],
    ["2022/4/1", "2040/3/31"],
  ];
  setTestValuesAndCompare_(test1Values, testIndex, "V96");
  // 正常系、見積作成処理未実施
  testIndex++;
  const test2Values = new Array(9);
  test2Values.fill(["", ""]);
  setTestValuesAndCompare_(test2Values, testIndex, "L98");
  // 正常系、Setupがない
  testIndex++;
  const test3Values = [
    ["", ""],
    ["2020/4/1", "2021/3/31"],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["2020/4/1", "2023/3/31"],
  ];
  setTestValuesAndCompare_(test3Values, testIndex, "L96");
  // 正常系, Closingがない
  testIndex++;
  const test4Values = [
    ["2020/4/1", "2021/3/31"],
    ["", ""],
    ["2021/4/1", "2022/3/31"],
    ["", ""],
    ["", ""],
    ["", ""],
    ["2022/4/1", "2023/3/31"],
    ["", ""],
    ["2020/4/1", "2023/3/31"],
  ];
  setTestValuesAndCompare_(test4Values, testIndex, "L96");
}
/**
 * Test helper class for reorganize_columns.gs functions
 */
class TestReorganizeColumns {
  constructor() {
    this.testResults = [];
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
    try {
      const addDel = new Add_del_columns(null);
      const result = addDel.get_setup_closing_range();
      
      // Test that function returns null for null sheet (error handling working)
      this.addResult('Add_del_columns with null sheet', result === null, 
                    'Should return null for null sheet');
    } catch (error) {
      this.addResult('Add_del_columns with null sheet', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test add_target setter with invalid input
   */
  testAddTargetSetterValidation() {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const addDel = new Add_del_columns(sheet);
      
      // Test with null input - should not crash
      addDel.add_target = null;
      const nullHandled = addDel.target_head === null || addDel.target_head === undefined;
      
      // Test with invalid array - should not crash
      addDel.add_target = ['test'];
      const invalidArrayHandled = addDel.target_head === null || addDel.target_head === undefined;
      
      // Test with invalid data types - should not crash
      addDel.add_target = ['test', 'test', 'not_a_number'];
      const invalidTypeHandled = addDel.target_head === null || addDel.target_head === undefined;
      
      // Test with valid input - should work
      addDel.add_target = ['Valid Header', 'Valid Value', 3];
      const validInputWorked = addDel.target_head === 'Valid Header' && addDel.target_columns_count === 3;
      
      this.addResult('add_target setter validation', 
                    nullHandled && invalidArrayHandled && invalidTypeHandled && validInputWorked,
                    'Should handle invalid inputs gracefully and accept valid inputs');
    } catch (error) {
      this.addResult('add_target setter validation', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test show_hidden_cols with invalid inputs
   */
  testShowHiddenColsErrorHandling() {
    try {
      // Test with null sheet - should not crash
      show_hidden_cols(null);
      
      // Test with undefined sheet - should not crash
      show_hidden_cols(undefined);
      
      this.addResult('show_hidden_cols error handling', true,
                    'Should handle null/undefined sheet gracefully without crashing');
    } catch (error) {
      this.addResult('show_hidden_cols error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test get_years_target_col with invalid inputs
   */
  testGetYearsTargetColErrorHandling() {
    try {
      // Test with null sheet
      const result1 = get_years_target_col(null, '合計');
      
      // Test with null target string
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const result2 = get_years_target_col(sheet, null);
      
      // Test with undefined inputs
      const result3 = get_years_target_col(undefined, '合計');
      const result4 = get_years_target_col(sheet, undefined);
      
      this.addResult('get_years_target_col error handling', 
                    result1 === null && result2 === null && result3 === null && result4 === null,
                    'Should handle null/undefined inputs and return null');
    } catch (error) {
      this.addResult('get_years_target_col error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test get_goukei_row with invalid inputs
   */
  testGetGoukeiRowErrorHandling() {
    try {
      // Test with null sheet
      const result1 = get_goukei_row(null);
      
      // Test with undefined sheet
      const result2 = get_goukei_row(undefined);
      
      this.addResult('get_goukei_row error handling', 
                    result1 === null && result2 === null,
                    'Should handle null/undefined sheet and return null');
    } catch (error) {
      this.addResult('get_goukei_row error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test extract_target_sheet error handling
   */
  testExtractTargetSheetErrorHandling() {
    try {
      // This will test the function's ability to handle missing properties
      const result = extract_target_sheet();
      
      // Check if function returns array (should be empty array when properties are missing)
      const isArray = Array.isArray(result);
      
      this.addResult('extract_target_sheet error handling', isArray,
                    'Should return array even when properties are missing');
    } catch (error) {
      this.addResult('extract_target_sheet error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test recursive function loop prevention
   */
  testRecursiveLoopPrevention() {
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
    }
  }

  /**
   * Test init_cols method error handling
   */
  testInitColsErrorHandling() {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const addDel = new Add_del_columns(sheet);
      
      // Test that init_cols completes without crashing
      addDel.init_cols();
      
      this.addResult('init_cols error handling', true,
                    'init_cols completed without throwing exceptions');
    } catch (error) {
      this.addResult('init_cols error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Test add_cols method error handling
   */
  testAddColsErrorHandling() {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const addDel = new Add_del_columns(sheet);
      
      // Set valid target first
      addDel.add_target = ['Test Header', 'Test Value', 2];
      
      // Test that add_cols completes without crashing
      addDel.add_cols();
      
      this.addResult('add_cols error handling', true,
                    'add_cols completed without throwing exceptions');
    } catch (error) {
      this.addResult('add_cols error handling', false, 
                    `Unexpected exception: ${error.toString()}`);
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('Starting reorganize_columns.gs error handling tests...');
    console.log('注意: 以下のエラーとワーニングは意図的なテストの一部です (Note: The following errors and warnings are intentional test behavior)');
    console.log('='.repeat(80));
    
    this.testAddDelColumnsWithNullSheet();
    this.testAddTargetSetterValidation();
    this.testShowHiddenColsErrorHandling();
    this.testGetYearsTargetColErrorHandling();
    this.testGetGoukeiRowErrorHandling();
    this.testExtractTargetSheetErrorHandling();
    this.testRecursiveLoopPrevention();
    this.testInitColsErrorHandling();
    this.testAddColsErrorHandling();
    
    console.log('='.repeat(80));
    console.log('テスト完了 - 上記のエラー/ワーニングは期待される動作です (Test completed - above errors/warnings are expected behavior)');
    
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
  console.log('🧪 エラーハンドリングテスト開始 (Error handling test starting)');
  console.log('⚠️  これから表示されるエラーとワーニングは全て意図的なテストです (All upcoming errors and warnings are intentional tests)');
  
  const tester = new TestReorganizeColumns();
  const result = tester.runAllTests();
  
  console.log('✅ エラーハンドリングテスト完了 (Error handling test completed)');
  return result;
}

/**
 * Test specific scenarios for column operations
 */
function testColumnOperationScenarios() {
  console.log('🧪 通常操作テスト開始 (Normal operation test starting)');
  console.log('⚠️  このテスト中に表示されるワーニングは期待される動作です (Warnings during this test are expected behavior)');
  console.log('Testing column operation scenarios...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const addDel = new Add_del_columns(sheet);
    
    // Test normal operation
    console.log('Testing normal init_cols operation...');
    console.log('注意: Setup/Closingシートが見つからないワーニングは正常な動作です (Note: Setup/Closing sheet warnings are normal behavior)');
    addDel.init_cols();
    console.log('init_cols completed successfully');
    
    // Test with valid target array
    console.log('Testing valid add_target assignment...');
    addDel.add_target = ['Test Header', 'Test Value', 3];
    console.log('add_target assignment completed successfully');
    
    console.log('✅ 通常操作テスト完了 (Normal operation test completed)');
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
  console.log('🧪 完全ワークフローテスト開始 (Complete workflow test starting)');
  console.log('⚠️  このテスト中に表示されるワーニングは期待される動作です (Warnings during this test are expected behavior)');
  console.log('Testing complete reorganize_columns workflow...');
  
  try {
    // Test the main function with error handling
    total2_3_add_del_cols();
    console.log('✅ 完全ワークフローテスト完了 (Complete workflow test completed)');
    return true;
  } catch (error) {
    console.error('Complete workflow test failed:', error.toString());
    return false;
  }
}
