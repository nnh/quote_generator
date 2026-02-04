function setRegistrationTermItems_(input_values, context) {
  const date_list = context.date_list || context;
  const sheetname = context.sheetname;
  const clinical_trials_office_flg = context.clinical_trials_office_flg;
  const registration_month = calcRegistrationMonth_({
    trial_target_terms: date_list.trial_target_terms,
    trial_start_date: date_list.trial_start_date,
    trial_end_date: date_list.trial_end_date,
    trial_target_start_date: date_list.trial_target_start_date,
    trial_target_end_date: date_list.trial_target_end_date,
  });
  // 事務局運営
  const { setup_clinical_trials_office, registration_clinical_trials_office } =
    calcClinicalTrialsOfficeValues_({
      clinicalTrialsOfficeFlg: clinical_trials_office_flg,
      registrationMonth: registration_month,
      sheetname,
    });

  const central_monitoring = "ロジカルチェック、マニュアルチェック、クエリ対応";
  // 安全性管理、効安、事務局運営
  const ankan = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      "安全性管理事務局設置",
    ),
    "設置・委託する",
    "安全性管理事務局業務",
  );
  const kouan = returnIfEquals_(
    get_quotation_request_value_(array_quotation_request, "効安事務局設置"),
    "設置・委託する",
    "効果安全性評価委員会事務局業務",
  );
  const clinical_trials_office = [
    ["事務局運営（試験開始前）", setup_clinical_trials_office],
    [
      "事務局運営（試験開始後から試験終了まで）",
      registration_clinical_trials_office,
    ],
  ].filter((x) => x[1] > 0);
  const target_items = [central_monitoring, ankan, kouan]
    .filter((x) => x != "")
    .map((x) => [x, registration_month]);
  return this.getSetValues(
    target_items.concat(clinical_trials_office),
    sheetname,
    input_values,
  );
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
          scriptProperties.getProperty("reg1_setup_clinical_trials_office"),
        ) || 0;
    }
  }

  return {
    setupOffice,
    registrationOffice,
  };
}
