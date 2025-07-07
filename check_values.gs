/**
 * Main validation function that checks all output values and generates validation report
 * Validates trial parameters, sheet totals, and individual service items
 * @return {void} Writes validation results to the Check sheet
 */
function check_output_values() {
  try {
    initial_process();
    filterhidden();
    
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheets = get_sheets();
    const quotationRequestArray = sheets.quotation_request.getRange(1, 1, 2, sheets.quotation_request.getDataRange().getLastColumn()).getValues();
    
    const facilitiesValue = get_quotation_request_value(quotationRequestArray, scriptProperties.getProperty('facilities_itemname'));  
    const numberOfCasesValue = get_quotation_request_value(quotationRequestArray, scriptProperties.getProperty('number_of_cases_itemname'));
    const trialType = get_quotation_request_value(quotationRequestArray, '試験種別');
    
    const trialMonthsCol = 5;
    let outputRow = 1;
    let outputCol = 1;
    
    sheets.check.clear();
    
    const trialPeriods = calculateTrialPeriods_(quotationRequestArray, scriptProperties);
    const totalMonths = trialPeriods.trialMonths + trialPeriods.setupClosingMonths;
    const trialYear = trialPeriods.trialMonths > 12 ? Math.trunc(trialPeriods.trialMonths / 12) : ''; 
    const trialCeilYear = Math.ceil(trialPeriods.trialMonths / 12);
    
    setupTrialDateValidation_(sheets, quotationRequestArray, outputRow, outputCol, trialMonthsCol);
    outputRow = 2;
    outputCol = 5;
    sheets.check.getRange(outputRow, outputCol + 1).setValue(totalMonths);
    
    validateSheetTotals_(sheets, outputRow);
    outputRow++;
    
    const validationTargets = createValidationTargets_(sheets, scriptProperties);
    const validationItems = buildValidationItems_(quotationRequestArray, scriptProperties, facilitiesValue, numberOfCasesValue, totalMonths, trialPeriods, validationTargets);
    
    executeValidations_(sheets, validationItems, outputRow);
    
  } catch (error) {
    console.error('Error in check_output_values:', error);
    throw new Error(`Validation process failed: ${error.message}`);
  }
}

/**
 * Calculate trial periods including setup, closing, and total months
 * @param {Array} quotationRequestArray - The quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @return {Object} Object containing trial period calculations
 */
function calculateTrialPeriods_(quotationRequestArray, scriptProperties) {
  const trialType = get_quotation_request_value(quotationRequestArray, '試験種別');
  let setupMonth = 0;
  let closingMonth = 0;
  
  if (trialType === scriptProperties.getProperty('investigator_initiated_trial') || 
      trialType === scriptProperties.getProperty('specified_clinical_trial')) {
    setupMonth = 6;
    closingMonth = 6;
  } else {
    setupMonth = 3;
    closingMonth = 3;
    if (get_quotation_request_value(quotationRequestArray, '研究結果報告書作成支援') === 'あり') {
      closingMonth += 3;
    }
  }
  
  const setupClosingMonths = setupMonth + closingMonth;
  SpreadsheetApp.flush();
  const trialMonths = get_sheets().check.getRange(2, 5).getValue();
  
  return {
    setupMonth,
    closingMonth,
    setupClosingMonths,
    trialMonths
  };
}

/**
 * Set up trial date validation in the check sheet
 * @param {Object} sheets - Sheet objects
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {number} outputRow - Starting row for output
 * @param {number} outputCol - Starting column for output
 * @param {number} trialMonthsCol - Column for trial months calculation
 */
function setupTrialDateValidation_(sheets, quotationRequestArray, outputRow, outputCol, trialMonthsCol) {
  const trialStartEnd = [
    ['OK/NG', '詳細', '', ''],
    ['', '症例登録開始〜試験終了日の月数チェック（作業用）',
     get_quotation_request_value(quotationRequestArray, '症例登録開始日').toLocaleDateString("ja"),
     get_quotation_request_value(quotationRequestArray, '試験終了日').toLocaleDateString("ja")]
  ];
  
  sheets.check.getRange(outputRow, outputCol, trialStartEnd.length, trialStartEnd[0].length).setValues(trialStartEnd);
  sheets.check.getRange(2, 5).setFormula('=datedif(C2, D2, "M") + if(day(C2) <= day(D2), 1, 2)');
}

