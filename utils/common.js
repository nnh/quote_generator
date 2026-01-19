/**
 * Show/hide filters.
 */
class FilterVisibleHidden {
  constructor() {
    this.ss = SpreadsheetApp.getActiveSpreadsheet();
    // Price, PriceLogic, and PriceLogicCompany sheets are excluded.
    const targetSheetNames = ["Price", "PriceLogicCompany", "PriceLogic"];
    this.sheets = this.ss
      .getSheets()
      .filter((x) => !targetSheetNames.some((v) => x.getName() === v));
  }
  getFilters() {
    return this.sheets.map((sheet) => sheet.getFilter()).filter((x) => x);
  }
  removeFilterCriteria(targetFilter) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.removeColumnFilterCriteria(col);
  }
  createFilterCriteria() {
    const filterCriteria = SpreadsheetApp.newFilterCriteria();
    filterCriteria.setHiddenValues(["0"]);
    return filterCriteria;
  }
  setFilterCriteria(targetFilter, criteria) {
    const col = targetFilter.getRange().getColumn();
    targetFilter.setColumnFilterCriteria(col, criteria);
  }
  filterVisible() {
    this.getFilters().forEach((filter) => this.removeFilterCriteria(filter));
  }
  filterHidden() {
    this.getFilters().forEach((filter) => {
      this.removeFilterCriteria(filter);
      const criteria = this.createFilterCriteria();
      this.setFilterCriteria(filter, criteria);
    });
  }
}
function filtervisible() {
  new FilterVisibleHidden().filterVisible();
}
function filterhidden() {
  new FilterVisibleHidden().filterHidden();
}
/**
 * シート編集可能者全員の権限を設定し、見積設定に必要なスクリプトプロパティを設定する
 * @param none
 * @return none
 */
function setProtectionEditusers() {
  setEditUsers_();
  register_script_property();
}
function setEditUsers_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const users = ss.getEditors();
  const protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  protections.forEach((protection) => {
    users.forEach((user) => protection.addEditor(user));
  });
}
/**
 * 列名から列番号を返す
 * @param {string} column_name 列名（'A'など）
 * @return Aなら1、のような列番号
 */
function getColumnNumber(column_name) {
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(column_name + "1").getColumn();
  return temp_range;
}
/**
 * 列番号から列名を返す
 * @param {Number} column_name 列番号
 * @return 1ならA、のような列名
 */
function getColumnString(column_number) {
  const temp_sheet = SpreadsheetApp.getActiveSheet();
  const temp_range = temp_sheet.getRange(1, parseInt(column_number));
  var temp_res = temp_range.getA1Notation();
  temp_res = temp_res.replace(/\d/, "");
  return temp_res;
}
/**
 * 開始日、終了日から月数・年数を返す
 */
function get_months(start_date, end_date) {
  if (start_date == "" || end_date == "") {
    return null;
  }
  return end_date.subtract(1, "days").diff(start_date, "months") + 1;
}
function get_years(start_date, end_date) {
  var temp;
  if (start_date == "" || end_date == "") {
    return null;
  }
  temp = get_months(start_date, end_date);
  return Math.ceil(temp / 12);
}
/**
 * 項目と行番号を連想配列に格納する（例：{契約・支払手続、実施計画提出支援=24.0, バリデーション報告書=39.0, ...}）
 * @param {associative array sheet} sheet シートオブジェクト
 * @param {string} target_col 項目名の列
 * @return {associative array} array_fy_items 項目と行番号の連想配列
 * @example
 *   var array_item = get_fy_items(target_sheet, target_col);
 */
function get_fy_items(sheet, target_col) {
  const get_s_p = PropertiesService.getScriptProperties();
  var temp_array = sheet
    .getRange(1, parseInt(target_col), sheet.getDataRange().getLastRow(), 1)
    .getValues();
  // 二次元配列から一次元配列に変換
  temp_array = Array.prototype.concat.apply([], temp_array);
  var array_fy_items = {};
  for (var i = 0; i < temp_array.length; i++) {
    if (temp_array[i] != "") {
      array_fy_items[temp_array[i]] = i + 1;
    }
  }
  return array_fy_items;
}
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
/**
 * 指定した列に値が存在したらその行番号を返す。存在しなければ0を返す。
 * @param {sheet} target_sheet 対象のシート
 * @param {number} target_col_num 対象の列番号
 * @param {string} target_value 検索対象の値
 */
function get_row_num_matched_value(target_sheet, target_col_num, target_value) {
  const target_col = getColumnString(target_col_num);
  const col_values = target_sheet
    .getRange(target_col + ":" + target_col)
    .getValues()
    .map(function (x) {
      return x[0];
    });
  return col_values.indexOf(target_value) + 1;
}
/**
 * Set script properties and sheet protection permissions. Wait 10 seconds after setting the script properties.
 */
