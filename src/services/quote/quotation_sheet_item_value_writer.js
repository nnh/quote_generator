/**
 * 年度別シート値設定クラス
 * - class SetSheetItemValues
 */
/*
class SetSheetItemValues {
  static build(sheetname, array_quotation_request) {
    return buildSheetContext_(sheetname, array_quotation_request);
  }
  static set_registration_term_items_(context, input_values) {
    return applyRegistrationTermItems_(context, input_values);
  }
  static getSetValues(context, target_items, input_values) {
    return getSetValues_(context, target_items, input_values);
  }
  static getTargetRange(context) {
    return getTargetRange_(context);
  }
  static getSheetValues(context) {
    return getSheetValues_(context);
  }
  static setSheetValues(context, sheetname, target_values) {
    setTargetCountValues_(sheetname, context.target_col, target_values);
  }
  static set_nonSetup_term_items_(context, input_values) {
    return applyNonSetupItems_(context, input_values);
  }
  static set_all_sheet_common_items_(context, input_values) {
    return applyCommonItems_(context, input_values);
  }
  static set_setup_items_(context, input_values) {
    return applySetupItems_(context, input_values);
  }
  static set_closing_items_(context, input_values) {
    return applyClosingItems_(context, input_values);
  }
  static set_registration_items_(context, input_values) {
    return applyRegistrationItems_(context, input_values);
  }
  static setInterimAnalysis(context) {
    applyInterimAnalysis_(context);
  }
  static getTargetItemCount(context, itemname) {
    return getItemCountFromContext_(context, itemname);
  }
}
*/
function getSetValues_(context, target_items, input_values) {
  return buildSheetValuesWithTargetItems_(
    context.sheetname,
    target_items,
    input_values,
  );
}
function getTargetRange_(context) {
  return getTargetCountRange_(context.sheetname, context.target_col);
}
function getSheetValues_(context) {
  return getTargetCountValues_(context.sheetname, context.target_col);
}
function getItemCountFromContext_(context, itemname) {
  return getTargetItemCount_(context.sheetname, itemname);
}
function applySetupItems_(context, input_values) {
  if (context.sheetname !== QUOTATION_SHEET_NAMES.SETUP) {
    return input_values;
  }

  const clinical_trials_office = context.clinical_trials_office_flg
    ? setSetupClinicalTrialsOffice_(context)
    : "";

  const set_items_list = buildSetupSetItems_(
    context.array_quotation_request,
    clinical_trials_office,
  );

  return getSetValues_(context, set_items_list, input_values);
}
function setSetupClinicalTrialsOffice_(context) {
  if (!context.clinical_trials_office_flg) {
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
 * - trial_target_terms（当年度で消費可能な期間）分だけ SETUP期間を消費する
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
    context.trial_target_terms,
  );

  properties.setProperty(property_name, remaining);

  return consumed;
}
function applyClosingItems_(context, input_values) {
  if (context.sheetname !== QUOTATION_SHEET_NAMES.CLOSING) {
    return input_values;
  }

  const clinical_trials_office = context.clinical_trials_office_flg ? 1 : "";

  const set_items_list = buildClosingSetItems_(
    context.array_quotation_request,
    clinical_trials_office,
  );

  return getSetValues_(context, set_items_list, input_values);
}
function applyRegistrationItems_(context, input_values) {
  if (
    context.sheetname === QUOTATION_SHEET_NAMES.SETUP ||
    context.sheetname === QUOTATION_SHEET_NAMES.CLOSING
  ) {
    return input_values;
  }

  const setItemsList = buildRegistrationSetItems_(
    context.array_quotation_request,
    context.sheetname,
  );

  return getSetValues_(context, setItemsList, input_values);
}
function applyCommonItems_(context, input_values) {
  const setItemsList = buildCommonSetItems_(context.trial_target_terms);

  return getSetValues_(context, setItemsList, input_values);
}
function applyNonSetupItems_(context, input_values) {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Setupシートだけ特別処理
  if (context.sheetname === QUOTATION_SHEET_NAMES.SETUP) {
    setSetupTerm_(context, SCRIPT_PROPERTY_KEYS.REG1_SETUP_DATABASE_MANAGEMENT);
  }

  const setupTerm = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );

  if (
    shouldSkipDatabaseManagement_(
      context.sheetname,
      context.trial_target_terms,
      setupTerm,
    )
  ) {
    return input_values;
  }

  const databaseManagementTerm = calculateDatabaseManagementTerm_(
    context.sheetname,
    context.trial_target_terms,
    scriptProperties,
  );

  const setItemsList = [
    [ITEMS_SHEET.ITEMNAMES.DATABASE_MANAGEMENT_FEE, databaseManagementTerm],
  ];

  return getSetValues_(context, setItemsList, input_values);
}
function applyRegistrationTermItems_(context, input_values) {
  const scriptProperties = PropertiesService.getScriptProperties();

  const setupTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM),
  );
  const closingTermLimit = Number(
    scriptProperties.getProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM),
  );

  if (
    shouldSkipRegistrationTermItems_(
      context.sheetname,
      context.trial_target_terms,
      setupTermLimit,
      closingTermLimit,
    )
  ) {
    return input_values;
  }

  const date_list = {
    trial_target_terms: context.trial_target_terms,
    trial_start_date: context.trial_start_date,
    trial_end_date: context.trial_end_date,
    trial_target_start_date: context.trial_target_start_date,
    trial_target_end_date: context.trial_target_end_date,
  };

  const target_items = buildRegistrationTermItems_({
    date_list,
    sheetname: context.sheetname,
    clinical_trials_office_flg: context.clinical_trials_office_flg,
    array_quotation_request: context.array_quotation_request,
  });

  return getSetValues_(context, target_items, input_values);
}
function applyInterimAnalysis_(context) {
  const scriptProperties = PropertiesService.getScriptProperties();

  const trialType = scriptProperties.getProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
  );

  const interimTableCount = get_quotation_request_value_(
    context.array_quotation_request,
    "中間解析に必要な図表数",
  );

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

  setTargetCountValues_(context.sheetname, context.target_col, values);
}