/**
 * Validate totals across Total, Total2, and Total3 sheets
 * @param {Object} sheets - Sheet objects
 * @param {number} outputRow - Row to write validation results
 */
function validateSheetTotals_(sheets, outputRow) {
  const totalAmount = get_total_amount({sheet: sheets.total, item_cols: 'B:B', total_row_itemname: '合計', header_row: 4, total_col_itemname: '金額'});
  const total2Amount = get_total_amount({sheet: sheets.total2, item_cols: 'B:B', total_row_itemname: '合計', header_row: 4, total_col_itemname: '合計'});
  const total3Amount = get_total_amount({sheet: sheets.total3, item_cols: 'B:B', total_row_itemname: '合計', header_row: 3, total_col_itemname: '合計'});
  
  let amountCheck = [null, 'Total, Total2, Total3の合計金額チェック'];
  if (totalAmount === total2Amount && totalAmount === total3Amount) {
    amountCheck[0] = 'OK';
    amountCheck[1] = `${amountCheck[1]} ,想定値:${totalAmount}`;
  } else {
    amountCheck[0] = 'NG：値が想定と異なる';
  }
  
  sheets.check.getRange(outputRow, 1, 1, amountCheck.length).setValues([amountCheck]);
}

/**
 * Create validation targets for different sheet types
 * @param {Object} sheets - Sheet objects
 * @param {PropertiesService} scriptProperties - Script properties
 * @return {Object} Validation target configurations
 */
function createValidationTargets_(sheets, scriptProperties) {
  return {
    targetTotal: {
      sheet: sheets.total, 
      array_item: get_fy_items(sheets.total, scriptProperties.getProperty('fy_sheet_items_col')), 
      col: parseInt(scriptProperties.getProperty('fy_sheet_count_col')), 
      footer: null
    },
    targetTotalAmount: {
      sheet: sheets.total, 
      array_item: get_fy_items(sheets.total, 2), 
      col: 9, 
      footer: '（金額）'
    }
  };
}

/**
 * Build all validation items based on quotation request data
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @param {*} facilitiesValue - Number of facilities
 * @param {*} numberOfCasesValue - Number of cases
 * @param {number} totalMonths - Total trial months
 * @param {Object} trialPeriods - Trial period calculations
 * @param {Object} validationTargets - Validation target configurations
 * @return {Object} Object containing validation items and amount items
 */
function buildValidationItems_(quotationRequestArray, scriptProperties, facilitiesValue, numberOfCasesValue, totalMonths, trialPeriods, validationTargets) {
  const totalCheckItems = [];
  const totalAmountCheckItems = [];
  
  totalCheckItems.push({itemname: 'プロトコルレビュー・作成支援', value: 1});  
  totalCheckItems.push({itemname: '検討会実施（TV会議等）', value: 4}); 
  
  totalCheckItems.push(createConditionalValidationItem_('PMDA相談資料作成支援', 'PMDA相談資料作成支援', 'あり', 1, '', quotationRequestArray));
  totalCheckItems.push(createConditionalValidationItem_('AMED申請資料作成支援', 'AMED申請資料作成支援', 'あり', 1, '', quotationRequestArray));
  
  totalCheckItems.push({itemname: 'プロジェクト管理', value: totalMonths});
  
  const officeOperationItems = createOfficeOperationItems_(quotationRequestArray, scriptProperties, trialPeriods.trialMonths, trialPeriods.setupMonth);
  totalCheckItems.push(...officeOperationItems);
  
  const investigatorTrialItems = createInvestigatorTrialItems_(quotationRequestArray, scriptProperties, totalMonths, facilitiesValue);
  totalCheckItems.push(...investigatorTrialItems);
  
  const meetingItems = createMeetingItems_(quotationRequestArray);
  totalCheckItems.push(...meetingItems);
  
  const regulatoryItems = createRegulatoryItems_(quotationRequestArray, scriptProperties, facilitiesValue);
  totalCheckItems.push(...regulatoryItems);
  
  const monitoringItems = createMonitoringItems_(quotationRequestArray);
  totalCheckItems.push(...monitoringItems);
  
  const dataManagementItems = createDataManagementItems_(trialPeriods, validationTargets.targetTotal);
  totalCheckItems.push(...dataManagementItems);
  
  const analysisItems = createAnalysisItems_(quotationRequestArray, scriptProperties, trialPeriods.trialMonths, facilitiesValue);
  totalCheckItems.push(...analysisItems);
  
  const statisticalItems = createStatisticalItems_(quotationRequestArray, scriptProperties);
  totalCheckItems.push(...statisticalItems);
  
  const reportItems = createReportItems_(quotationRequestArray, scriptProperties);
  totalCheckItems.push(...reportItems);
  
  const auditItems = createAuditItems_();
  totalCheckItems.push(...auditItems);
  
  const paymentItems = createPaymentItems_(quotationRequestArray, facilitiesValue, numberOfCasesValue);
  totalCheckItems.push(...paymentItems);
  
  const publicationItems = createPublicationItems_();
  totalCheckItems.push(...publicationItems);
  
  const feeItems = createFeeItems_(quotationRequestArray, trialPeriods.trialYear);
  totalCheckItems.push(...feeItems);
  
  const insuranceItems = createInsuranceItems_(quotationRequestArray, totalAmountCheckItems);
  totalCheckItems.push(...insuranceItems.checkItems);
  totalAmountCheckItems.push(...insuranceItems.amountItems);
  
  const drugItems = createDrugItems_(quotationRequestArray, facilitiesValue, trialPeriods.trialYear);
  totalCheckItems.push(...drugItems);
  
  const miscellaneousItems = createMiscellaneousItems_();
  totalCheckItems.push(...miscellaneousItems);
  
  const researchFeeAmount = get_quotation_request_value(quotationRequestArray, '研究協力費、負担軽減費配分管理') === 'あり' 
    ? get_quotation_request_value(quotationRequestArray, '研究協力費、負担軽減費') 
    : 0;
  totalAmountCheckItems.push({itemname: '研究協力費', value: researchFeeAmount});
  
  return {
    totalCheckItems,
    totalAmountCheckItems
  };
}

