/**
 * Trial / Items シート生成・価格設定・コメント操作
 */
function convertQuotationTypeLabel_(value) {
  return value === "正式見積" ? "御見積書" : "御参考見積書";
}
/**
 * 見積係数を正規化する
 * - 商用企業の場合は 1.5
 * - それ以外は 1
 *
 * @param {string} coefficientValue quotation_request から取得した値
 * @param {PropertiesService.Properties} scriptProperties
 * @return {number} 正規化後の係数
 */
function normalizeCoefficient_(coefficientValue) {
  const commercialCoefficient = QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  return coefficientValue === commercialCoefficient ? 1.5 : 1;
}
/**
 * CRF数をCDISC加算用の式に変換する
 *
 * @param {string|number} crfCount
 * @return {string}
 */
function buildCdiscCrfFormula_(crfCount) {
  const crfValue = typeof crfCount === "number" ? crfCount : `"${crfCount}"`;
  return `=${crfValue}*${CDISC_ADDITION}`;
}
/**
 * CRF項目数を CDISC対応有無に応じて調整し、コメントを更新する
 *
 * @param {string|number} crfCount CRF項目数（元の値）
 * @param {Array.<string>} arrayQuotationRequest quotation_request シートの値
 * @return {string|number} trialシートに設定する数式文字列またはCRF項目数
 */
function handleCrfWithCdisc_(crfCount, arrayQuotationRequest) {
  const isCdiscEnabled =
    get_quotation_request_value_(
      arrayQuotationRequest,
      QUOTATION_REQUEST_SHEET.ITEMNAMES.CDISC_SUPPORT,
    ) === COMMON_EXISTENCE_LABELS.YES;

  if (!isCdiscEnabled) {
    return crfCount;
  }

  // 既存コメント削除
  delete_trial_comment_(
    '="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"',
  );

  // CDISC対応コメント追加
  set_trial_comment_(
    '="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"',
  );

  // CRF数を式に変換
  return buildCdiscCrfFormula_(crfCount);
}
/**
 * 見積用スプレッドシート名をリネームする
 *
 * 形式:
 *   Quote {acronym} {yyyyMMdd}
 *
 * @param {string} acronym 試験実施番号
 * @return {void}
 */
function renameSpreadsheetWithAcronym_(acronym) {
  if (!acronym) return;
  const today = Utilities.formatDate(new Date(), "JST", "yyyyMMdd");
  SpreadsheetApp.getActiveSpreadsheet().rename(`Quote ${acronym} ${today}`);
  return;
}
/**
 * 試験期間に必要な日付を取得する
 * @param {Array.<string>} array_quotation_request quotation_request シートの値
 * @return {{trialStartDate:any, trialEndDate:any}|null}
 */
function getTrialDates_(array_quotation_request) {
  const trialStartDate = get_quotation_request_value_(
    array_quotation_request,
    QUOTATION_REQUEST_SHEET.ITEMNAMES.TRIAL_REGISTRATION_START_DATE,
  );
  const trialEndDate = get_quotation_request_value_(
    array_quotation_request,
    QUOTATION_REQUEST_SHEET.ITEMNAMES.TRIAL_END_DATE,
  );

  if (!trialStartDate || !trialEndDate) {
    return null;
  }

  return {
    trialStartDate,
    trialEndDate,
  };
}
/**
 * trialシートに試験期間配列を書き込む
 *
 * @param {Object} sheet sheetsオブジェクト
 * @param {Array.<Array.<Moment>>} trialDateArray 試験期間配列
 * @param {number} trialSetupRow trialSetup開始行
 * @param {number} trialStartCol trial開始列
 * @param {number} trialEndCol trial終了列
 * @param {number} trialYearsCol 年数表示列
 * @param {number} totalMonthCol 総月数表示列
 * @return {void}
 */
function writeTrialDatesToSheet_(
  sheet,
  trialDateArray,
  trialSetupRow,
  trialStartCol,
  trialEndCol,
  trialYearsCol,
  totalMonthCol,
) {
  let lastRow = null;

  trialDateArray.forEach((dates, i) => {
    const startCell = sheet.trial.getRange(trialSetupRow + i, trialStartCol);
    const endCell = sheet.trial.getRange(trialSetupRow + i, trialEndCol);

    const [startDate, endDate] = dates;

    if (startDate) startCell.setValue(startDate.format("YYYY/MM/DD"));
    if (endDate) endCell.setValue(endDate.format("YYYY/MM/DD"));

    const startAddr = startCell.getA1Notation();
    const endAddr = endCell.getA1Notation();

    sheet.trial
      .getRange(trialSetupRow + i, trialYearsCol)
      .setFormula(
        `=if(and($${startAddr}<>"",$${endAddr}<>""),datedif($${startAddr},$${endAddr},"y")+1,"")`,
      );

    lastRow = trialSetupRow + i;
  });

  // total（月数）
  const totalCell = sheet.trial.getRange(lastRow, totalMonthCol);
  totalCell.setFormula(
    `=datedif(${sheet.trial
      .getRange(lastRow, trialStartCol)
      .getA1Notation()},(${sheet.trial
      .getRange(lastRow, trialEndCol)
      .getA1Notation()}+1),"m")`,
  );

  // x年xヶ月 表示
  sheet.trial
    .getRange(lastRow, trialYearsCol)
    .setFormula(
      `=trunc(${totalCell.getA1Notation()}/12) & "年" & if(mod(${totalCell.getA1Notation()},12)<>0,mod(${totalCell.getA1Notation()},12) & "ヶ月","")`,
    );
  return;
}

/**
 * 試験種別に応じて試験期間を計算し、trialシートへ反映する
 *
 * @param {string} trialType 試験種別
 * @param {Array.<string>} quotationRequest quotation_request シートの値
 * @param {Object} sheet sheets オブジェクト
 * @return {void}
 */
