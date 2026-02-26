/**
 * Setupシート用の項目と値のリストを生成する
 * @param {Array} array_quotation_request
 * @param {boolean|number|string} clinical_trials_office
 * @return {Array<Array>}
 */
function buildSetupSetItems_(array_quotation_request, clinical_trials_office) {
  const setupItemsList = createSetupItemsList_(
    array_quotation_request,
    clinical_trials_office,
  );
  return convertItemsMapToList_(setupItemsList);
}
function getSetupTrialTypeConfig_() {
  const get_s_p = PropertiesService.getScriptProperties();

  const config = {
    sop: "",
    office_irb_str:
      ITEMS_SHEET.ITEMNAMES.IRB_PREPARATION_AND_APPROVAL_CONFIRMATION,
    office_irb: "",
    set_accounts:
      ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP_AND_IRB_APPROVAL_CONFIRMATION,
    drug_support: "",
    specified_clinical_support: "",
  };

  if (
    get_s_p.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE) ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
  ) {
    config.sop = 1;
    config.office_irb_str =
      ITEMS_SHEET.ITEMNAMES.IRB_APPROVAL_CONFIRMATION_AND_FACILITY_MANAGEMENT;
    config.office_irb = FUNCTION_FORMULAS.FACILITIES;
    config.set_accounts = ITEMS_SHEET.ITEMNAMES.INITIAL_ACCOUNT_SETUP;
    config.drug_support = FUNCTION_FORMULAS.FACILITIES;
  }
  if (
    get_s_p.getProperty(SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE) ===
    TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL
  ) {
    config.specified_clinical_support = FUNCTION_FORMULAS.FACILITIES;
  }

  return config;
}
function buildDmIrbFormula_() {
  return (
    "=if(isblank(" +
    TRIAL_SHEET.NAME +
    "!C" +
    TRIAL_SHEET.ROWS.FACILITIES +
    "), " +
    TRIAL_SHEET.NAME +
    "!B" +
    TRIAL_SHEET.ROWS.FACILITIES +
    "," +
    TRIAL_SHEET.NAME +
    "!C" +
    TRIAL_SHEET.ROWS.TRIAL_CONST_FACILITIES +
    ")"
  );
}
function createSetupItemsList_(
  array_quotation_request,
  clinical_trials_office,
) {
  const {
    sop,
    office_irb_str,
    office_irb,
    set_accounts,
    drug_support,
    specified_clinical_support,
  } = getSetupTrialTypeConfig_();

  const dm_irb = buildDmIrbFormula_();
  const pmda_support = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const amed_support = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const kickoff_meeting = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.KICKOFF_MEETING,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const monitoring_prep = returnIfGreaterThan_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.MONITORING_COUNT_PER_CASE,
    ),
    0,
    1,
  );

  const audit_fee = returnIfGreaterThan_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.AUDIT_TARGET_FACILITIES,
    ),
    0,
    1,
  );

  const prepare_fee = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    FUNCTION_FORMULAS.FACILITIES,
  );

  const insurance_fee = returnIfGreaterThan_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE,
    ),
    0,
    1,
  );

  const drug_management = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL,
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  return new Map([
    [ITEMS_SHEET.ITEMNAMES.PROTOCOL_REVIEW_AND_CREATION_SUPPORT, 1],
    [ITEMS_SHEET.ITEMNAMES.REVIEW_MEETING_EXECUTION_REMOTE, 4],
    [ITEMS_SHEET.ITEMNAMES.PMDA_CONSULTATION_SUPPORT, pmda_support],
    [ITEMS_SHEET.ITEMNAMES.AMED_APPLICATION_SUPPORT, amed_support],
    [
      ITEMS_SHEET.ITEMNAMES.SPECIFIED_CLINICAL_RESEARCH_APPLICATION_SUPPORT,
      specified_clinical_support,
    ],
    [
      ITEMS_SHEET.ITEMNAMES.KICKOFF_MEETING_PREPARATION_AND_EXECUTION,
      kickoff_meeting,
    ],
    [ITEMS_SHEET.ITEMNAMES.SOP_AND_CTR_REGISTRATION_AND_TMF_MANAGEMENT, sop],
    [
      ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_SETUP,
      clinical_trials_office,
    ],
    [office_irb_str, office_irb],
    [ITEMS_SHEET.ITEMNAMES.DRUG_SUPPORT, drug_support],
    [ITEMS_SHEET.ITEMNAMES.MONITORING_PREPARATION, monitoring_prep],
    [ITEMS_SHEET.ITEMNAMES.EDC_LICENSE_AND_DATABASE_SETUP, 1],
    [
      ITEMS_SHEET.ITEMNAMES.BUSINESS_ANALYSIS_DM_PLAN_AND_CTR_REGISTRATION_PLAN,
      1,
    ],
    [ITEMS_SHEET.ITEMNAMES.DB_CREATION_ECRF_CREATION_AND_VALIDATION, 1],
    [ITEMS_SHEET.ITEMNAMES.VALIDATION_REPORT, 1],
    [set_accounts, dm_irb],
    [ITEMS_SHEET.ITEMNAMES.INPUT_GUIDE_CREATION, 1],
    [ITEMS_SHEET.ITEMNAMES.EXTERNAL_AUDIT_FEE, audit_fee],
    [ITEMS_SHEET.ITEMNAMES.PREPARE_FEE, prepare_fee],
    [ITEMS_SHEET.ITEMNAMES.INSURANCE_FEE, insurance_fee],
    [ITEMS_SHEET.ITEMNAMES.DRUG_MANAGEMENT_CENTRAL, drug_management],
  ]);
}