/**
 * Execute all validations and write results to check sheet
 * @param {Object} sheets - Sheet objects
 * @param {Object} validationItems - Validation items to check
 * @param {number} outputRow - Starting row for output
 */
function executeValidations_(sheets, validationItems, outputRow) {
  const discountByYear = checkDiscountByYearSheet_().every(result => result) ? 'OK' : 'NG：値が想定と異なる'; 
  
  const additionalChecks = [];
  additionalChecks.push([discountByYear, 'Setup〜Closingシートの特別値引後合計のチェック']);  
  additionalChecks.push(compareTotalSheetTotaltoVerticalTotal_());  
  additionalChecks.push(compareTotal2Total3SheetVerticalTotalToHorizontalTotal_());
  additionalChecks.push([checkQuoteSum_().every(result => result) ? 'OK' : 'NG：値が想定と異なる', 'Quote, total, total2, total3の合計・特別値引後合計一致チェック']);
  additionalChecks.push(compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_());
  
  const validationTargets = createValidationTargets_(sheets, PropertiesService.getScriptProperties());
  const totalResults = validationItems.totalCheckItems.map(item => check_itemName_and_value(validationTargets.targetTotal, item.itemname, item.value)); 
  const amountResults = validationItems.totalAmountCheckItems.map(item => check_itemName_and_value(validationTargets.targetTotalAmount, item.itemname, item.value)); 
  
  const allResults = totalResults.concat(amountResults).concat(additionalChecks);
  sheets.check.getRange(outputRow, 1, allResults.length, allResults[0].length).setValues(allResults);
}

/**
 * Helper function to create validation items based on conditional logic
 * @param {string} itemName - The name of the validation item
 * @param {string} conditionField - The field to check in quotation request
 * @param {string} expectedValue - The expected value to match
 * @param {*} valueIfTrue - Value to use if condition is true
 * @param {*} valueIfFalse - Value to use if condition is false
 * @param {Array} quotationRequestArray - Quotation request data
 * @return {Object} Validation item object
 */
function createConditionalValidationItem_(itemName, conditionField, expectedValue, valueIfTrue, valueIfFalse, quotationRequestArray) {
  const actualValue = get_quotation_request_value(quotationRequestArray, conditionField);
  return {
    itemname: itemName,
    value: actualValue === expectedValue ? valueIfTrue : valueIfFalse
  };
}

/**
 * Create office operation validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @param {number} trialMonths - Trial duration in months
 * @param {number} setupMonth - Setup period in months
 * @return {Array} Array of validation items
 */
