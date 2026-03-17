/**
 * SETUPシートに対して、SETUP関連の項目を適用する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {boolean} context.clinicalTrialsOfficeFlg 事務局フラグ
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applySetupItems_(context, inputValues) {
  const { sheetName, clinicalTrialsOfficeFlg } = context;

  if (sheetName !== QUOTATION_SHEET_NAMES.SETUP) {
    return inputValues;
  }

  const clinicalTrialsOffice = clinicalTrialsOfficeFlg
    ? setSetupClinicalTrialsOffice_(context)
    : "";

  const items = buildSetupSetItems_(clinicalTrialsOffice);

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * CLOSINGシートに対して、CLOSING関連の項目を適用する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {boolean} context.clinicalTrialsOfficeFlg 事務局フラグ
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applyClosingItems_(context, inputValues) {
  const { sheetName, clinicalTrialsOfficeFlg } = context;

  if (sheetName !== QUOTATION_SHEET_NAMES.CLOSING) {
    return inputValues;
  }

  const clinicalTrialsOffice = clinicalTrialsOfficeFlg ? 1 : "";

  const items = buildClosingSetItems_(clinicalTrialsOffice);

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * 登録期間内のシートにRegistration関連項目を適用する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {boolean} context.clinicalTrialsOfficeFlg 事務局フラグ
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applyRegistrationItems_(context, inputValues) {
  const { sheetName, clinicalTrialsOfficeFlg } = context;

  if (
    sheetName === QUOTATION_SHEET_NAMES.SETUP ||
    sheetName === QUOTATION_SHEET_NAMES.CLOSING
  ) {
    return inputValues;
  }

  const items = buildRegistrationItems_({
    sheetName,
    clinicalTrialsOfficeFlg,
  });

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * すべてのシート共通の項目を適用する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {number} context.trialTargetTerms 対象期間（月数）
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applyCommonItems_(context, inputValues) {
  const { sheetName, trialTargetTerms } = context;

  const items = buildCommonSetItems_(trialTargetTerms);

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * SETUP期間の臨床研究支援室対応の期間を取得する。
 *
 * @param {Object} context
 * @param {boolean} context.clinicalTrialsOfficeFlg 事務局フラグ
 * @return {number|string} SETUP期間の消費量
 */
function setSetupClinicalTrialsOffice_(context) {
  const { clinicalTrialsOfficeFlg } = context;
  if (!clinicalTrialsOfficeFlg) {
    return "";
  }

  return setSetupTerm_(
    context,
    SCRIPT_PROPERTY_KEYS.REG1_SETUP_CLINICAL_TRIALS_OFFICE,
  );
}

/**
 * SETUP期間の消費量を計算し、残期間を次年度へ繰り越すための処理
 *
 * - Script Properties に保存されている setup_term（SETUPの残期間）を取得する
 * - trialTargetTerms（当年度で消費可能な期間）分だけ SETUP期間を消費する
 * - 消費後に残った SETUP期間は、指定したプロパティ名で保存し、
 *   次年度以降に繰り越される
 * - 実際の消費量と残量の計算ロジックは calculateSetupTermResult_ に委譲する
 *
 * @param {string} propertyName
 *   消費後の SETUP期間（残期間）を保存する Script Properties のキー
 *
 * @return {number}
 *   当年度で消費された SETUP期間
 */
function setSetupTerm_(context, propertyName) {
  const { trialTargetTerms } = context;
  const scriptProperties = PropertiesService.getScriptProperties();

  const setupTerm =
    parseInt(
      scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
      10,
    ) || 0;

  const { consumed, remaining } = calculateSetupTermResult_(
    setupTerm,
    trialTargetTerms,
  );

  setScriptProperty_(propertyName, remaining, scriptProperties);

  return consumed;
}

/**
 * SETUP以外の期間に対してデータベース管理費の項目を適用する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {number} context.trialTargetTerms 対象期間（月数）
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applyNonSetupItems_(context, inputValues) {
  const { sheetName, trialTargetTerms } = context;

  const scriptProperties = PropertiesService.getScriptProperties();

  // Setupシートだけ特別処理
  if (sheetName === QUOTATION_SHEET_NAMES.SETUP) {
    setSetupTerm_(context, SCRIPT_PROPERTY_KEYS.REG1_SETUP_DATABASE_MANAGEMENT);
  }

  const setupTerm = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );

  if (shouldSkipDatabaseManagement_(sheetName, trialTargetTerms, setupTerm)) {
    return inputValues;
  }

  const databaseManagementTerm = calculateDatabaseManagementTerm_(
    sheetName,
    trialTargetTerms,
    scriptProperties,
  );

  const items = [
    [ITEMS_SHEET.ITEMNAMES.DATABASE_MANAGEMENT_FEE, databaseManagementTerm],
  ];

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * 登録期間に応じた項目を計算し適用する。
 *
 * @param {Object} context
 * @param {number[][]} inputValues 対象列の現在の値
 * @return {number[][]} 更新後の値
 */
function applyRegistrationTermItems_(context, inputValues) {
  const {
    sheetName,
    trialTargetTerms,
    trialStartDate,
    trialEndDate,
    trialTargetStartDate,
    trialTargetEndDate,
    clinicalTrialsOfficeFlg,
  } = context;

  const scriptProperties = PropertiesService.getScriptProperties();

  const setupTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );

  const closingTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
  );

  if (
    shouldSkipRegistrationTermItems_(
      sheetName,
      trialTargetTerms,
      setupTermLimit,
      closingTermLimit,
    )
  ) {
    return inputValues;
  }

  const registrationDateList = {
    trialTargetTerms,
    trialStartDate,
    trialEndDate,
    trialTargetStartDate,
    trialTargetEndDate,
  };

  const items = buildRegistrationTermItems_({
    registrationDateList,
    sheetName,
    clinicalTrialsOfficeFlg,
  });

  return buildSheetValuesWithTargetItems_(sheetName, items, inputValues);
}

/**
 * 中間解析に関する項目を計算し、指定列へ反映する。
 *
 * @param {Object} context
 * @param {string} context.sheetName 対象シート名
 * @param {string} context.columnName 書き込み対象列名
 */
function applyInterimAnalysis_(context) {
  const { sheetName, columnName } = context;

  const scriptProperties = PropertiesService.getScriptProperties();

  const trialType = scriptProperties.getProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
  );

  const interimTableCount = get_quotation_request_value_(
    QUOTATION_REQUEST_SHEET.ITEMNAMES
      .INTERIM_ANALYSIS_REQUIRED_TABLE_FIGURE_COUNT,
  );

  const dataCleaningBefore = getTargetItemCount_(
    sheetName,
    ITEMS_SHEET.ITEMNAMES.DATA_CLEANING,
  );

  const items = buildInterimAnalysisItems_({
    trialType,
    interimTableCount,
    dataCleaningBefore,
  });

  const values = buildSheetValuesWithTargetItems_(sheetName, items, null);

  setColumnValues_(sheetName, columnName, values);
}
