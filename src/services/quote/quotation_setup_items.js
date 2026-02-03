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
    office_irb_str: "IRB準備・承認確認",
    office_irb: "",
    set_accounts: "初期アカウント設定（施設・ユーザー）、IRB承認確認",
    drug_support: "",
    specified_clinical_support: "",
  };

  if (
    get_s_p.getProperty("trial_type_value") ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
  ) {
    config.sop = 1;
    config.office_irb_str = "IRB承認確認、施設管理";
    config.office_irb = FUNCTION_FORMULAS.FACILITIES;
    config.set_accounts = "初期アカウント設定（施設・ユーザー）";
    config.drug_support = FUNCTION_FORMULAS.FACILITIES;
  }
  if (
    get_s_p.getProperty("trial_type_value") ===
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
      "PMDA相談資料作成支援",
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const amed_support = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      "AMED申請資料作成支援",
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const kickoff_meeting = returnIfEquals_(
    get_quotation_request_value_(
      array_quotation_request,
      "キックオフミーティング",
    ),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  const monitoring_prep = returnIfGreaterThan_(
    get_quotation_request_value_(
      array_quotation_request,
      "1例あたりの実地モニタリング回数",
    ),
    0,
    1,
  );

  const audit_fee = returnIfGreaterThan_(
    get_quotation_request_value_(array_quotation_request, "監査対象施設数"),
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
    get_quotation_request_value_(array_quotation_request, "治験薬管理"),
    COMMON_EXISTENCE_LABELS.YES,
    1,
  );

  return new Map([
    ["プロトコルレビュー・作成支援", 1],
    ["検討会実施（TV会議等）", 4],
    ["PMDA相談資料作成支援", pmda_support],
    ["AMED申請資料作成支援", amed_support],
    ["特定臨床研究法申請資料作成支援", specified_clinical_support],
    ["キックオフミーティング準備・実行", kickoff_meeting],
    ["SOP一式、CTR登録案、TMF管理", sop],
    ["事務局運営（試験開始前）", clinical_trials_office],
    [office_irb_str, office_irb],
    ["薬剤対応", drug_support],
    ["モニタリング準備業務（関連資料作成）", monitoring_prep],
    ["EDCライセンス・データベースセットアップ", 1],
    ["業務分析・DM計画書の作成・CTR登録案の作成", 1],
    ["DB作成・eCRF作成・バリデーション", 1],
    ["バリデーション報告書", 1],
    [set_accounts, dm_irb],
    ["入力の手引作成", 1],
    ["外部監査費用", audit_fee],
    [ITEMS_SHEET.ITEMNAMES.PREPARE_FEE, prepare_fee],
    ["保険料", insurance_fee],
    ["治験薬管理（中央）", drug_management],
  ]);
}