function createOfficeOperationItems_(quotationRequestArray, scriptProperties, trialMonths, setupMonth) {
  const items = [];
  const trialType = get_quotation_request_value(quotationRequestArray, '試験種別');
  const hasOfficeSetup = get_quotation_request_value(quotationRequestArray, '調整事務局設置の有無') === 'あり';
  const isCommercial = get_quotation_request_value(quotationRequestArray, scriptProperties.getProperty('coefficient')) === scriptProperties.getProperty('commercial_company_coefficient');
  
  const needsOfficeOperation = trialType === scriptProperties.getProperty('investigator_initiated_trial') || hasOfficeSetup || isCommercial;
  
  items.push({
    itemname: '事務局運営（試験開始後から試験終了まで）',
    value: needsOfficeOperation ? trialMonths : ''
  });
  
  items.push({
    itemname: '事務局運営（試験開始前）',
    value: needsOfficeOperation ? setupMonth : ''
  });
  
  items.push({
    itemname: '事務局運営（試験終了時）',
    value: needsOfficeOperation ? 1 : ''
  });
  
  return items;
}

/**
 * Create investigator trial specific validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @param {number} totalMonths - Total trial months
 * @param {*} facilitiesValue - Number of facilities
 * @return {Array} Array of validation items
 */
function createInvestigatorTrialItems_(quotationRequestArray, scriptProperties, totalMonths, facilitiesValue) {
  const items = [];
  const isInvestigatorTrial = get_quotation_request_value(quotationRequestArray, '試験種別') === scriptProperties.getProperty('investigator_initiated_trial');
  
  items.push({
    itemname: 'キックオフミーティング準備・実行',
    value: isInvestigatorTrial ? totalMonths : ''
  });
  
  return items;
}

/**
 * Create meeting-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @return {Array} Array of validation items
 */
function createMeetingItems_(quotationRequestArray) {
  const items = [];
  
  items.push(createConditionalValidationItem_('キックオフミーティング準備・実行', 'キックオフミーティング', 'あり', 1, '', quotationRequestArray));
  items.push(createConditionalValidationItem_('症例検討会準備・実行', '症例検討会', 'あり', 1, '', quotationRequestArray));
  
  return items;
}

/**
 * Create regulatory and compliance validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @param {*} facilitiesValue - Number of facilities
 * @return {Array} Array of validation items
 */
function createRegulatoryItems_(quotationRequestArray, scriptProperties, facilitiesValue) {
  const items = [];
  const isInvestigatorTrial = get_quotation_request_value(quotationRequestArray, '試験種別') === scriptProperties.getProperty('investigator_initiated_trial');
  const isSpecifiedTrial = get_quotation_request_value(quotationRequestArray, '試験種別') === scriptProperties.getProperty('specified_clinical_trial');
  
  items.push({
    itemname: '薬剤対応',
    value: isInvestigatorTrial ? facilitiesValue : ''
  });
  
  items.push({
    itemname: 'PMDA対応、照会事項対応',
    value: ''
  });
  
  items.push({
    itemname: '監査対応',
    value: isInvestigatorTrial ? 1 : ''
  });
  
  items.push({
    itemname: 'SOP一式、CTR登録案、TMF管理',
    value: isInvestigatorTrial ? 1 : ''
  });
  
  if (isInvestigatorTrial) {
    items.push({
      itemname: 'IRB承認確認、施設管理',
      value: facilitiesValue
    });
  } else {
    items.push({
      itemname: 'IRB準備・承認確認',
      value: ''
    });
  }
  
  items.push({
    itemname: '特定臨床研究法申請資料作成支援',
    value: isSpecifiedTrial ? facilitiesValue : ''
  });
  
  items.push({itemname: '契約・支払手続、実施計画提出支援', value: ''});
  
  return items;
}

/**
 * Create monitoring-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @return {Array} Array of validation items
 */
function createMonitoringItems_(quotationRequestArray) {
  const items = [];
  const hasOnSiteMonitoring = get_quotation_request_value(quotationRequestArray, '1例あたりの実地モニタリング回数') > 0;
  const hasDocumentMonitoring = get_quotation_request_value(quotationRequestArray, '年間1施設あたりの必須文書実地モニタリング回数') > 0;
  const needsMonitoring = hasOnSiteMonitoring || hasDocumentMonitoring;
  
  items.push({
    itemname: 'モニタリング準備業務（関連資料作成）',
    value: needsMonitoring ? 1 : ''
  });
  
  items.push({
    itemname: `開始前モニタリング・必須文書確認
症例モニタリング・SAE対応`,
    value: needsMonitoring ? 999 : ''
  });
  
  return items;
}

