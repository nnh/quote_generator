function setEditUsers_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const users = ss.getEditors();
  const protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  protections.forEach((protection) => {
    users.forEach((user) => protection.addEditor(user));
  });
}
/**
 * スクリプトプロパティの設定
 */
function register_script_property() {
  const get_s_p = PropertiesService.getScriptProperties();
  get_s_p.setProperty("quote_sheet_name", "Quote");
  get_s_p.setProperty("total_sheet_name", "Total");
  get_s_p.setProperty("total2_sheet_name", "Total2");
  get_s_p.setProperty("total3_sheet_name", "Total3");
  get_s_p.setProperty("setup_sheet_name", "Setup");
  get_s_p.setProperty("registration_1_sheet_name", "Registration_1");
  get_s_p.setProperty("registration_2_sheet_name", "Registration_2");
  get_s_p.setProperty("interim_1_sheet_name", "Interim_1");
  get_s_p.setProperty("observation_1_sheet_name", "Observation_1");
  get_s_p.setProperty("observation_2_sheet_name", "Observation_2");
  get_s_p.setProperty("interim_2_sheet_name", "Interim_2");
  get_s_p.setProperty("closing_sheet_name", "Closing");
  get_s_p.setProperty("trial_sheet_name", "Trial");
  get_s_p.setProperty("items_sheet_name", "Items");
  get_s_p.setProperty("quotation_request_sheet_name", "Quotation Request");
  get_s_p.setProperty("investigator_initiated_trial", "医師主導治験");
  get_s_p.setProperty("specified_clinical_trial", "特定臨床研究");
  get_s_p.setProperty("central_monitoring_str", "中央モニタリング");
  get_s_p.setProperty("flag_overflowing_setup", 0.0);
  get_s_p.setProperty("fy_sheet_items_col", 3);
  get_s_p.setProperty("trial_start_col", 4);
  get_s_p.setProperty("trial_end_col", 5);
  get_s_p.setProperty("trial_years_col", 3);
  get_s_p.setProperty("trial_setup_row", 32);
  get_s_p.setProperty("trial_closing_row", 39);
  get_s_p.setProperty("fy_sheet_count_col", 6);
  get_s_p.setProperty("trial_number_of_cases_row", 28);
  get_s_p.setProperty("trial_const_facilities_row", 29);
  get_s_p.setProperty("trial_comment_range", "B12:B26");
  get_s_p.setProperty(
    "function_number_of_cases",
    "=" +
      get_s_p.getProperty("trial_sheet_name") +
      "!B" +
      parseInt(get_s_p.getProperty("trial_number_of_cases_row")),
  );
  get_s_p.setProperty(
    "function_facilities",
    "=" +
      get_s_p.getProperty("trial_sheet_name") +
      "!B" +
      parseInt(get_s_p.getProperty("trial_const_facilities_row")),
  );
  get_s_p.setProperty("folder_id", "");
  get_s_p.setProperty("cost_of_prepare_quotation_request", "試験開始準備費用");
  get_s_p.setProperty(
    "cost_of_registration_quotation_request",
    "症例登録毎の支払",
  );
  get_s_p.setProperty(
    "cost_of_report_quotation_request",
    "症例最終報告書提出毎の支払",
  );
  get_s_p.setProperty("cost_of_prepare_item", "試験開始準備費用");
  get_s_p.setProperty("cost_of_registration_item", "症例登録");
  get_s_p.setProperty("cost_of_report_item", "症例報告");
  get_s_p.setProperty("name_nmc", "nmc");
  get_s_p.setProperty("name_oscr", "oscr");
  get_s_p.setProperty(
    "quote_nmc_sheet_name",
    "Quote_" + get_s_p.getProperty("name_nmc"),
  );
  get_s_p.setProperty(
    "total_nmc_sheet_name",
    "Total_" + get_s_p.getProperty("name_nmc"),
  );
  get_s_p.setProperty(
    "total2_nmc_sheet_name",
    "Total2_" + get_s_p.getProperty("name_nmc"),
  );
  get_s_p.setProperty(
    "total3_nmc_sheet_name",
    "Total3_" + get_s_p.getProperty("name_nmc"),
  );
  get_s_p.setProperty(
    "quote_oscr_sheet_name",
    "Quote_" + get_s_p.getProperty("name_oscr"),
  );
  get_s_p.setProperty(
    "total_oscr_sheet_name",
    "Total_" + get_s_p.getProperty("name_oscr"),
  );
  get_s_p.setProperty(
    "total2_oscr_sheet_name",
    "Total2_" + get_s_p.getProperty("name_oscr"),
  );
  get_s_p.setProperty(
    "total3_oscr_sheet_name",
    "Total3_" + get_s_p.getProperty("name_oscr"),
  );
  get_s_p.setProperty("value_check_sheet_name", "Check");
  get_s_p.setProperty("facilities_itemname", "実施施設数");
  get_s_p.setProperty("number_of_cases_itemname", "目標症例数");
  get_s_p.setProperty("coefficient", "原資");
  get_s_p.setProperty(
    "commercial_company_coefficient",
    "営利企業原資（製薬企業等）",
  );
  get_s_p.setProperty("reg1_setup_clinical_trials_office", 0);
}
