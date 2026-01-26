/**
 * シートを連想配列に格納する
 * @param none
 * @return シートの連想配列
 */
function get_sheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const get_s_p = PropertiesService.getScriptProperties();
  let sheet = {
    trial: ss.getSheetByName(get_s_p.getProperty("trial_sheet_name")),
    quotation_request: ss.getSheetByName(
      get_s_p.getProperty("quotation_request_sheet_name"),
    ),
    total: ss.getSheetByName(get_s_p.getProperty("total_sheet_name")),
    total2: ss.getSheetByName(get_s_p.getProperty("total2_sheet_name")),
    total3: ss.getSheetByName(get_s_p.getProperty("total3_sheet_name")),
    setup: ss.getSheetByName(get_s_p.getProperty("setup_sheet_name")),
    registration_1: ss.getSheetByName(
      get_s_p.getProperty("registration_1_sheet_name"),
    ),
    registration_2: ss.getSheetByName(
      get_s_p.getProperty("registration_2_sheet_name"),
    ),
    interim_1: ss.getSheetByName(get_s_p.getProperty("interim_1_sheet_name")),
    observation_1: ss.getSheetByName(
      get_s_p.getProperty("observation_1_sheet_name"),
    ),
    interim_2: ss.getSheetByName(get_s_p.getProperty("interim_2_sheet_name")),
    observation_2: ss.getSheetByName(
      get_s_p.getProperty("observation_2_sheet_name"),
    ),
    closing: ss.getSheetByName(get_s_p.getProperty("closing_sheet_name")),
    items: ss.getSheetByName(get_s_p.getProperty("items_sheet_name")),
    quote: ss.getSheetByName(get_s_p.getProperty("quote_sheet_name")),
    check: ss.getSheetByName(get_s_p.getProperty("value_check_sheet_name")),
  };
  const temp_sheet = ss.getSheetByName(
    get_s_p.getProperty("total_nmc_sheet_name"),
  );
  if (temp_sheet != null) {
    sheet.total_nmc = ss.getSheetByName(
      get_s_p.getProperty("total_nmc_sheet_name"),
    );
    sheet.total2_nmc = ss.getSheetByName(
      get_s_p.getProperty("total2_nmc_sheet_name"),
    );
    sheet.total_oscr = ss.getSheetByName(
      get_s_p.getProperty("total_oscr_sheet_name"),
    );
    sheet.total2_oscr = ss.getSheetByName(
      get_s_p.getProperty("total2_oscr_sheet_name"),
    );
  }
  return sheet;
}
/**
 * Setup〜Closingのシートを配列に格納する
 * @param none
 * @return シートの配列
 */
function get_target_term_sheets() {
  const sheet = get_sheets();
  const array_target_sheet = [
    sheet.setup,
    sheet.closing,
    sheet.observation_2,
    sheet.registration_2,
    sheet.registration_1,
    sheet.interim_1,
    sheet.observation_1,
    sheet.interim_2,
  ];
  return array_target_sheet;
}
