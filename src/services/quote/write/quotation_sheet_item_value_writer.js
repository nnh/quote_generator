function getSetValues_(context, target_items, inputValues) {
  return buildSheetValuesWithTargetItems_(
    context.sheetName,
    target_items,
    inputValues,
  );
}
function getTargetRange_(context) {
  return getColumnRange_(context.sheetName, context.target_col);
}
function getSheetValues_(context) {
  return getTargetCountValues_(context.sheetName, context.target_col);
}
function getItemCountFromContext_(context, itemname) {
  return getTargetItemCount_(context.sheetName, itemname);
}
function applySetupItems_(context, inputValues) {
  if (context.sheetName !== QUOTATION_SHEET_NAMES.SETUP) {
    return inputValues;
  }

  const clinicalTrialsOffice = context.clinicalTrialsOfficeFlg
    ? setSetupClinicalTrialsOffice_(context)
    : "";

  const setItemsList = buildSetupSetItems_(clinicalTrialsOffice);

  return getSetValues_(context, setItemsList, inputValues);
}
function setSetupClinicalTrialsOffice_(context) {
  if (!context.clinicalTrialsOfficeFlg) {
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
 * @param {string} property_name
 *   消費後の SETUP期間（残期間）を保存する Script Properties のキー
 *
 * @return {number}
 *   当年度で消費された SETUP期間
 */
function setSetupTerm_(context, property_name) {
  const properties = PropertiesService.getScriptProperties();

  const setupTerm =
    parseInt(properties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM), 10) || 0;

  const { consumed, remaining } = calculateSetupTermResult_(
    setupTerm,
    context.trialTargetTerms,
  );

  properties.setProperty(property_name, remaining);

  return consumed;
}
function applyClosingItems_(context, inputValues) {
  if (context.sheetName !== QUOTATION_SHEET_NAMES.CLOSING) {
    return inputValues;
  }

  const clinicalTrialsOffice = context.clinicalTrialsOfficeFlg ? 1 : "";

  const setItemsList = buildClosingSetItems_(clinicalTrialsOffice);

  return getSetValues_(context, setItemsList, inputValues);
}
function applyRegistrationItems_(context, inputValues) {
  if (
    context.sheetName === QUOTATION_SHEET_NAMES.SETUP ||
    context.sheetName === QUOTATION_SHEET_NAMES.CLOSING
  ) {
    return inputValues;
  }

  const setItemsList = buildRegistrationItems_({
    sheetName: context.sheetName,
    clinicalTrialsOfficeFlg: context.clinicalTrialsOfficeFlg,
  });

  return getSetValues_(context, setItemsList, inputValues);
}
function applyCommonItems_(context, inputValues) {
  const setItemsList = buildCommonSetItems_(context.trialTargetTerms);

  return getSetValues_(context, setItemsList, inputValues);
}
function applyNonSetupItems_(context, inputValues) {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Setupシートだけ特別処理
  if (context.sheetName === QUOTATION_SHEET_NAMES.SETUP) {
    setSetupTerm_(context, SCRIPT_PROPERTY_KEYS.REG1_SETUP_DATABASE_MANAGEMENT);
  }

  const setupTerm = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );

  if (
    shouldSkipDatabaseManagement_(
      context.sheetName,
      context.trialTargetTerms,
      setupTerm,
    )
  ) {
    return inputValues;
  }

  const databaseManagementTerm = calculateDatabaseManagementTerm_(
    context.sheetName,
    context.trialTargetTerms,
    scriptProperties,
  );

  const setItemsList = [
    [ITEMS_SHEET.ITEMNAMES.DATABASE_MANAGEMENT_FEE, databaseManagementTerm],
  ];

  return getSetValues_(context, setItemsList, inputValues);
}
function applyRegistrationTermItems_(context, inputValues) {
  const scriptProperties = PropertiesService.getScriptProperties();

  const setupTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );
  const closingTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
  );

  if (
    shouldSkipRegistrationTermItems_(
      context.sheetName,
      context.trialTargetTerms,
      setupTermLimit,
      closingTermLimit,
    )
  ) {
    return inputValues;
  }

  const registrationDateList = {
    trialTargetTerms: context.trialTargetTerms,
    trialStartDate: context.trialStartDate,
    trialEndDate: context.trialEndDate,
    trialTargetStartDate: context.trialTargetStartDate,
    trialTargetEndDate: context.trialTargetEndDate,
  };

  const targetItems = buildRegistrationTermItems_({
    registrationDateList,
    sheetName: context.sheetName,
    clinicalTrialsOfficeFlg: context.clinicalTrialsOfficeFlg,
  });

  return getSetValues_(context, targetItems, inputValues);
}
function applyInterimAnalysis_(context) {
  const scriptProperties = PropertiesService.getScriptProperties();

  const trialType = scriptProperties.getProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
  );

  const interimTableCount =
    get_quotation_request_value_("中間解析に必要な図表数");

  const dataCleaningBefore = getItemCountFromContext_(
    context,
    ITEMS_SHEET.ITEMNAMES.DATA_CLEANING,
  );

  const setItems = buildInterimAnalysisItems_({
    trialType,
    interimTableCount,
    dataCleaningBefore,
  });

  const values = getSetValues_(context, setItems, null);

  setColumnValues_(context.sheetName, context.columnName, values);
}
