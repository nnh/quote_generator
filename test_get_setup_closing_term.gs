/**
 * Test pattern for get_setup_closing_term_() function
 * 
 * This file contains a single test scenario for the get_setup_closing_term_() function
 * to verify that physician-initiated trials set both setup_term and closing_term to 6 months.
 */

/**
 * Test function for get_setup_closing_term_() - Physician-initiated trial scenario
 * Tests that when trial type is "医師主導治験", both setup_term and closing_term are set to 6
 */
function testGetSetupClosingTermFunction() {
  console.log('🚀 get_setup_closing_term_() 関数テスト開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 医師主導治験の期間設定テスト');
  console.log('🎯 期待結果: setup_term=6, closing_term=6');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
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
    const mockData = createMockQuotationRequestData_('医師主導治験', 'なし');
    console.log('📝 モックデータ作成完了');
    
    // Execute the function
    console.log('🔄 get_setup_closing_term_() 実行中...');
    get_setup_closing_term_('医師主導治験', mockData);
    
    // Verify results
    const actualSetup = cache.scriptProperties.getProperty('setup_term');
    const actualClosing = cache.scriptProperties.getProperty('closing_term');
    
    console.log('📊 実行結果:');
    console.log(`  setup_term: ${actualSetup}`);
    console.log(`  closing_term: ${actualClosing}`);
    
    // Validate results
    if (actualSetup === '6.0' && actualClosing === '6.0') {
      console.log('✅ テスト成功: 医師主導治験で両方の期間が6ヶ月に設定されました');
      console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
      return true;
    } else {
      console.log('❌ テスト失敗:');
      console.log(`  期待値: setup_term=6, closing_term=6`);
      console.log(`  実際値: setup_term=${actualSetup}, closing_term=${actualClosing}`);
      console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
      return false;
    }
    
  } catch (error) {
    console.log(`❌ テスト実行中にエラーが発生: ${error.message}`);
    console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
    return false;
  }
}


/**
 * Create mock quotation request data for testing
 * Creates a 2D array structure matching A1:AQ2 getValues() format (2 rows, 43 columns)
 */
function createMockQuotationRequestData_(trialType, reportSupport) {
  if (trialType === null || trialType === undefined) {
    return null;
  }
  
  // Create 2D array structure matching A1:AQ2 range (2 rows, 43 columns A-AQ)
  const mockData = [];
  
  // Row 1 (index 0) - Headers or first row data
  const row1 = new Array(43).fill(''); // 43 columns from A to AQ
  row1[6] = "試験種別";
  row1[12] = "研究結果報告書作成支援";
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row containing trial type
  const row2 = new Array(43).fill(''); // 43 columns from A to AQ
  row2[6] = trialType;
  row2[12] = reportSupport;
  
  mockData.push(row2);
  
  return mockData;
}