function initial_process() {
  const get_s_p = PropertiesService.getScriptProperties();
  if (get_s_p.getProperty("quote_sheet_name") === null) {
    register_script_property();
    Utilities.sleep(10000);
  } else {
    setEditUsers_();
  }
}
/**
 * quotation_requestの1行目（項目名）からフォーム入力情報を取得する
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @param {string} header_str 検索対象の値
 * @return 項目名が完全一致すればその項目の値を返す。一致しなければnullを返す。
 * @example
 *   var trial_start_date = get_quotation_request_value(array_quotation_request, const_trial_start);
 */
function get_quotation_request_value(array_quotation_request, header_str) {
  const temp_col = array_quotation_request[0].indexOf(header_str);
  if (temp_col > -1) {
    return array_quotation_request[1][temp_col];
  } else {
    return null;
  }
}
/**
 * Retrieve the trial period, heading, and number of years of trial period on the Trial sheet.
 * @param none.
 * @return {Array.<string>} the trial period, heading, and number of years of trial period on the Trial sheet.
 */
function getTrialTermInfo_() {
  const get_s_p = PropertiesService.getScriptProperties();
  const sheet = get_sheets();
  const row_count =
    parseInt(get_s_p.getProperty("trial_closing_row")) -
    parseInt(get_s_p.getProperty("trial_setup_row")) +
    1;
  const trial_term_info = sheet.trial
    .getRange(parseInt(get_s_p.getProperty("trial_setup_row")), 1, row_count, 3)
    .getValues();
  return trial_term_info;
}
class GetArrayDividedItemsCount {
  constructor() {
    this.sheetNameIdx = 0;
    this.yearIdx = 2;
    this.trialTermInfo = getTrialTermInfo_();
  }
  /**
   * Obtain the period information from the Trial sheet.
   * @param {Array.<string>} Define sheets that are not to be processed. An array of sheet names, such as ['Setup', 'Closing']. If not defined, set to null.
   * @return {Array.<string>} A two-dimensional array of ['sheet name', 'title', 'years'].
   */
  getTargetTerm(exclusionSheetNames = null) {
    let target = this.trialTermInfo.filter((x) => x[this.yearIdx] != "");
    if (!exclusionSheetNames) {
      return target;
    }
    exclusionSheetNames.forEach((x) => {
      for (let i = 0; i < target.length; i++) {
        if (x == target[i][this.sheetNameIdx]) {
          target[i][this.sheetNameIdx] = null;
          break;
        }
      }
    });
    target = target.filter((x) => x[this.sheetNameIdx]);
    return target;
  }
  getTotalCount(setValueList, target) {
    return setValueList.reduce(
      (x, y, idx) => x + y * target[idx][this.yearIdx],
      0,
    );
  }
  /**
   * @param <number> totalNumber Total number of items to be split.
   * @param {Array.<string>} target A two-dimensional array of ['sheet name', 'title', 'years'].
   * @param <number> inputAddStartSheetIdx If you want to specify a sheet to start adding, specify its index.
   * @param <number> inputAddEndSheetIdx If you want to specify a sheet to end adding, specify its index.
   * @return A two-dimensional array of ['sheet name', 'count'].
   */
  devidedItemCount(
    totalNumber,
    target,
    inputAddStartSheetIdx = 0,
    inputAddEndSheetIdx = target.length,
  ) {
    const totalYear = target.reduce((x, y) => x + y[this.yearIdx], 0);
    const tempSum = Math.trunc(totalNumber / totalYear);
    let setValueList = Array(target.length);
    setValueList.fill(tempSum);
    let tempArraySum = this.getTotalCount(setValueList, target);
    let remainder = totalNumber - tempArraySum;
    let roopCount = 10;
    while (remainder > 0) {
      for (let i = 0; i <= target.length; i++) {
        const temp = [...setValueList];
        temp[i]++;
        const checkValue = this.getTotalCount(temp, target);
        if (checkValue <= totalNumber) {
          setValueList[i]++;
          remainder--;
        } else {
          break;
        }
        if (remainder == 0) {
          break;
        }
      }
      roopCount--;
      if (roopCount <= 0) {
        break;
      }
    }
    const res = target.map((x, idx) => [
      x[this.sheetNameIdx],
      setValueList[idx],
    ]);
    return res;
  }
  getArrayDividedItemsCount(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm(exclusionSheetNames);
    return this.devidedItemCount(totalNumber, target, 1, target.length - 1);
  }
}
class GetArrayDividedItemsCountAdd extends GetArrayDividedItemsCount {
  getArrayDividedItemsCount(totalNumber, exclusionSheetNames) {
    const target = this.getTargetTerm(exclusionSheetNames);
    return this.devidedItemCount(totalNumber, target, 1, target.length - 1);
  }
}