/**
 * Create data management validation items
 * @param {Object} trialPeriods - Trial period calculations
 * @param {Object} targetTotal - Target total configuration
 * @return {Array} Array of validation items
 */
function createDataManagementItems_(trialPeriods, targetTotal) {
  const items = [];
  
  items.push({itemname: '問い合わせ対応', value: ''});
  items.push({itemname: 'EDCライセンス・データベースセットアップ', value: 1});
  items.push({itemname: 'データベース管理料', value: trialPeriods.trialMonths + trialPeriods.closingMonth});
  items.push({itemname: '業務分析・DM計画書の作成・CTR登録案の作成', value: 1});
  items.push({itemname: '紙CRFのEDC代理入力（含む問合せ）', value: ''});
  items.push({itemname: 'DB作成・eCRF作成・バリデーション', value: 1});
  items.push({itemname: 'バリデーション報告書', value: 1});
  
  const quotationRequestArray = get_sheets().quotation_request.getRange(1, 1, 2, get_sheets().quotation_request.getDataRange().getLastColumn()).getValues();
  const accountSetupItemName = get_quotation_request_value(quotationRequestArray, '試験種別') === PropertiesService.getScriptProperties().getProperty('investigator_initiated_trial')
    ? '初期アカウント設定（施設・ユーザー）'
    : '初期アカウント設定（施設・ユーザー）、IRB承認確認';
  
  items.push({
    itemname: accountSetupItemName,
    value: get_quotation_request_value(quotationRequestArray, PropertiesService.getScriptProperties().getProperty('facilities_itemname'))
  });
  
  items.push({itemname: '入力の手引作成', value: 1});
  items.push({itemname: 'ロジカルチェック、マニュアルチェック、クエリ対応', value: trialPeriods.trialMonths});
  
  const interimCount = targetTotal.sheet.getRange(targetTotal.array_item['中間解析報告書作成（出力結果＋表紙）'], targetTotal.col).getValue();
  const closingCount = targetTotal.sheet.getRange(targetTotal.array_item['データベース固定作業、クロージング'], targetTotal.col).getValue();
  items.push({itemname: 'データクリーニング', value: interimCount + closingCount});
  items.push({itemname: 'データベース固定作業、クロージング', value: 1});
  
  return items;
}

/**
 * Create analysis-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @param {number} trialMonths - Trial duration in months
 * @param {*} facilitiesValue - Number of facilities
 * @return {Array} Array of validation items
 */
function createAnalysisItems_(quotationRequestArray, scriptProperties, trialMonths, facilitiesValue) {
  const items = [];
  
  items.push(createConditionalValidationItem_('症例検討会資料作成', '症例検討会', 'あり', 1, '', quotationRequestArray));
  items.push(createConditionalValidationItem_('安全性管理事務局業務', '安全性管理事務局設置', '設置・委託する', trialMonths, '', quotationRequestArray));
  items.push(createConditionalValidationItem_('効果安全性評価委員会事務局業務', '効安事務局設置', '設置・委託する', trialMonths, '', quotationRequestArray));
  
  return items;
}

/**
 * Create statistical analysis validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @return {Array} Array of validation items
 */
function createStatisticalItems_(quotationRequestArray, scriptProperties) {
  const items = [];
  const hasInterimAnalysis = get_quotation_request_value(quotationRequestArray, '中間解析業務の依頼') === 'あり';
  const hasFinalAnalysis = get_quotation_request_value(quotationRequestArray, '最終解析業務の依頼') === 'あり';
  const isInvestigatorTrial = get_quotation_request_value(quotationRequestArray, '試験種別') === scriptProperties.getProperty('investigator_initiated_trial');
  
  let analysisDocumentCount = 0;
  if (hasInterimAnalysis) analysisDocumentCount++;
  if (hasFinalAnalysis) analysisDocumentCount++;
  
  items.push({
    itemname: '統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成',
    value: analysisDocumentCount === 0 ? '' : analysisDocumentCount
  });
  
  const interimAnalysisItemName = isInvestigatorTrial 
    ? '中間解析プログラム作成、解析実施（ダブル）'
    : '中間解析プログラム作成、解析実施（シングル）';
  
  items.push({
    itemname: interimAnalysisItemName,
    value: hasInterimAnalysis ? '回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認' : ''
  });
  
  items.push(createConditionalValidationItem_('中間解析報告書作成（出力結果＋表紙）', '中間解析業務の依頼', 'あり', 1, '', quotationRequestArray));
  
  const finalAnalysisItemName = isInvestigatorTrial 
    ? '最終解析プログラム作成、解析実施（ダブル）'
    : '最終解析プログラム作成、解析実施（シングル）';
  
  let finalAnalysisValue = '';
  if (hasFinalAnalysis) {
    finalAnalysisValue = get_quotation_request_value(quotationRequestArray, '統計解析に必要な図表数');
    if (isInvestigatorTrial && finalAnalysisValue < 50) {
      finalAnalysisValue = 50;
    }
  }
  
  items.push({
    itemname: finalAnalysisItemName,
    value: finalAnalysisValue
  });
  
  items.push(createConditionalValidationItem_('最終解析報告書作成（出力結果＋表紙）', '最終解析業務の依頼', 'あり', 1, '', quotationRequestArray));
  
  return items;
}

