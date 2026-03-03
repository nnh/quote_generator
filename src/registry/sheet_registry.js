/**
 * - シートを連想配列に格納してキャッシュする
 * @type {Object.<string, GoogleAppsScript.Spreadsheet.Sheet>|null}
 */
let _cachedSheets = null;

/**
 * quotation_request シートの
 * 「ヘッダー名 → 入力値」を保持するキャッシュ
 *
 * @type {Map<string, string|null>|null}
 */
let _quotationRequestMap = null;

/**
 * アクティブスプレッドシートのキャッシュ
 *
 * @type {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
let _cachedSpreadsheet = null;

/**
 * シート名を正規化する（前後の空白を削除し、小文字に変換する）
 * @param {string} name シート名
 * @returns {string} 正規化されたシート名
 */
function normalizeSheetName_(name) {
  return name.trim().toLowerCase();
}

/**
 * シートを連想配列に格納する（キャッシュあり）
 * @return シートの連想配列
 */
function get_sheets() {
  if (_cachedSheets) return _cachedSheets;

  const ss = getSpreadsheet_();

  const sheet = {
    trial: ss.getSheetByName(QUOTATION_SHEET_NAMES.TRIAL),
    quotation_request: ss.getSheetByName(
      QUOTATION_SHEET_NAMES.QUOTATION_REQUEST,
    ),
    total: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL),
    total2: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2),
    total3: ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL3),
    setup: ss.getSheetByName(QUOTATION_SHEET_NAMES.SETUP),
    registration_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.REGISTRATION_1),
    registration_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.REGISTRATION_2),
    interim_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.INTERIM_1),
    observation_1: ss.getSheetByName(QUOTATION_SHEET_NAMES.OBSERVATION_1),
    interim_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.INTERIM_2),
    observation_2: ss.getSheetByName(QUOTATION_SHEET_NAMES.OBSERVATION_2),
    closing: ss.getSheetByName(QUOTATION_SHEET_NAMES.CLOSING),
    trial: ss.getSheetByName(QUOTATION_SHEET_NAMES.TRIAL),
    items: ss.getSheetByName(QUOTATION_SHEET_NAMES.ITEMS),
    quote: ss.getSheetByName(QUOTATION_SHEET_NAMES.QUOTE),
    check: ss.getSheetByName(VALIDATION_CHECK_SHEET_NAME),
  };

  if (ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_NMC)) {
    sheet.total_nmc = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_NMC);
    sheet.total2_nmc = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_NMC);
    sheet.total_oscr = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_OSCR);
    sheet.total2_oscr = ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_OSCR);
  }

  _cachedSheets = {};

  Object.values(sheet).forEach((s) => {
    if (s) {
      _cachedSheets[normalizeSheetName_(s.getName())] = s;
    }
  });

  return _cachedSheets;
}

function resetSheetCache_() {
  _cachedSheets = null;
}

/**
 * Setup〜Closingのシートを配列に格納する
 * @return シートの配列
 */
function get_target_term_sheets() {
  if (_cachedSheets === null) {
    get_sheets();
  }

  const array_target_sheet = [
    _cachedSheets.setup,
    _cachedSheets.closing,
    _cachedSheets.observation_2,
    _cachedSheets.registration_2,
    _cachedSheets.registration_1,
    _cachedSheets.interim_1,
    _cachedSheets.observation_1,
    _cachedSheets.interim_2,
  ];
  return array_target_sheet;
}

function getSheetByNameCached_(sheetname) {
  if (_cachedSheets === null) {
    get_sheets();
  }

  const key = normalizeSheetName_(sheetname);
  const sheet = _cachedSheets[key];

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetname}`);
  }

  return sheet;
}

/**
 * quotation_request のヘッダー→値 Map を構築する
 *
 * @returns {Map<string, string|null>}
 * @throws {Error} シートが取得できない場合
 */
function buildQuotationRequestMap_() {
  if (_cachedSheets === null) {
    get_sheets();
  }

  const quotationRequestSheetName = normalizeSheetName_(
    QUOTATION_REQUEST_SHEET.NAME,
  );

  const sheet = _cachedSheets[quotationRequestSheetName];

  if (!sheet) {
    throw new Error("Quotation request シートが取得できません");
  }

  const array_quotation_request = sheet
    .getRange(1, 1, 2, sheet.getLastColumn())
    .getValues();

  const headers = array_quotation_request[0];
  const values = array_quotation_request[1];

  const map = new Map();

  headers.forEach((header, i) => {
    if (header) {
      map.set(header, values[i] ?? null);
    }
  });

  _quotationRequestMap = map;

  return map;
}

/**
 * アクティブスプレッドシートを取得する（キャッシュ付き）
 *
 * 初回のみ SpreadsheetApp.getActiveSpreadsheet() を呼び、
 * 以降はキャッシュを返す。
 *
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet_() {
  if (!_cachedSpreadsheet) {
    _cachedSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  return _cachedSpreadsheet;
}
