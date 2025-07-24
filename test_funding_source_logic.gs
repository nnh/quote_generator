/**
 * Test patterns for funding source (原資) logic
 * 
 * This file contains test scenarios to verify the funding source logic
 * that affects coefficient calculations and clinical trials office flags.
 * Column AN contains either "営利企業原資（製薬企業等）" or "公的資金（税金由来）".
 */

/**
 * Test function for funding source logic
 * Tests coefficient calculations and clinical trials office flags based on funding source
 */
function testFundingSourceLogic() {
  console.log('🚀 原資ロジックテスト開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 原資による係数計算と事務局運営フラグ検証');
  console.log('🎯 対象: 営利企業原資 vs 公的資金の動作確認');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
  // Define test scenarios for both funding sources
  const testScenarios = [
    {
      fundingSource: '営利企業原資（製薬企業等）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT, // 1.5
      expectedClinicalTrialsOfficeFlag: true,
      description: '営利企業原資 → 係数1.5、事務局運営フラグON'
    },
    {
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.DEFAULT_COEFFICIENT, // 1
      expectedClinicalTrialsOfficeFlag: false,
      description: '公的資金 → 係数1.0、事務局運営フラグOFF'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n--- テスト ${i + 1}/${totalTests}: ${scenario.description} ---`);
    
    if (runFundingSourceTest_(scenario)) {
      passedTests++;
    }
  }
  
  // Summary
  console.log('\n==================================================');
  console.log(`📊 テスト結果サマリー: ${passedTests}/${totalTests} 成功`);
  
  if (passedTests === totalTests) {
    console.log('✅ 全テスト成功: 原資ロジックが正常に動作しました');
  } else {
    console.log(`❌ ${totalTests - passedTests}個のテストが失敗しました`);
  }
  
  console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
  return passedTests === totalTests;
}

/**
 * Run a single funding source test scenario
 * @param {Object} scenario - Test scenario with funding source and expectations
 * @return {boolean} - True if test passed, false otherwise
 */
function runFundingSourceTest_(scenario) {
  try {
    // Initialize ConfigCache
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.log('❌ ConfigCacheの初期化に失敗');
      return false;
    }
    
    console.log(`📝 テスト条件:`);
    console.log(`  原資: ${scenario.fundingSource}`);
    console.log(`  期待係数: ${scenario.expectedCoefficient}`);
    console.log(`  期待事務局フラグ: ${scenario.expectedClinicalTrialsOfficeFlag}`);
    
    // Create mock quotation request data with funding source
    const mockData = createMockQuotationRequestForFunding_(scenario.fundingSource);
    console.log('📝 モックデータ作成完了');
    
    // Test coefficient calculation logic
    console.log('🔄 係数計算ロジックテスト実行中...');
    const coefficientResult = testCoefficientCalculation_(mockData, scenario);
    
    // Test clinical trials office flag logic
    console.log('🔄 事務局運営フラグロジックテスト実行中...');
    const clinicalTrialsOfficeResult = testClinicalTrialsOfficeFlag_(mockData, scenario);
    
    // Verify both results
    if (coefficientResult && clinicalTrialsOfficeResult) {
      console.log(`✅ テスト成功: ${scenario.description}`);
      return true;
    } else {
      console.log(`❌ テスト失敗: ${scenario.description}`);
      if (!coefficientResult) {
        console.log('  係数計算テストが失敗');
      }
      if (!clinicalTrialsOfficeResult) {
        console.log('  事務局運営フラグテストが失敗');
      }
      return false;
    }
    
  } catch (error) {
    console.log(`❌ テスト実行中にエラーが発生: ${error.message}`);
    console.log(`📍 エラースタック: ${error.stack}`);
    return false;
  }
}

/**
 * Test coefficient calculation logic
 * @param {Array} mockData - Mock quotation request data
 * @param {Object} scenario - Test scenario
 * @return {boolean} - True if test passed, false otherwise
 */
function testCoefficientCalculation_(mockData, scenario) {
  try {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.log('❌ ConfigCache初期化失敗（係数テスト）');
      return false;
    }
    
    // Get the funding source value from mock data
    const fundingSourceValue = get_quotation_request_value(mockData, cache.coefficientQuotationRequest);
    console.log(`  取得した原資値: ${fundingSourceValue}`);
    
    // Calculate coefficient based on the logic in quote_script.gs
    let actualCoefficient;
    if (fundingSourceValue == cache.commercialCompanyCoefficient) {
      actualCoefficient = QuoteScriptConstants.COMMERCIAL_COEFFICIENT;
    } else {
      actualCoefficient = QuoteScriptConstants.DEFAULT_COEFFICIENT;
    }
    
    console.log(`  計算された係数: ${actualCoefficient}`);
    console.log(`  期待される係数: ${scenario.expectedCoefficient}`);
    
    if (actualCoefficient === scenario.expectedCoefficient) {
      console.log('✅ 係数計算テスト成功');
      return true;
    } else {
      console.log('❌ 係数計算テスト失敗');
      console.log(`  期待値: ${scenario.expectedCoefficient}, 実際値: ${actualCoefficient}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 係数計算テスト中にエラー: ${error.message}`);
    return false;
  }
}

/**
 * Test clinical trials office flag logic
 * @param {Array} mockData - Mock quotation request data
 * @param {Object} scenario - Test scenario
 * @return {boolean} - True if test passed, false otherwise
 */
function testClinicalTrialsOfficeFlag_(mockData, scenario) {
  try {
    // Create SetSheetItemValues instance to test the clinical trials office logic
    const setSheetItemValues = new SetSheetItemValues('Registration1', mockData);
    
    // Check the clinical_trials_office_flg property
    const actualFlag = setSheetItemValues.clinical_trials_office_flg;
    
    console.log(`  実際の事務局フラグ: ${actualFlag}`);
    console.log(`  期待される事務局フラグ: ${scenario.expectedClinicalTrialsOfficeFlag}`);
    
    if (actualFlag === scenario.expectedClinicalTrialsOfficeFlag) {
      console.log('✅ 事務局運営フラグテスト成功');
      return true;
    } else {
      console.log('❌ 事務局運営フラグテスト失敗');
      console.log(`  期待値: ${scenario.expectedClinicalTrialsOfficeFlag}, 実際値: ${actualFlag}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 事務局運営フラグテスト中にエラー: ${error.message}`);
    return false;
  }
}

/**
 * Create mock quotation request data for funding source testing
 * @param {string} fundingSource - Funding source value
 * @return {Array} - 2D array matching quotation request structure
 */
function createMockQuotationRequestForFunding_(fundingSource) {
  // Create 2D array structure matching quotation request range
  const mockData = [];
  
  // Row 1 (index 0) - Headers row
  const row1 = new Array(50).fill('');
  row1[39] = "原資"; // Column AN (index 39, since AN is the 40th column)
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row
  const row2 = new Array(50).fill('');
  row2[39] = fundingSource; // Funding source value
  mockData.push(row2);
  
  return mockData;
}

/**
 * Test both funding sources with comprehensive scenarios
 */
function testComprehensiveFundingScenarios() {
  console.log('🚀 包括的原資シナリオテスト開始');
  console.log('==================================================');
  
  const comprehensiveScenarios = [
    {
      fundingSource: '営利企業原資（製薬企業等）',
      trialType: '医師主導治験',
      expectedCoefficient: 1.5,
      expectedClinicalTrialsOfficeFlag: true,
      description: '営利企業原資 + 医師主導治験'
    },
    {
      fundingSource: '公的資金（税金由来）',
      trialType: '医師主導治験',
      expectedCoefficient: 1,
      expectedClinicalTrialsOfficeFlag: false,
      description: '公的資金 + 医師主導治験'
    },
    {
      fundingSource: '営利企業原資（製薬企業等）',
      trialType: '特定臨床研究',
      expectedCoefficient: 1.5,
      expectedClinicalTrialsOfficeFlag: true,
      description: '営利企業原資 + 特定臨床研究'
    },
    {
      fundingSource: '公的資金（税金由来）',
      trialType: '観察研究・レジストリ',
      expectedCoefficient: 1,
      expectedClinicalTrialsOfficeFlag: false,
      description: '公的資金 + 観察研究・レジストリ'
    }
  ];
  
  let passedTests = 0;
  let totalTests = comprehensiveScenarios.length;
  
  for (let i = 0; i < comprehensiveScenarios.length; i++) {
    const scenario = comprehensiveScenarios[i];
    console.log(`\n--- 包括テスト ${i + 1}/${totalTests}: ${scenario.description} ---`);
    
    if (runComprehensiveFundingTest_(scenario)) {
      passedTests++;
    }
  }
  
  console.log('\n==================================================');
  console.log(`📊 包括テスト結果: ${passedTests}/${totalTests} 成功`);
  
  return passedTests === totalTests;
}

/**
 * Run comprehensive funding test with trial type combination
 * @param {Object} scenario - Comprehensive test scenario
 * @return {boolean} - True if test passed, false otherwise
 */
function runComprehensiveFundingTest_(scenario) {
  try {
    // Create mock data with both funding source and trial type
    const mockData = createComprehensiveMockData_(scenario.fundingSource, scenario.trialType);
    
    console.log(`📝 テスト条件:`);
    console.log(`  原資: ${scenario.fundingSource}`);
    console.log(`  試験種別: ${scenario.trialType}`);
    
    // Test coefficient calculation
    const coefficientResult = testCoefficientCalculation_(mockData, scenario);
    
    // Test clinical trials office flag
    const clinicalTrialsOfficeResult = testClinicalTrialsOfficeFlag_(mockData, scenario);
    
    if (coefficientResult && clinicalTrialsOfficeResult) {
      console.log(`✅ 包括テスト成功: ${scenario.description}`);
      return true;
    } else {
      console.log(`❌ 包括テスト失敗: ${scenario.description}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 包括テスト中にエラー: ${error.message}`);
    return false;
  }
}

/**
 * Create comprehensive mock data with funding source and trial type
 * @param {string} fundingSource - Funding source value
 * @param {string} trialType - Trial type value
 * @return {Array} - 2D array with both values
 */
function createComprehensiveMockData_(fundingSource, trialType) {
  const mockData = [];
  
  // Row 1 (index 0) - Headers row
  const row1 = new Array(50).fill('');
  row1[6] = "試験種別"; // Column G
  row1[39] = "原資"; // Column AN
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row
  const row2 = new Array(50).fill('');
  row2[6] = trialType; // Trial type
  row2[39] = fundingSource; // Funding source
  mockData.push(row2);
  
  return mockData;
}

/**
 * Quick test runner for development
 */
function quickTestFundingSource() {
  console.log('🔧 クイック原資テスト実行');
  const basicResult = testFundingSourceLogic();
  const comprehensiveResult = testComprehensiveFundingScenarios();
  
  console.log('\n🎯 総合結果:');
  console.log(`基本テスト: ${basicResult ? '成功' : '失敗'}`);
  console.log(`包括テスト: ${comprehensiveResult ? '成功' : '失敗'}`);
  
  return basicResult && comprehensiveResult;
}