/**
 * Create report creation validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {PropertiesService} scriptProperties - Script properties
 * @return {Array} Array of validation items
 */
function createReportItems_(quotationRequestArray, scriptProperties) {
  const items = [];
  const isInvestigatorTrial = get_quotation_request_value(quotationRequestArray, '試験種別') === scriptProperties.getProperty('investigator_initiated_trial');
  
  if (isInvestigatorTrial) {
    items.push({
      itemname: 'CSRの作成支援',
      value: 1
    });
  } else {
    items.push(createConditionalValidationItem_('研究結果報告書の作成', '研究結果報告書作成支援', 'あり', 1, '', quotationRequestArray));
  }
  
  return items;
}

/**
 * Create audit-related validation items
 * @return {Array} Array of validation items
 */
function createAuditItems_() {
  return [
    {itemname: '監査計画書作成', value: ''},
    {itemname: '施設監査', value: ''},
    {itemname: '監査報告書作成', value: ''}
  ];
}

/**
 * Create payment-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {*} facilitiesValue - Number of facilities
 * @param {*} numberOfCasesValue - Number of cases
 * @return {Array} Array of validation items
 */
function createPaymentItems_(quotationRequestArray, facilitiesValue, numberOfCasesValue) {
  const items = [];
  
  items.push(createConditionalValidationItem_('試験開始準備費用', '試験開始準備費用', 'あり', facilitiesValue, '', quotationRequestArray));
  items.push(createConditionalValidationItem_('症例登録', '症例登録毎の支払', 'あり', numberOfCasesValue, '', quotationRequestArray));
  items.push(createConditionalValidationItem_('症例報告', '症例最終報告書提出毎の支払', 'あり', numberOfCasesValue, '', quotationRequestArray));
  
  return items;
}

/**
 * Create publication-related validation items
 * @return {Array} Array of validation items
 */
function createPublicationItems_() {
  return [
    {itemname: '国内学会発表', value: ''},
    {itemname: '国際学会発表', value: ''},
    {itemname: '論文作成', value: ''}
  ];
}

/**
 * Create fee-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {*} trialYear - Trial duration in years
 * @return {Array} Array of validation items
 */
function createFeeItems_(quotationRequestArray, trialYear) {
  const items = [];
  const hasCrbApplication = get_quotation_request_value(quotationRequestArray, 'CRB申請') === 'あり';
  const auditFacilities = get_quotation_request_value(quotationRequestArray, '監査対象施設数');
  
  items.push({
    itemname: '名古屋医療センターCRB申請費用(初年度)',
    value: hasCrbApplication ? 1 : ''
  });
  
  items.push({
    itemname: '名古屋医療センターCRB申請費用(2年目以降)',
    value: hasCrbApplication && trialYear > 1 ? trialYear - 1 : ''
  });
  
  items.push({
    itemname: '外部監査費用',
    value: auditFacilities > 0 ? 2 : ''
  });
  
  items.push({
    itemname: '施設監査費用',
    value: auditFacilities > 0 ? auditFacilities : ''
  });
  
  return items;
}

/**
 * Create insurance-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {Array} totalAmountCheckItems - Array to add amount items to
 * @return {Object} Object with checkItems and amountItems arrays
 */
function createInsuranceItems_(quotationRequestArray, totalAmountCheckItems) {
  const insuranceFee = get_quotation_request_value(quotationRequestArray, '保険料');
  
  const checkItems = [{
    itemname: '保険料',
    value: insuranceFee > 0 ? 1 : ''
  }];
  
  const amountItems = [{
    itemname: '保険料',
    value: insuranceFee > 0 ? insuranceFee : 0
  }];
  
  return { checkItems, amountItems };
}

