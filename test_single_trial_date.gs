/**
 * Single Test Pattern for get_trial_start_end_date_() function
 * 
 * This file contains a single, focused test pattern for the get_trial_start_end_date_() function
 * to verify basic date calculation functionality with detailed console logging.
 */

/**
 * Single test function for get_trial_start_end_date_() - Standard 2-year trial scenario
 * Tests a typical 2-year trial period from 2024/4/1 to 2026/3/31
 */
function testSingleTrialDatePattern() {
  console.log('🚀 get_trial_start_end_date_() 単一テストパターン開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 標準的な2年間試験');
  console.log('📅 試験期間: 2024年4月1日 ～ 2026年3月31日');
  console.log('🎯 期待結果: 9行×2列の配列、適切な日付計算');
  console.log('📝 検証項目: 構造、日付順序、プロパティ設定');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
  try {
    // Initialize ConfigCache
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.log('❌ ConfigCacheの初期化に失敗');
      return false;
    }
    
    // Clear existing properties
    clearTrialProperties_(cache);
    console.log('📝 既存のプロパティをクリア完了');
    
    // Set test parameters
    const startDate = '2024-04-01';
    const endDate = '2026-03-31';
    const testDescription = '標準的な2年間試験';
    
    console.log(`📊 テスト入力値:`);
    console.log(`  開始日: ${startDate}`);
    console.log(`  終了日: ${endDate}`);
    console.log(`  説明: ${testDescription}`);
    
    // Execute the function
    console.log('🔄 get_trial_start_end_date_() 実行中...');
    const result = get_trial_start_end_date_(startDate, endDate);
    
    // Verify results
    console.log('📊 実行結果の検証:');
    
    if (!result) {
      console.log('❌ テスト失敗: 関数が結果を返しませんでした');
      return false;
    }
    
    // Check array structure
    if (!Array.isArray(result)) {
      console.log('❌ テスト失敗: 結果が配列ではありません');
      console.log(`  実際の型: ${typeof result}`);
      return false;
    }
    
    console.log(`  配列の行数: ${result.length}`);
    console.log(`  配列の列数: ${result.length > 0 ? result[0].length : 0}`);
    
    // Expected structure: 9 rows × 2 columns
    if (result.length !== 9) {
      console.log(`❌ テスト失敗: 期待される行数は9ですが、実際は${result.length}でした`);
      return false;
    }
    
    if (result[0].length !== 2) {
      console.log(`❌ テスト失敗: 期待される列数は2ですが、実際は${result[0].length}でした`);
      return false;
    }
    
    console.log('✅ 配列構造の検証成功');
    
    // Display calculated dates
    console.log('📅 計算された日付一覧:');
    const periodNames = [
      'Setup期間',
      'Registration期間1',
      'Interim期間1', 
      'Observation期間1',
      'Interim期間2',
      'Observation期間2',
      'Closing期間',
      '年度1',
      '年度2'
    ];
    
    for (let i = 0; i < result.length; i++) {
      const periodName = periodNames[i] || `期間${i + 1}`;
      console.log(`  ${periodName}: ${result[i][0]} ～ ${result[i][1]}`);
    }
    
    // Verify date order (each period should start after or on the previous period's end)
    console.log('🔍 日付順序の検証:');
    let dateOrderValid = true;
    
    for (let i = 1; i < result.length - 2; i++) { // Skip last 2 rows (fiscal years)
      const prevEnd = moment(result[i-1][1]);
      const currentStart = moment(result[i][0]);
      
      if (currentStart.isBefore(prevEnd)) {
        console.log(`❌ 日付順序エラー: ${periodNames[i]}の開始日が${periodNames[i-1]}の終了日より前です`);
        console.log(`  ${periodNames[i-1]}終了: ${result[i-1][1]}`);
        console.log(`  ${periodNames[i]}開始: ${result[i][0]}`);
        dateOrderValid = false;
      }
    }
    
    if (dateOrderValid) {
      console.log('✅ 日付順序の検証成功');
    } else {
      console.log('❌ 日付順序の検証失敗');
      return false;
    }
    
    // Verify script properties were set
    console.log('🔍 スクリプトプロパティの検証:');
    const setupTerm = cache.scriptProperties.getProperty('setup_term');
    const closingTerm = cache.scriptProperties.getProperty('closing_term');
    const registrationTerm = cache.scriptProperties.getProperty('registration_term');
    
    console.log(`  setup_term: ${setupTerm}`);
    console.log(`  closing_term: ${closingTerm}`);
    console.log(`  registration_term: ${registrationTerm}`);
    
    if (!setupTerm || !closingTerm || !registrationTerm) {
      console.log('❌ テスト失敗: 必要なスクリプトプロパティが設定されていません');
      return false;
    }
    
    console.log('✅ スクリプトプロパティの検証成功');
    
    // Test completed successfully
    console.log('\n==================================================');
    console.log('✅ テスト成功: 標準的な2年間試験の日付計算が正常に動作しました');
    console.log('🎉 get_trial_start_end_date_() 関数は期待通りに機能しています');
    console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
    
    return true;
    
  } catch (error) {
    console.log(`❌ テスト実行中にエラーが発生: ${error.message}`);
    console.log(`📍 エラースタック: ${error.stack}`);
    return false;
  }
}

/**
 * Clear trial-related script properties for clean testing
 * @param {ConfigCache} cache - ConfigCache instance
 */
function clearTrialProperties_(cache) {
  const propertiesToClear = [
    'setup_term',
    'closing_term', 
    'registration_term',
    'trial_start_date',
    'trial_end_date'
  ];
  
  propertiesToClear.forEach(prop => {
    cache.scriptProperties.deleteProperty(prop);
  });
}
