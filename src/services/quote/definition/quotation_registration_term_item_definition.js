/**
 * Registrationシートで条件付きで追加する項目定義
 * - 安全性管理事務局
 * - 効安事務局
 *
 * @type {Array<{
 *   requestItemName: string,
 *   expectedValue: string,
 *   itemName: string
 * }>}
 */
const REGISTRATION_CONDITIONAL_ITEMS = [
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

/**
 * Registration期間の対象アイテムを作成する
 *
 * @param {RegistrationContext} context
 * @returns {Array<[string, number]>} アイテム名と月数のリスト
 */
function buildRegistrationTermItems_(context) {
  const registrationItemsMap = setRegistrationTermItems_(context);
  return convertItemsMapToList_(registrationItemsMap);
}

/**
 * Registration期間の対象アイテムをMap形式で生成する
 *
 * @param {RegistrationContext} context
 * @returns {Map<string, number>} key: itemName, value: 月数
 */
function setRegistrationTermItems_(context) {
  const { sheetname, clinicalTrialsOfficeFlg, registrationDateList } = context;

  if (!registrationDateList) {
    throw new Error(
      `setRegistrationTermItems_: context.registrationDateList is required. Date fields must not be placed directly on context.`,
    );
  }
  const registrationMonth = calcRegistrationMonth_(registrationDateList);

  const conditionalItems = REGISTRATION_CONDITIONAL_ITEMS.flatMap(
    ({ requestItemName, expectedValue, itemName }) => {
      const value = getQuotationRequestValue_(requestItemName);
      return value === expectedValue ? [[itemName, registrationMonth]] : [];
    },
  );

  const baseItems = [
    [ITEMS_SHEET.ITEMNAMES.CENTRAL_MONITORING, registrationMonth],
  ];

  const clinicalTrialsOfficeItems = buildClinicalTrialsOfficeItems_({
    clinicalTrialsOfficeFlg,
    registrationMonth,
    sheetname,
  });

  const items = [
    ...baseItems,
    ...conditionalItems,
    ...clinicalTrialsOfficeItems,
  ];
  return new Map(items);
}

/**
 * 事務局運営に関する Setup / Registration の値を計算する
 *
 * @param {Object} params
 * @param {boolean} params.clinicalTrialsOfficeFlg 事務局運営フラグ
 * @param {number} params.registrationMonth Registration期間（月）
 * @param {string} params.sheetname 対象シート名
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
          getScriptProperty_(
            SCRIPT_PROPERTY_KEYS.REG1_SETUP_CLINICAL_TRIALS_OFFICE,
            scriptProperties,
          ),
        ) || 0;
    }
  }

  return {
    setupOffice,
    registrationOffice,
  };
}

/**
 * 事務局運営に関するアイテムリストを作成する
 *
 * @param {Object} params
 * @param {boolean} params.clinicalTrialsOfficeFlg
 * @param {number} params.registrationMonth
 * @param {string} params.sheetname
 *
 * @returns {Array<[string, number]>} アイテム名と月数
 */
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

  // 値が0の項目は出力しない
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
 * @param {string} sheetname 対象シート名
 * @param {number} trialTargetTerms 試験対象期間
 * @param {number} setupTermLimit Setup期間の制限
 * @param {number} closingTermLimit Closing期間の制限
 * @return {boolean} true の場合は処理をスキップ
 */
function shouldSkipRegistrationTermItems_(
  sheetname,
  trialTargetTerms,
  setupTermLimit,
  closingTermLimit,
) {
  return (
    (sheetname === QUOTATION_SHEET_NAMES.SETUP &&
      trialTargetTerms < setupTermLimit) ||
    (sheetname === QUOTATION_SHEET_NAMES.CLOSING &&
      trialTargetTerms < closingTermLimit)
  );
}

/**
 * Registration処理用コンテキスト
 * @typedef {Object} RegistrationContext
 * @property {string} sheetname 対象シート名
 * @property {boolean} clinicalTrialsOfficeFlg 事務局運営フラグ
 * @property {RegistrationDateList} registrationDateList Registration期間計算用日付情報
 */

/**
 * Registration期間計算に使用する日付情報
 * calcRegistrationMonth_ に渡されるパラメータ
 *
 * @typedef {Object} RegistrationDateList
 * @property {number} trialTargetTerms 対象期間（月）
 * @property {Date|string} trialStartDate 試験開始日
 * @property {Date|string} trialEndDate 試験終了日
 * @property {Date|string} trialTargetStartDate 対象期間開始日
 * @property {Date|string} trialTargetEndDate 対象期間終了日
 */
