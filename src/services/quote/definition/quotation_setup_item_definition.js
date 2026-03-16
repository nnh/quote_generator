/**
 * Setupシート用の項目名と値のリストを生成する
 *
 * @param {boolean|number|string} clinicalTrialsOfficeSetupValue
 *   「事務局運営」の設定値
 *
 * @return {Array<Array<string, number|string>>}
 *   Setupシートに設定する [項目名, 値] の配列
 */
function buildSetupSetItems_(clinicalTrialsOfficeSetupValue) {
  const setupItemsList = createSetupItemsList_(clinicalTrialsOfficeSetupValue);
  return convertItemsMapToList_(setupItemsList);
}

/**
 * 試験種別に応じたSetupシート設定を取得する
 *
 * ScriptProperties に保存されている試験種別を参照し、
 * Setupシートで使用する項目名と値の設定を返す。
 *
 * @return {{
 *   sopValue:number,
 *   officeIrbItemName:string,
 *   officeIrbValue:number|string,
 *   setAccountsItemName:string,
 *   drugSupportValue:number|string,
 *   specifiedClinicalSupportValue:number|string
 * }}
 * 試験種別ごとの設定値
 */
function getSetupTrialTypeConfig_() {
  const scriptProps = PropertiesService.getScriptProperties();

  const config = {
    sopValue: 0,

    officeIrbItemName:
      ITEMS_SHEET.ITEMNAMES.IRB_PREPARATION_AND_APPROVAL_CONFIRMATION,

    officeIrbValue: 0,

    setAccountsItemName:
      ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP_AND_IRB_APPROVAL_CONFIRMATION,

    drugSupportValue: 0,

    specifiedClinicalSupportValue: 0,
  };

  const trialType = scriptProps.getProperty(
    SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
  );

  if (trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED) {
    config.sopValue = 1;

    config.officeIrbItemName =
      ITEMS_SHEET.ITEMNAMES.IRB_APPROVAL_CONFIRMATION_AND_FACILITY_MANAGEMENT;

    config.officeIrbValue = FUNCTION_FORMULAS.FACILITIES;

    config.setAccountsItemName = ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP;

    config.drugSupportValue = FUNCTION_FORMULAS.FACILITIES;
  }

  if (trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL) {
    config.specifiedClinicalSupportValue = FUNCTION_FORMULAS.FACILITIES;
  }

  return config;
}

/**
 * IRB関連の計算式を生成する
 *
 * @return {string}
 *   スプレッドシートに設定するIF関数の式
 */
function buildDmIrbFormula_() {
  return `=IF(ISBLANK(${TRIAL_SHEET.NAME}!C${TRIAL_SHEET.ROWS.FACILITIES}),
${TRIAL_SHEET.NAME}!B${TRIAL_SHEET.ROWS.FACILITIES},
${TRIAL_SHEET.NAME}!C${TRIAL_SHEET.ROWS.TRIAL_CONST_FACILITIES})`;
}

/**
 * Setupシートに設定する項目と値のMapを生成する
 *
 * quotation_request シートの入力値を参照して
 * Setupシートに設定する項目名と値を作成する。
 *
 * @param {boolean|number|string} clinicalTrialsOfficeSetupValue
 *   「治験事務局設置」の設定値
 *
 * @return {Map<string, number|string>}
 *   key: Setupシートの項目名
 *   value: 設定する値または数式
 */
function createSetupItemsList_(clinicalTrialsOfficeSetupValue) {
  const {
    sopValue,
    officeIrbItemName,
    officeIrbValue,
    setAccountsItemName,
    drugSupportValue,
    specifiedClinicalSupportValue,
  } = getSetupTrialTypeConfig_();

  const dmIrbFormula = buildDmIrbFormula_();

  const getRequestValue = (itemName) => get_quotation_request_value_(itemName);

  const yesValue = (itemName, value = 1) =>
    returnIfEquals_(
      getRequestValue(itemName),
      COMMON_EXISTENCE_LABELS.YES,
      value,
    );

  const greaterThanValue = (itemName, threshold, value = 1) =>
    returnIfGreaterThan_(getRequestValue(itemName), threshold, value);

  const setupItems = [
    [ITEMS_SHEET.ITEMNAMES.PROTOCOL_REVIEW_AND_CREATION_SUPPORT, 1],
    [ITEMS_SHEET.ITEMNAMES.REVIEW_MEETING_EXECUTION_REMOTE, 4],

    [
      ITEMS_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT,
      yesValue(QUOTATION_REQUEST_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT,
      yesValue(QUOTATION_REQUEST_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.SPECIFIED_CLINICAL_RESEARCH_APPLICATION_SUPPORT,
      specifiedClinicalSupportValue,
    ],

    [
      ITEMS_SHEET.ITEMNAMES.KICKOFF_MEETING_PREPARATION_AND_EXECUTION,
      yesValue(QUOTATION_REQUEST_SHEET.ITEMNAMES.KICKOFF_MEETING),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.SOP_AND_CTR_REGISTRATION_AND_TMF_MANAGEMENT,
      sopValue,
    ],

    [
      ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_SETUP,
      clinicalTrialsOfficeSetupValue,
    ],

    [officeIrbItemName, officeIrbValue],

    [ITEMS_SHEET.ITEMNAMES.DRUG_SUPPORT, drugSupportValue],

    [
      ITEMS_SHEET.ITEMNAMES.MONITORING_PREPARATION,
      greaterThanValue(
        QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE,
        0,
      ),
    ],

    [ITEMS_SHEET.ITEMNAMES.EDC_LICENSE_AND_DATABASE_SETUP, 1],

    [
      ITEMS_SHEET.ITEMNAMES.BUSINESS_ANALYSIS_DM_PLAN_AND_CTR_REGISTRATION_PLAN,
      1,
    ],

    [ITEMS_SHEET.ITEMNAMES.DB_CREATION_ECRF_CREATION_AND_VALIDATION, 1],

    [ITEMS_SHEET.ITEMNAMES.VALIDATION_REPORT, 1],

    [setAccountsItemName, dmIrbFormula],

    [ITEMS_SHEET.ITEMNAMES.INPUT_GUIDE_CREATION, 1],

    [
      ITEMS_SHEET.ITEMNAMES.EXTERNAL_AUDIT_FEE,
      greaterThanValue(
        QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
        0,
      ),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.PREPARE_FEE,
      yesValue(
        QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE,
        FUNCTION_FORMULAS.FACILITIES,
      ),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.INSURANCE_FEE,
      greaterThanValue(QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE, 0),
    ],

    [
      ITEMS_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL,
      yesValue(QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL),
    ],
  ];

  return new Map(setupItems);
}
