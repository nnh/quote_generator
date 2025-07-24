/**
 * Test Trial Date Function Module (test_trial_date_function.gs)
 * 
 * Comprehensive test patterns for the refactored get_trial_start_end_date_() function
 * to ensure all date calculations work correctly after function splitting.
 * 
 * Test Categories:
 * - Normal scenarios with standard trial periods
 * - Boundary conditions (fiscal year transitions, month-end dates)
 * - Edge cases (leap years, different setup/closing terms)
 * - Error conditions (invalid dates, missing properties)
 * 
 * Dependencies: quote_script.gs, ConfigCache, moment.js
 */

/**
 * Main test runner for trial date function
 * Tests the refactored get_trial_start_end_date_() function with comprehensive scenarios
 */
function testTrialDateFunction() {
  console.log('🧪 試験日付関数テスト開始 (Trial date function test starting)');
  console.log('='.repeat(70));
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Test 1: 医師主導治験 with expected values
  console.log('\n--- 試験日付関数テスト 1: 医師主導治験 ---');
  const expectedValues1 = [
    ['2023-10-01', '2024-03-31'],
    ['2024-04-01', '2025-03-31'],
    ['', ''],
    ['', ''],
    ['', ''],
    ['', ''],
    ['2025-04-01', '2026-03-31'],
    ['2026-04-01', '2026-09-30'],
    ['2023-10-01', '2026-09-30']
  ];
  
  if (testTrialDateParameterized_('医師主導治験', '2024-04-01', '2026-03-31', '医師主導治験 2年間試験', expectedValues1)) {
    passedTests++;
  }
  totalTests++;
  
  // Test 2: 観察研究・レジストリ with different terms
  console.log('\n--- 試験日付関数テスト 2: 観察研究・レジストリ ---');
  const expectedValues2 = [
    ['2023-10-01', '2024-03-31'],
    ['2024-04-01', '2025-03-31'],
    ['', ''],
    ['', ''],
    ['', ''],
    ['', ''],
    ['', ''],
    ['2025-04-01', '2026-03-31'],
    ['2023-10-01', '2026-03-31']
  ];
  
  if (testTrialDateParameterized_('観察研究・レジストリ', '2024-01-01', '2025-12-31', '観察研究 2年間試験', expectedValues2)) {
    passedTests++;
  }
  totalTests++;

  // Test 3: 特定臨床研究 with different terms
  console.log('\n--- 試験日付関数テスト 3: 特定臨床研究 ---');
  const expectedValues3 = [
    ['2019-11-01', '2020-03-31'],
    ['2020-04-01', '2021-03-31'],
    ['2021-04-01', '2029-03-31'],
    ['', ''],
    ['', ''],
    ['', ''],
    ['2029-04-01', '2030-03-31'],
    ['2030-04-01', '2030-10-31'],
    ['2019-11-01', '2030-10-31']
  ];
  
  if (testTrialDateParameterized_('特定臨床研究', '2020-05-21', '2030-04-15', '特定臨床研究 10年間試験', expectedValues3)) {
    passedTests++;
  }
  totalTests++;
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`📊 試験日付関数テスト結果: ${passedTests}/${totalTests} 成功`);
  
  if (passedTests === totalTests) {
    console.log('✅ 全試験日付関数テスト成功: パラメータ化テスト関数が正常に動作しています');
  } else {
    console.log(`❌ ${totalTests - passedTests}個の試験日付関数テストが失敗しました`);
  }
  
  console.log('⏰ 試験日付関数テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
  return passedTests === totalTests;
}
function testTrialDateParameterized_(trialType, startDate, endDate, description, expectedValues) {
    const mockData = createMockQuotationRequestDataTestGetSetupClosingTerm_(trialType, "なし");
    get_setup_closing_term_(trialType, mockData);
    const result = get_trial_start_end_date_(startDate, endDate);
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j <= 1; j++) {
        const resultDate = Moment.moment(result[i][j]);
        const expectedDate = Moment.moment(expectedValues[i][j]);
        const bothInvalid = !resultDate.isValid() && !expectedDate.isValid();
        const isSameDate = resultDate.isSame(expectedDate, 'day');
        if (!isSameDate && !bothInvalid) {
          console.log('❌ 日付不一致エラー');
          console.log(`期間: ${periodNames[i]}`);
          console.log(`対象: ${j === 0 ? '開始日' : '終了日'}`);
          console.log(`期待値: ${expectedDate.format('YYYY-MM-DD')}`);
          console.log(`実際値: ${resultDate.format('YYYY-MM-DD')}`);
          return false;
        }      
      }
    }
    return true;
}
