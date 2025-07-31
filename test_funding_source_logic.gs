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
      coordinationOfficeSetup: 'なし',
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
      coordinationOfficeSetup: 'なし',
      fundingSource: '営利企業原資（製薬企業等）',
      expectedCoefficient: QuoteScriptConstants.COMMERCIAL_COEFFICIENT,
      description: '特定臨床研究 + 調整事務局なし + 営利企業原資 → 係数1.5 (原資優先)'
    },
    // Default case: All conditions result in 1.0
    {
      trialType: '特定臨床研究',
      coordinationOfficeSetup: 'なし',
      fundingSource: '公的資金（税金由来）',
      expectedCoefficient: QuoteScriptConstants.DEFAULT_COEFFICIENT,
      description: '特定臨床研究 + 調整事務局なし + 公的資金 → 係数1.0 (デフォルト)'
    },
    {
      trialType: '観察研究・レジストリ',
      coordinationOfficeSetup: 'なし',
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