/**
 * Create drug-related validation items
 * @param {Array} quotationRequestArray - Quotation request data
 * @param {*} facilitiesValue - Number of facilities
 * @param {*} trialYear - Trial duration in years
 * @return {Array} Array of validation items
 */
function createDrugItems_(quotationRequestArray, facilitiesValue, trialYear) {
  const items = [];
  
  const hasDrugTransport = get_quotation_request_value(quotationRequestArray, '治験薬運搬') === 'あり';
  let drugTransportValue = '';
  if (hasDrugTransport) {
    drugTransportValue = trialYear > 0 ? facilitiesValue * trialYear : facilitiesValue;
  }
  
  items.push({
    itemname: '治験薬運搬',
    value: drugTransportValue
  });
  
  items.push(createConditionalValidationItem_('治験薬管理（中央）', '治験薬管理', 'あり', 1, '', quotationRequestArray));
  
  return items;
}

/**
 * Create miscellaneous validation items
 * @return {Array} Array of validation items
 */
function createMiscellaneousItems_() {
  return [
    {itemname: 'QOL調査', value: ''},
    {itemname: '翻訳', value: ''},
    {itemname: 'CDISC対応費', value: ''},
    {itemname: '中央診断謝金', value: ''}
  ];
}
}
/**
 * Compare the total amount to the vertical total in the Total sheet
 * @return {Array} Array with [status, message] where status is 'OK' or 'NG:...'
 */
function compareTotalSheetTotaltoVerticalTotal_() {
  try {
    const sheets = get_sheets();
    const getRowCol = new GetTargetRowCol();
    
    const totalAmountCol = getRowCol.getTargetCol(sheets.total, 4, '金額');
    const totalValues = sheets.total.getDataRange().getValues();
    
    const totalRow = totalValues.find(row => row[1] === '合計');
    if (!totalRow) {
      return ['NG：合計行が見つかりません', 'Totalシートに合計行が存在しません'];
    }
    
    const horizontalTotal = totalRow[totalAmountCol - 1];
    const verticalTotalArray = totalValues
      .filter(row => row[totalAmountCol] !== '' && row[totalAmountCol] !== '　合計金額')
      .map(row => row[totalAmountCol]);
    const verticalTotal = verticalTotalArray.reduce((sum, value) => sum + value, 0);
    
    const isEqual = horizontalTotal === verticalTotal;
    const message = `Totalシートの縦計と合計金額のチェック, 縦計:${verticalTotal}, 合計金額:${horizontalTotal}`;
    
    return [isEqual ? 'OK' : 'NG：値が想定と異なる', message];
  } catch (error) {
    return ['NG：エラーが発生しました', `比較処理でエラー: ${error.message}`];
  }
}
/**
 * Class for comparing vertical and horizontal totals in Total2 and Total3 sheets
 * Handles both regular totals and discount calculations with comprehensive error handling
 */
class CompareTotal2Total3SheetVerticalTotalToHorizontal {
  /**
   * Initialize the comparison class with sheet data and discount rate
   */
  constructor() {
    try {
      const sheets = get_sheets();
      this.discountRate = sheets.trial.getRange('B47').getValue();
      this.targetSheets = [
        { sheet: sheets.total2, termRowIdx: 3, name: 'Total2' },
        { sheet: sheets.total3, termRowIdx: 2, name: 'Total3' }
      ];
      this.getRowCol = new GetTargetRowCol();
      
      this.targets = this.targetSheets.map(sheetConfig => ({
        ...sheetConfig,
        setupIdx: 3,
        totalValues: sheetConfig.sheet.getDataRange().getValues()
      }));
    } catch (error) {
      throw new Error(`Failed to initialize comparison class: ${error.message}`);
    }
  }
  
  /**
   * Get target row and column indices for specified items
   * @param {Object} target - Target sheet configuration
   * @param {string} rowItemName - Name of the row item to find
   * @param {string} colItemName - Name of the column item to find
   * @return {Object} Object with row and col indices
   */
  getTargetRowCol(target, rowItemName, colItemName) {
    try {
      return {
        col: this.getRowCol.getTargetColIndex(target.sheet, target.termRowIdx, colItemName),
        row: this.getRowCol.getTargetRowIndex(target.sheet, 1, rowItemName)
      };
    } catch (error) {
      throw new Error(`Failed to get target row/col for ${target.name}: ${error.message}`);
    }
  }
  
