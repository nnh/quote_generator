function buildRegistrationTermItems_(context) {
  const registrationSetItems = setRegistrationTermItems_(context);
  return convertItemsMapToList_(registrationSetItems);
}
function calcRegistrationMonthFromDates_(dates) {
  return calcRegistrationMonth_({
    trial_target_terms: dates.trial_target_terms,
    trial_start_date: dates.trial_start_date,
    trial_end_date: dates.trial_end_date,
    trial_target_start_date: dates.trial_target_start_date,
    trial_target_end_date: dates.trial_target_end_date,
  });
}

function setRegistrationTermItems_(context) {
  const {
    sheetname,
    array_quotation_request,
    clinical_trials_office_flg,
    date_list,
  } = context;

  if (!date_list) {
    throw new Error(
      "setRegistrationTermItems_: context.date_list is required. " +
        "Date fields must not be placed directly on context.",
    );
  }
  const registrationMonth = calcRegistrationMonthFromDates_(date_list);

  const CONDITIONAL_ITEMS = [
    {
      requestItemName:
        QUOTATION_REQUEST_SHEET.ITEMNAMES.SAFETY_MANAGEMENT_OFFICE_EXISTENCE,
      expectedValue: SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.YES,
      itemName: ITEMS_SHEET.ITEMNAMES.SAFETY_MANAGEMENT_OFFICE,
    },
    {
      requestItemName:
        QUOTATION_REQUEST_SHEET.ITEMNAMES
          .EFFICACY_SAFETY_COMMITTEE_OFFICE_EXISTENCE,
      expectedValue: SETUP_OR_OUTSOURCE_EXISTENCE_LABELS.YES,
      itemName: ITEMS_SHEET.ITEMNAMES.EFFICACY_SAFETY_COMMITTEE_OFFICE,
    },
  ];
  const conditional_items = CONDITIONAL_ITEMS.map(
    ({ requestItemName, expectedValue, itemName }) =>
      returnIfEquals_(
        get_quotation_request_value_(array_quotation_request, requestItemName),
        expectedValue,
        itemName,
      ),
  )
    .filter(Boolean)
    .map((itemName) => [itemName, registrationMonth]);
  const base_items = [
    [ITEMS_SHEET.ITEMNAMES.CENTRAL_MONITORING, registrationMonth],
  ];

  const clinical_trials_office_items = buildClinicalTrialsOfficeItems_({
    clinicalTrialsOfficeFlg: clinical_trials_office_flg,
    registrationMonth,
    sheetname,
  });

  const result = new Map([
    ...base_items,
    ...conditional_items,
    ...clinical_trials_office_items,
  ]);

  return result;
}
/**
 * 事務局運営に関する Setup / Registration の値を計算する
 *
 * @param {Object} params
 * @param {boolean} params.clinicalTrialsOfficeFlg
 * @param {number} params.registrationMonth
 * @param {string} params.sheetname
 * @param {PropertiesService.Properties} params.scriptProperties
 *
 * @returns {{ setupOffice: number, registrationOffice: number }}
 */
function calcClinicalTrialsOfficeValues_(params) {
  const { clinicalTrialsOfficeFlg, registrationMonth, sheetname } = params;
  const scriptProperties = PropertiesService.getScriptProperties();

  let setupOffice = 0;
  let registrationOffice = 0;

  if (clinicalTrialsOfficeFlg) {
    registrationOffice = registrationMonth;

    if (sheetname === QUOTATION_SHEET_NAMES.REGISTRATION_1) {
      setupOffice =
        Number(
          scriptProperties.getProperty(
            SCRIPT_PROPERTY_KEYS.REG1_SETUP_CLINICAL_TRIALS_OFFICE,
          ),
        ) || 0;
    }
  }

  return {
    setupOffice,
    registrationOffice,
  };
}
function buildClinicalTrialsOfficeItems_({
  clinicalTrialsOfficeFlg,
  registrationMonth,
  sheetname,
}) {
  const { setupOffice, registrationOffice } = calcClinicalTrialsOfficeValues_({
    clinicalTrialsOfficeFlg,
    registrationMonth,
    sheetname,
  });

  return [
    [ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_SETUP, setupOffice],
    [
      ITEMS_SHEET.ITEMNAMES.CLINICAL_TRIALS_OFFICE_REGISTRATION,
      registrationOffice,
    ],
  ].filter(([, value]) => value > 0);
}
/**
 * 対象シート・期間条件から処理をスキップすべきか判定する
 * @param {string} sheetname
 * @param {number} trialTargetTerms
 * @param {number} setupTermLimit
 * @param {number} closingTermLimit
 * @return {boolean} true の場合は処理をスキップ
 */
function shouldSkipRegistrationTermItems_(
  sheetname,
  trialTargetTerms,
  setupTermLimit,
  closingTermLimit,
) {
  if (
    (sheetname === QUOTATION_SHEET_NAMES.SETUP &&
      trialTargetTerms < setupTermLimit) ||
    (sheetname === QUOTATION_SHEET_NAMES.CLOSING &&
      trialTargetTerms < closingTermLimit)
  ) {
    return true;
  }
  return false;
}
