/**
 * Test patterns for coefficient calculation logic
 * 
 * This file contains test scenarios to verify the coefficient calculation logic
 * based on funding source (AN2), coordination office setup (AQ2), and trial type (G2).
 * 
 * Coefficient calculation rules:
 * - G2 (試験種別) = "医師主導治験" → 1.5 (highest priority)
 * - AQ2 (調整事務局設置) = "あり" → 1.5 (medium priority)
 * - AN2 (原資) = "営利企業原資（製薬企業等）" → 1.5 (lowest priority)
 * - Otherwise → 1.0
 */

/**
 * Test function for comprehensive coefficient calculation logic
 * Tests coefficient calculations based on trial type, coordination office setup, and funding source
 */
function testFundingSourceLogic() {
  console.log('🚀 係数計算ロジックテスト開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 試験種別・調整事務局・原資による係数計算検証');
  console.log('🎯 対象: G2(試験種別) > AQ2(調整事務局) > AN2(原資) の優先順位確認');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
  // Define comprehensive test scenarios covering all coefficient calculation rules
  const testScenarios = [
    // Priority 1: Trial type = "医師主導治験" (should always result in 1.5)
    {
      trialType: '医師主導治験',
      coordinationOfficeSetup: '設置しない',
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '医師主導治験 + 調整事務局なし + 公的資金 → 係数1.5 (試験種別優先)'
    },
    {
      trialType: '医師主導治験',
      coordinationOfficeSetup: 'あり',
      fundingSource: '営利企業原資（製薬企業等）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '医師主導治験 + 調整事務局あり + 営利企業原資 → 係数1.5 (試験種別優先)'
    },
    // Priority 2: Coordination office setup = "あり" (when trial type is not 医師主導治験)
    {
      trialType: '特定臨床研究',
      coordinationOfficeSetup: 'あり',
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '特定臨床研究 + 調整事務局あり + 公的資金 → 係数1.5 (調整事務局優先)'
    },
    {
      trialType: '観察研究・レジストリ',
      coordinationOfficeSetup: 'あり',
      fundingSource: '営利企業原資（製薬企業等）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '観察研究 + 調整事務局あり + 営利企業原資 → 係数1.5 (調整事務局優先)'
    },
    // Priority 3: Funding source = "営利企業原資（製薬企業等）" (when above conditions are not met)
    {
      trialType: '特定臨床研究',
      coordinationOfficeSetup: '設置しない',
      fundingSource: '営利企業原資（製薬企業等）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '特定臨床研究 + 調整事務局なし + 営利企業原資 → 係数1.5 (原資優先)'
    },
    // Default case: All conditions result in 1.0
    {
      trialType: '特定臨床研究',
      coordinationOfficeSetup: '設置しない',
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.DEFAULT_COEFFICIENT,
      description: '特定臨床研究 + 調整事務局なし + 公的資金 → 係数1.0 (デフォルト)'
    },
    {
      trialType: '観察研究・レジストリ',
      coordinationOfficeSetup: '設置しない',
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.DEFAULT_COEFFICIENT,
      description: '観察研究 + 調整事務局なし + 公的資金 → 係数1.0 (デフォルト)'
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
 * Run a single coefficient calculation test scenario
 * @param {Object} scenario - Test scenario with all conditions and expectations
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
    console.log(`  試験種別: ${scenario.trialType}`);
    console.log(`  調整事務局設置: ${scenario.coordinationOfficeSetup}`);
    console.log(`  原資: ${scenario.fundingSource}`);
    console.log(`  期待係数: ${scenario.expectedCoefficient}`);
    
    // Create mock quotation request data with all conditions
    const mockData = createMockQuotationRequestForCoefficient_(
      scenario.trialType, 
      scenario.coordinationOfficeSetup, 
      scenario.fundingSource
    );
    console.log('📝 モックデータ作成完了');
    
    // Test coefficient calculation logic
    console.log('🔄 係数計算ロジックテスト実行中...');
    const coefficientResult = testCoefficientCalculation_(mockData, scenario);
    
    // Verify result
    if (coefficientResult) {
      console.log(`✅ テスト成功: ${scenario.description}`);
      return true;
    } else {
      console.log(`❌ テスト失敗: ${scenario.description}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ テスト実行中にエラーが発生: ${error.message}`);
    console.log(`📍 エラースタック: ${error.stack}`);
    return false;
  }
}

/**
 * Test coefficient calculation logic using the extracted function
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
    
    // Test the extracted coefficient calculation function
    const actualCoefficient = calculateCoefficientFromFundingSource_(mockData, cache);
    
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
 * Create mock quotation request data for comprehensive coefficient testing
 * @param {string} trialType - Trial type value (G2)
 * @param {string} coordinationOfficeSetup - Coordination office setup value (AQ2)
 * @param {string} fundingSource - Funding source value (AN2)
 * @return {Array} - 2D array matching quotation request structure
 */
function createMockQuotationRequestForCoefficient_(trialType, coordinationOfficeSetup, fundingSource) {
  // Create 2D array structure matching quotation request range
  const mockData = [];
  
  // Row 1 (index 0) - Headers row
  const row1 = new Array(50).fill('');
  row1[6] = "試験種別"; // Column G (index 6)
  row1[39] = "原資"; // Column AN (index 39)
  row1[42] = "調整事務局設置の有無"; // Column AQ (index 42)
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row
  const row2 = new Array(50).fill('');
  row2[6] = trialType; // Trial type value
  row2[39] = fundingSource; // Funding source value
  row2[42] = coordinationOfficeSetup; // Coordination office setup value
  mockData.push(row2);
  
  return mockData;
}

/**
 * Create mock quotation request data for funding source testing (legacy function for compatibility)
 * @param {string} fundingSource - Funding source value
 * @return {Array} - 2D array matching quotation request structure
 */
function createMockQuotationRequestForFunding_(fundingSource) {
  return createMockQuotationRequestForCoefficient_('特定臨床研究', '設置しない', fundingSource);
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
