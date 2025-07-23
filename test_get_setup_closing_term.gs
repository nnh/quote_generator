/**
 * Test pattern for get_setup_closing_term_() function
 * 
 * This file contains comprehensive test scenarios for the get_setup_closing_term_() function
 * to verify that all 5 trial types set correct setup_term and closing_term values,
 * with both research report support conditions ('あり' and 'なし').
 */

/**
 * Test function for get_setup_closing_term_() - All trial types with research report support conditions
 * Tests all 5 trial types with both 'あり' and 'なし' research report support to verify correct setup_term and closing_term values
 */
function testGetSetupClosingTermFunction() {
  console.log('🚀 get_setup_closing_term_() 関数テスト開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 全試験種別×研究結果報告書作成支援の期間設定テスト');
  console.log('🎯 対象: 5つの試験種別 × 2つの研究結果報告書作成支援条件（計10パターン）');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
  // Define test scenarios for all 5 trial types with both research report support conditions
  const testScenarios = [
    // Research report support = 'なし' scenarios
    {
      trialType: '医師主導治験',
      researchReportSupport: 'なし',
      expectedSetup: '6.0',
      expectedClosing: '6.0',
      description: '医師主導治験（長期間）- 研究結果報告書作成支援なし'
    },
    {
      trialType: '特定臨床研究',
      researchReportSupport: 'なし',
      expectedSetup: '6.0',
      expectedClosing: '6.0',
      description: '特定臨床研究（長期間）- 研究結果報告書作成支援なし'
    },
    {
      trialType: '観察研究・レジストリ',
      researchReportSupport: 'なし',
      expectedSetup: '3.0',
      expectedClosing: '3.0',
      description: '観察研究・レジストリ（短期間）- 研究結果報告書作成支援なし'
    },
    {
      trialType: '介入研究（特定臨床研究以外）',
      researchReportSupport: 'なし',
      expectedSetup: '3.0',
      expectedClosing: '3.0',
      description: '介入研究（特定臨床研究以外）（短期間）- 研究結果報告書作成支援なし'
    },
    {
      trialType: '先進',
      researchReportSupport: 'なし',
      expectedSetup: '3.0',
      expectedClosing: '3.0',
      description: '先進（短期間）- 研究結果報告書作成支援なし'
    },
    // Research report support = 'あり' scenarios - closing_term becomes 6 regardless of trial type
    {
      trialType: '医師主導治験',
      researchReportSupport: 'あり',
      expectedSetup: '6.0',
      expectedClosing: '6.0',
      description: '医師主導治験（長期間）- 研究結果報告書作成支援あり'
    },
    {
      trialType: '特定臨床研究',
      researchReportSupport: 'あり',
      expectedSetup: '6.0',
      expectedClosing: '6.0',
      description: '特定臨床研究（長期間）- 研究結果報告書作成支援あり'
    },
    {
      trialType: '観察研究・レジストリ',
      researchReportSupport: 'あり',
      expectedSetup: '3.0',
      expectedClosing: '6.0',
      description: '観察研究・レジストリ（短期間）- 研究結果報告書作成支援あり'
    },
    {
      trialType: '介入研究（特定臨床研究以外）',
      researchReportSupport: 'あり',
      expectedSetup: '3.0',
      expectedClosing: '6.0',
      description: '介入研究（特定臨床研究以外）（短期間）- 研究結果報告書作成支援あり'
    },
    {
      trialType: '先進',
      researchReportSupport: 'あり',
      expectedSetup: '3.0',
      expectedClosing: '6.0',
      description: '先進（短期間）- 研究結果報告書作成支援あり'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n--- テスト ${i + 1}/${totalTests}: ${scenario.description} ---`);
    
    if (runSingleTrialTypeTest_(scenario)) {
      passedTests++;
    }
  }
  
  // Summary
  console.log('\n==================================================');
  console.log(`📊 テスト結果サマリー: ${passedTests}/${totalTests} 成功`);
  
  if (passedTests === totalTests) {
    console.log('✅ 全テスト成功: すべての試験種別で正しい期間が設定されました');
  } else {
    console.log(`❌ ${totalTests - passedTests}個のテストが失敗しました`);
  }
  
  console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
  return passedTests === totalTests;
}


/**
 * Run a single trial type test scenario
 * @param {Object} scenario - Test scenario with trialType, expectedSetup, expectedClosing, description
 * @return {boolean} - True if test passed, false otherwise
 */
function runSingleTrialTypeTest_(scenario) {
  try {
    // Clear existing properties
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.log('❌ ConfigCacheの初期化に失敗');
      return false;
    }
    
    cache.scriptProperties.deleteProperty('setup_term');
    cache.scriptProperties.deleteProperty('closing_term');
    console.log('📝 既存のプロパティをクリア');
    
    // Create mock quotation request data
    const mockData = createMockQuotationRequestDataTestGetSetupClosingTerm_(scenario.trialType, scenario.researchReportSupport);
    console.log(`📝 モックデータ作成完了: ${scenario.trialType}, 研究結果報告書作成支援: ${scenario.researchReportSupport}`);
    
    // Execute the function
    console.log('🔄 get_setup_closing_term_() 実行中...');
    get_setup_closing_term_(scenario.trialType, mockData);
    
    // Verify results
    const actualSetup = cache.scriptProperties.getProperty('setup_term');
    const actualClosing = cache.scriptProperties.getProperty('closing_term');
    
    console.log('📊 実行結果:');
    console.log(`  試験種別: ${scenario.trialType}`);
    console.log(`  研究結果報告書作成支援: ${scenario.researchReportSupport}`);
    console.log(`  setup_term: ${actualSetup} (期待値: ${scenario.expectedSetup})`);
    console.log(`  closing_term: ${actualClosing} (期待値: ${scenario.expectedClosing})`);
    
    // Validate results
    if (actualSetup === scenario.expectedSetup && actualClosing === scenario.expectedClosing) {
      console.log(`✅ テスト成功: ${scenario.trialType}`);
      return true;
    } else {
      console.log(`❌ テスト失敗: ${scenario.trialType}`);
      console.log(`  期待値: setup_term=${scenario.expectedSetup}, closing_term=${scenario.expectedClosing}`);
      console.log(`  実際値: setup_term=${actualSetup}, closing_term=${actualClosing}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ テスト実行中にエラーが発生: ${error.message}`);
    return false;
  }
}

/**
 * Create mock quotation request data for testing
 * Creates a 2D array structure matching A1:AQ2 getValues() format (2 rows, 43 columns)
 * @param {string} trialType - Trial type value
 * @param {string} researchReportSupport - Research report support value ('あり' or 'なし')
 * @return {Array} - 2D array matching A1:AQ2 structure
 */
function createMockQuotationRequestDataTestGetSetupClosingTerm_(trialType, researchReportSupport = 'なし') {
  if (trialType === null || trialType === undefined) {
    return null;
  }
  
  // Create 2D array structure matching A1:AQ2 range (2 rows, 43 columns A-AQ)
  const mockData = [];
  
  // Row 1 (index 0) - Headers row
  const row1 = new Array(43).fill('');
  // Set header names at appropriate positions using correct column indices
  row1[6] = "試験種別"; // Column G (index 6)
  row1[12] = "研究結果報告書作成支援"; // Column M (index 12)
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row containing values
  const row2 = new Array(43).fill('');
  row2[6] = trialType; // Trial type at column G (index 6)
  row2[12] = researchReportSupport; // Research report support at column M (index 12)
  mockData.push(row2);
  
  return mockData;
}