function applyTrialType_(trialType, quotationRequest, sheet) {
  const scriptProperties = PropertiesService.getScriptProperties();
  setTrialTypeProperty_(trialType, scriptProperties);
  const trialDates = getTrialDates_(quotationRequest);
  if (!trialDates) {
    return;
  }

  const { trialStartDate, trialEndDate } = trialDates;
  // Setup / Closing期間の決定とプロパティへの保存
  applySetupClosingTerm_(trialType, quotationRequest);

  // 試験期間配列を取得
  const trialDateArray = buildTrialDateArray_(trialStartDate, trialEndDate);

  const trialStartCol = TRIAL_SHEET.COLUMNS.TRIAL_START;
  const trialEndCol = TRIAL_SHEET.COLUMNS.TRIAL_END;
  const trialSetupRow = TRIAL_SHEET.ROWS.TRIAL_SETUP;
  const trialYearsCol = TRIAL_SHEET.COLUMNS.TRIAL_YEARS;
  const totalMonthCol = 6;

  // 既存値クリア
  sheet.trial
    .getRange(trialSetupRow, trialStartCol, trialDateArray.length, 2)
    .clear();

  writeTrialDatesToSheet_(
    sheet,
    trialDateArray,
    trialSetupRow,
    trialStartCol,
    trialEndCol,
    trialYearsCol,
    totalMonthCol,
  );
  return;
}

/**
 * Trialシートの各項目に応じた処理を振り分ける関数
 *
 * この関数は、各試験関連項目に応じて値の変換やスクリプトプロパティの更新、
 * スプレッドシート名の変更などを行います。
 *
 * @param {string} key - 処理対象の項目名（例: "試験種別", "CRF項目数"）
 * @param {any} fieldValue - quotation_requestシートから取得した値
 * @param {Object} context - 共通コンテキストオブジェクト
 * @param {PropertiesService.Properties} context.properties - スクリプトプロパティ
 * @param {Array.<string>} context.arrayQuotationRequest - quotation_requestシートの値
 * @param {Object} context.sheet - Sheetsオブジェクト（trial, itemsシートなど）
 *
 * @returns {any} - trialシートにセットする最終値。fieldValueがnullの場合はnullを返す
 *
 * @example
 * const processedValue = resolveTrialFieldValue_("CRF項目数", 120, context);
 */
function resolveTrialFieldValue_(key, fieldValue, context) {
  if (fieldValue == null) return null;

  const sp = context.properties;
  const arrayQuotationRequest = context.arrayQuotationRequest;
  const sheet = context.sheet;
  const const_facilities = ITEM_LABELS.FACILITIES;
  const const_number_of_cases = ITEM_LABELS.NUMBER_OF_CASES;

  switch (key) {
    case TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE:
      return convertQuotationTypeLabel_(fieldValue);
    case const_number_of_cases:
      setNumberOfCasesProperty_(fieldValue, sp);
      return fieldValue;
    case const_facilities:
      setFacilitiesProperty_(fieldValue, sp);
      return fieldValue;
    case TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE:
      applyTrialType_(fieldValue, arrayQuotationRequest, sheet);
      return fieldValue;
    case ITEM_LABELS.FUNDING_SOURCE_LABEL:
      return normalizeCoefficient_(fieldValue);
    case TRIAL_SHEET.ITEMNAMES.CRF:
      return handleCrfWithCdisc_(fieldValue, arrayQuotationRequest);
    case "試験実施番号":
      renameSpreadsheetWithAcronym_(fieldValue);
      return fieldValue;
    default:
      return fieldValue;
  }
}

/**
 * quotation_requestシートの内容からtrialシート, itemsシートを設定する
 * @param {associative array} sheet 当スプレッドシート内のシートオブジェクト
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return {void}
 * @example
 *   set_trial_sheet_(sheet, array_quotation_request);
 */
function set_trial_sheet_(sheet, array_quotation_request) {
  const const_facilities = ITEM_LABELS.FACILITIES;
  const const_number_of_cases = ITEM_LABELS.NUMBER_OF_CASES;
  const trial_list = [
    [TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE, 2],
    ["見積発行先", 4],
    ["研究代表者名", 8],
    ["試験課題名", 9],
    ["試験実施番号", 10],
    [TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE, 27],
    [const_number_of_cases, TRIAL_SHEET.ROWS.CASES],
    [const_facilities, TRIAL_SHEET.ROWS.FACILITIES],
    [TRIAL_SHEET.ITEMNAMES.CRF, 30],
    [ITEM_LABELS.FUNDING_SOURCE_LABEL, 44],
  ];
  const sp = PropertiesService.getScriptProperties();
  for (let i = 0; i < trial_list.length; i++) {
    const key = trial_list[i][0];
    const row = Number(trial_list[i][1]);
    const context = {
      sheet,
      arrayQuotationRequest: array_quotation_request,
      properties: sp,
    };

    const quotationRequestValue = get_quotation_request_value_(
      array_quotation_request,
      key,
    );
    if (quotationRequestValue == null) {
      throw new Error(`Missing quotation request value for key: ${key}`);
    }

    const result = resolveTrialFieldValue_(key, quotationRequestValue, context);
    sheet.trial.getRange(row, 2).setValue(result);
  }
  // 発行年月日に今日の日付を入れる
  const date_of_issue = get_row_num_matched_value_(
    sheet.trial,
    1,
    "発行年月日",
  );
  if (date_of_issue > 0) {
    sheet.trial.getRange(date_of_issue, 2).setValue(formatTodayYmd_());
  }
  const itemSheet = sheet.items;
  applyItemPrices_(array_quotation_request, itemSheet);
}