  /**
   * Calculate both vertical and horizontal totals for comparison
   * @param {Object} target - Target sheet configuration
   * @param {Object} totalRowCol - Row and column indices for total
   * @return {Object} Object with horizontalTotal and verticalTotal
   */
  getVerticalHorizontalTotal(target, totalRowCol) {
    return {
      horizontalTotal: this.getHorizontalTotal(target, totalRowCol),
      verticalTotal: this.getVerticalTotal(target, totalRowCol)
    };
  }
  
  /**
   * Calculate horizontal total (sum across columns)
   * @param {Object} target - Target sheet configuration
   * @param {Object} totalRowCol - Row and column indices
   * @return {number} Horizontal total
   */
  getHorizontalTotal(target, totalRowCol) {
    const targetRow = target.totalValues[totalRowCol.row];
    const relevantValues = targetRow.slice(target.setupIdx, totalRowCol.col);
    return relevantValues.filter(value => value > 0).reduce((sum, value) => sum + value, 0);
  }
  
  /**
   * Calculate vertical total (sum down rows)
   * @param {Object} target - Target sheet configuration
   * @param {Object} totalRowCol - Row and column indices
   * @return {number} Vertical total
   */
  getVerticalTotal(target, totalRowCol) {
    return target.totalValues
      .filter((row, idx) => row[totalRowCol.col] > 0 && idx < totalRowCol.row)
      .map(row => row[totalRowCol.col])
      .reduce((sum, value) => sum + value, 0);
  }
  
  /**
   * Compare totals across all target sheets
   * @return {Array} Array with [status, message]
   */
  compareTotal() {
    try {
      const results = this.targets.map(target => {
        const totalRowCol = this.getTargetRowCol(target, '合計', '合計');
        const totals = this.getVerticalHorizontalTotal(target, totalRowCol);
        return totals.horizontalTotal === totals.verticalTotal;
      });
      
      const allMatch = results.every(result => result);
      return [allMatch ? 'OK' : 'NG：値が想定と異なる', 'Total2, Total3の縦計と横計のチェック'];
    } catch (error) {
      return ['NG：エラーが発生しました', `比較処理でエラー: ${error.message}`];
    }
  }
  
  /**
   * Compare discount totals with 1 yen tolerance
   * @return {Array} Array of boolean results for each sheet
   */
  compareDiscountTotal() {
    try {
      return this.targets.map(target => {
        const totalRowCol = this.getTargetRowCol(target, '合計', '合計');
        const verticalDiscountTotal = this.getVerticalTotal(target, totalRowCol) * (1 - this.discountRate);
        
        const discountRowCol = this.getTargetRowCol(target, '特別値引後合計', '合計');
        const horizontalDiscountTotal = this.getHorizontalTotal(target, discountRowCol);
        
        return Math.abs(horizontalDiscountTotal - verticalDiscountTotal) <= 1;
      });
    } catch (error) {
      console.error('Error in compareDiscountTotal:', error);
      return [false, false];
    }
  }
  
  /**
   * Check if comparison results are equal
   * @param {Object} compareTarget - Object with horizontalTotal and verticalTotal
   * @return {boolean} True if totals are equal
   */
  getComparisonResultEqual(compareTarget) {
    return compareTarget.horizontalTotal === compareTarget.verticalTotal;
  }
}

/**
 * Wrapper function to compare Total2/Total3 vertical and horizontal totals
 * @return {Array} Array with [status, message]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_() {
  try {
    const comparer = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
    return comparer.compareTotal();
  } catch (error) {
    return ['NG：エラーが発生しました', `Total2/Total3比較でエラー: ${error.message}`];
  }
}

/**
 * Wrapper function to compare Total2/Total3 discount totals
 * @return {Array} Array with [status, message]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_() {
  try {
    const comparer = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
    const results = comparer.compareDiscountTotal();
    const allMatch = results.every(result => result);
    return [allMatch ? 'OK' : 'NG', 'Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック'];
  } catch (error) {
    return ['NG：エラーが発生しました', `割引比較でエラー: ${error.message}`];
  }
}
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  return cp.compareTotal();
}
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_(){
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal;
  const res = cp.compareDiscountTotal();
  return [res.every(x => x) ? 'OK' : 'NG', 'Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック'];
}
