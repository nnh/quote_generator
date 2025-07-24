/**
 * Test patterns for final analysis table count logic
 * 
 * This file contains test scenarios to verify the 50-table minimum rule
 * that applies only to 医師主導治験 (investigator-initiated trials) when
 * final analysis is requested.
 */

/**
 * Test function for final analysis table count logic
 * Tests the 50-table minimum rule for different trial types
 */
function testFinalAnalysisTableCountLogic() {
  console.log('🚀 最終解析帳票数ロジックテスト開始');
  console.log('==================================================');
  console.log('📋 テストシナリオ: 試験種別別の帳票数調整ロジック');
  console.log('🎯 対象: 医師主導治験の50表最小値ルール検証');
  console.log('⏰ テスト開始時刻: ' + new Date().toLocaleString('ja-JP'));
  
  // Define test scenarios
  const testScenarios = [
    {
      trialType: '医師主導治験',
      finalAnalysisRequest: 'あり',
      tableCount: 49,
      expectedTableCount: 50,
      expectedComment: true,
      description: '医師主導治験 + 最終解析あり + 帳票数49 → 50表に調整'
    },
    {
      trialType: '医師主導治験',
      finalAnalysisRequest: 'あり',
      tableCount: 51,
      expectedTableCount: 51,
      expectedComment: false,
      description: '医師主導治験 + 最終解析あり + 帳票数51 → 51表のまま'
    },
    {
      trialType: '特定臨床研究',
      finalAnalysisRequest: 'あり',
      tableCount: 49,
      expectedTableCount: 49,
      expectedComment: false,
      description: '医師主導治験以外 + 最終解析あり + 帳票数49 → 49表のまま'
    },
    {
      trialType: '観察研究・レジストリ',
      finalAnalysisRequest: 'あり',
      tableCount: 30,
      expectedTableCount: 30,
      expectedComment: false,
      description: '医師主導治験以外 + 最終解析あり + 帳票数30 → 30表のまま'
    },
    {
      trialType: '医師主導治験',
      finalAnalysisRequest: 'なし',
      tableCount: 49,
      expectedTableCount: 49,
      expectedComment: false,
      description: '医師主導治験 + 最終解析なし + 帳票数49 → 調整なし'
    }
  ];
  
  let passedTests = 0;
  let totalTests = testScenarios.length;
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n--- テスト ${i + 1}/${totalTests}: ${scenario.description} ---`);
    
    if (runTableCountTest_(scenario)) {
      passedTests++;
    }
  }
  
  // Summary
  console.log('\n==================================================');
  console.log(`📊 テスト結果サマリー: ${passedTests}/${totalTests} 成功`);
  
  if (passedTests === totalTests) {
    console.log('✅ 全テスト成功: 帳票数調整ロジックが正常に動作しました');
  } else {
    console.log(`❌ ${totalTests - passedTests}個のテストが失敗しました`);
  }
  
  console.log('⏰ テスト終了時刻: ' + new Date().toLocaleString('ja-JP'));
  return passedTests === totalTests;
}

/**
 * Run a single table count test scenario
 * @param {Object} scenario - Test scenario with trial type, analysis request, table count, and expectations
 * @return {boolean} - True if test passed, false otherwise
 */
function runTableCountTest_(scenario) {
  try {
    // Initialize ConfigCache
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.log('❌ ConfigCacheの初期化に失敗');
      return false;
    }
    
    // Clear existing trial comments
    clearTrialComments_();
    console.log('📝 既存のトライアルコメントをクリア');
    
    // Create mock quotation request data
    const mockData = createMockQuotationRequestForTableCount_(
      scenario.trialType, 
      scenario.finalAnalysisRequest, 
      scenario.tableCount
    );
    console.log(`📝 モックデータ作成完了:`);
    console.log(`  試験種別: ${scenario.trialType}`);
    console.log(`  最終解析業務の依頼: ${scenario.finalAnalysisRequest}`);
    console.log(`  統計解析に必要な図表数: ${scenario.tableCount}`);
    
    // Create SetSheetItemValues instance and test closing items logic
    const setSheetItemValues = new SetSheetItemValues('Closing', mockData);
    
    // Execute the closing items logic (this will trigger the table count adjustment)
    console.log('🔄 set_closing_items_() 実行中...');
    const result = setSheetItemValues.set_closing_items_([]);
    
    // Verify the table count adjustment
    const actualTableCount = extractTableCountFromResult_(result, scenario.finalAnalysisRequest);
    
    console.log('📊 実行結果:');
    console.log(`  期待帳票数: ${scenario.expectedTableCount}`);
    console.log(`  実際帳票数: ${actualTableCount}`);
    
    // Check if table count matches expectation
    const tableCountMatches = actualTableCount === scenario.expectedTableCount;
    
    // Check if comment was added when expected
    const commentExists = checkTrialCommentExists_();
    const commentMatches = commentExists === scenario.expectedComment;
    
    console.log(`  コメント期待: ${scenario.expectedComment ? 'あり' : 'なし'}`);
    console.log(`  コメント実際: ${commentExists ? 'あり' : 'なし'}`);
    
    if (tableCountMatches && commentMatches) {
      console.log(`✅ テスト成功: ${scenario.description}`);
      return true;
    } else {
      console.log(`❌ テスト失敗: ${scenario.description}`);
      if (!tableCountMatches) {
        console.log(`  帳票数不一致: 期待=${scenario.expectedTableCount}, 実際=${actualTableCount}`);
      }
      if (!commentMatches) {
        console.log(`  コメント状態不一致: 期待=${scenario.expectedComment}, 実際=${commentExists}`);
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
 * Create mock quotation request data for table count testing
 * @param {string} trialType - Trial type value
 * @param {string} finalAnalysisRequest - Final analysis request ('あり' or 'なし')
 * @param {number} tableCount - Number of analysis tables
 * @return {Array} - 2D array matching quotation request structure
 */
function createMockQuotationRequestForTableCount_(trialType, finalAnalysisRequest, tableCount) {
  // Create 2D array structure matching quotation request range
  const mockData = [];
  
  // Row 1 (index 0) - Headers row
  const row1 = new Array(50).fill('');
  row1[6] = "試験種別"; // Column G
  row1[15] = "最終解析業務の依頼"; // Column P
  row1[16] = "統計解析に必要な図表数"; // Column Q
  mockData.push(row1);
  
  // Row 2 (index 1) - Data row
  const row2 = new Array(50).fill('');
  row2[6] = trialType; // Trial type
  row2[15] = finalAnalysisRequest; // Final analysis request
  row2[16] = tableCount; // Table count
  mockData.push(row2);
  
  return mockData;
}

/**
 * Extract table count from SetSheetItemValues result
 * @param {Array} result - Result array from set_closing_items_
 * @param {string} finalAnalysisRequest - Final analysis request value
 * @return {number} - Extracted table count
 */
function extractTableCountFromResult_(result, finalAnalysisRequest) {
  if (finalAnalysisRequest !== 'あり') {
    return 0; // No final analysis requested
  }
  
  // Look for final analysis item in the result
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    if (Array.isArray(item) && item.length >= 2) {
      const itemName = item[0];
      const itemCount = item[1];
      
      // Check for final analysis items (both single and double patterns)
      if (itemName && (
        itemName.includes('最終解析プログラム作成、解析実施（シングル）') ||
        itemName.includes('最終解析プログラム作成、解析実施（ダブル）')
      )) {
        return parseInt(itemCount) || 0;
      }
    }
  }
  
  return 0;
}

/**
 * Clear trial comments for clean testing
 */
function clearTrialComments_() {
  try {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      return;
    }
    
    const sheet = get_sheets();
    const commentRange = cache.scriptProperties.getProperty('trial_comment_range');
    if (commentRange && sheet.trial) {
      sheet.trial.getRange(commentRange).clearContent();
    }
  } catch (error) {
    console.log(`警告: トライアルコメントのクリアに失敗: ${error.message}`);
  }
}

/**
 * Check if trial comment exists (indicating table count was adjusted)
 * @return {boolean} - True if comment exists, false otherwise
 */
function checkTrialCommentExists_() {
  try {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      return false;
    }
    
    const sheet = get_sheets();
    const commentRange = cache.scriptProperties.getProperty('trial_comment_range');
    if (!commentRange || !sheet.trial) {
      return false;
    }
    
    const comments = sheet.trial.getRange(commentRange).getValues();
    
    // Check if any comment contains the 50-table message
    for (let i = 0; i < comments.length; i++) {
      for (let j = 0; j < comments[i].length; j++) {
        const comment = comments[i][j];
        if (comment && comment.toString().includes('統計解析に必要な帳票数を') && 
            comment.toString().includes('表と想定しております')) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.log(`警告: トライアルコメントの確認に失敗: ${error.message}`);
    return false;
  }
}

/**
 * Quick test runner for development
 */
function quickTestTableCount() {
  console.log('🔧 クイック帳票数テスト実行');
  return testFinalAnalysisTableCountLogic();
}
