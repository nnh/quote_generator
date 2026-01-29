/**
 * Trial / Items シート生成・価格設定・コメント操作
 * - set_trial_sheet_
 * - set_items_price_
 */

function handleQuotationType_(value) {
  return value === "正式見積" ? "御見積書" : "御参考見積書";
}
function handleNumberOfCases_(value, scriptProperties) {
  scriptProperties.setProperty("number_of_cases", value);
  return;
}
function handleFacilities_(value, scriptProperties) {
  scriptProperties.setProperty("facilities_value", value);
  return;
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
function normalizeCoefficient_(coefficientValue, scriptProperties) {
  const commercialCoefficient = scriptProperties.getProperty(
    "commercial_company_coefficient",
  );

  return coefficientValue === commercialCoefficient ? 1.5 : 1;
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
    get_quotation_request_value_(arrayQuotationRequest, "CDISC対応") === "あり";

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
  const crfValue = typeof crfCount === "number" ? crfCount : `"${crfCount}"`;
  return `=${crfValue}*${CDISC_ADDITION}`;
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
  const today = Utilities.formatDate(new Date(), "JST", "yyyyMMdd");
  SpreadsheetApp.getActiveSpreadsheet().rename(`Quote ${acronym} ${today}`);
  return;
}
/**
 * 試験種別をスクリプトプロパティに保存する
 * @param {string} trialType 試験種別
 * @return {void}
 */
function setTrialTypeProperty_(trialType) {
  const sp = PropertiesService.getScriptProperties();
  sp.setProperty("trial_type_value", trialType);
  return;
}
/**
 * 試験期間に必要な日付を取得する
 * @param {Array.<string>} array_quotation_request quotation_request シートの値
 * @return {{trialStartDate:any, registrationEndDate:any, trialEndDate:any}|null}
 */
function getTrialDates_(array_quotation_request) {
  const trialStartDate = get_quotation_request_value_(
    array_quotation_request,
    "症例登録開始日",
  );
  const registrationEndDate = get_quotation_request_value_(
    array_quotation_request,
    "症例登録終了日",
  );
  const trialEndDate = get_quotation_request_value_(
    array_quotation_request,
    "試験終了日",
  );

  if (!trialStartDate || !registrationEndDate || !trialEndDate) {
    return null;
  }

  return {
    trialStartDate,
    registrationEndDate,
    trialEndDate,
  };
}
/**
 * 試験種別に応じて setup / closing 期間（月数）を決定する
 * @param {string} trialType 試験種別
 * @param {Array.<string>} array_quotation_request quotation_request シートの値
 * @return {void}
 */
function determineSetupAndClosingTerm_(trialType, array_quotation_request) {
  get_setup_closing_term_(trialType, array_quotation_request);
  return;
}
/**
 * 試験開始日・終了日から、試験期間配列を生成する
 *
 * @param {Date} trialStartDate 試験開始日
 * @param {Date} trialEndDate 試験終了日
 * @return {Array.<Array.<Date>>} [[startDate, endDate], ...]
 */
function buildTrialDateArray_(trialStartDate, trialEndDate) {
  return get_trial_start_end_date_(trialStartDate, trialEndDate);
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
  sheet.trial
    .getRange(trialSetupRow, trialStartCol, trialDateArray.length, 2)
    .clear();

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
 * @param {Array.<string>} array_quotation_request quotation_request シートの値
 * @param {Object} sheet sheets オブジェクト
 * @return {void}
 */
function handleTrialType_(trialType, array_quotation_request, sheet) {
  const get_s_p = PropertiesService.getScriptProperties();
  setTrialTypeProperty_(trialType);
  const trialDates = getTrialDates_(array_quotation_request);
  if (!trialDates) {
    return;
  }

  const { trialStartDate, registrationEndDate, trialEndDate } = trialDates;
  determineSetupAndClosingTerm_(trialType, array_quotation_request);

  // 試験期間配列を取得
  const trialDateArray = buildTrialDateArray_(trialStartDate, trialEndDate);

  const trialStartCol = Number(get_s_p.getProperty("trial_start_col"));
  const trialEndCol = Number(get_s_p.getProperty("trial_end_col"));
  const trialSetupRow = Number(get_s_p.getProperty("trial_setup_row"));
  const trialYearsCol = Number(get_s_p.getProperty("trial_years_col"));
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
 * const processedValue = dispatchTrialField_("CRF項目数", 120, context);
 */
function dispatchTrialField_(key, fieldValue, context) {
  if (fieldValue == null) return null;

  const sp = context.properties;
  const arrayQuotationRequest = context.arrayQuotationRequest;
  const sheet = context.sheet;
  const const_facilities = sp.getProperty("facilities_itemname");
  const const_number_of_cases = sp.getProperty("number_of_cases_itemname");
  const const_coefficient = sp.getProperty("coefficient");

  switch (key) {
    case TRIAL_FIELDS.QUOTATION_TYPE:
      return handleQuotationType_(fieldValue);
    case const_number_of_cases:
      handleNumberOfCases_(fieldValue, sp);
      return fieldValue;
    case const_facilities:
      handleFacilities_(fieldValue, sp);
      return fieldValue;
    case TRIAL_FIELDS.TRIAL_TYPE:
      handleTrialType_(fieldValue, arrayQuotationRequest, sheet);
      return fieldValue;
    case const_coefficient:
      return (fieldValue = normalizeCoefficient_(fieldValue, sp));
    case TRIAL_FIELDS.CRF:
      return handleCrfWithCdisc_(fieldValue, arrayQuotationRequest);
    case TRIAL_FIELDS.ACRONYM:
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
  const get_s_p = PropertiesService.getScriptProperties();
  const const_facilities = get_s_p.getProperty("facilities_itemname");
  const const_number_of_cases = get_s_p.getProperty("number_of_cases_itemname");
  const coefficient = get_s_p.getProperty("coefficient");
  const trial_list = [
    [TRIAL_FIELDS.QUOTATION_TYPE, 2],
    ["見積発行先", 4],
    ["研究代表者名", 8],
    ["試験課題名", 9],
    ["試験実施番号", 10],
    [TRIAL_FIELDS.TRIAL_TYPE, 27],
    [const_number_of_cases, get_s_p.getProperty("trial_number_of_cases_row")],
    [const_facilities, get_s_p.getProperty("trial_const_facilities_row")],
    [TRIAL_FIELDS.CRF, 30],
    [coefficient, 44],
  ];
  const cost_of_cooperation = "研究協力費、負担軽減費";
  const items_list = [
    ["保険料", "保険料"],
    [cost_of_cooperation, null],
  ];
  const cost_of_cooperation_item_name = [
    [
      get_s_p.getProperty("cost_of_prepare_quotation_request"),
      get_s_p.getProperty("cost_of_prepare_item"),
    ],
    [
      get_s_p.getProperty("cost_of_registration_quotation_request"),
      get_s_p.getProperty("cost_of_registration_item"),
    ],
    [
      get_s_p.getProperty("cost_of_report_quotation_request"),
      get_s_p.getProperty("cost_of_report_item"),
    ],
  ];
  for (let i = 0; i < trial_list.length; i++) {
    const key = trial_list[i][0];
    const row = Number(trial_list[i][1]);
    const context = {
      sheet,
      arrayQuotationRequest: array_quotation_request,
      properties: PropertiesService.getScriptProperties(),
    };

    const quotationRequestValue = get_quotation_request_value_(
      array_quotation_request,
      key,
    );
    if (quotationRequestValue == null) {
      throw new Error(`Missing quotation request value for key: ${key}`);
    }

    const result = dispatchTrialField_(key, quotationRequestValue, context);
    sheet.trial.getRange(row, 2).setValue(result);
  }
  // 発行年月日
  const date_of_issue = get_row_num_matched_value_(
    sheet.trial,
    1,
    "発行年月日",
  );
  if (date_of_issue > 0) {
    sheet.trial
      .getRange(date_of_issue, 2)
      .setValue(Moment.moment().format("YYYY/MM/DD"));
  }
  const numberOfCases = Number(get_s_p.getProperty("number_of_cases"));
  const facilities = Number(get_s_p.getProperty("facilities_value"));
  // 単価の設定
  items_list.forEach((x) => {
    const quotation_request_header = x[0];
    const totalPrice = get_quotation_request_value_(
      array_quotation_request,
      quotation_request_header,
    );
    if (quotation_request_header === cost_of_cooperation) {
      // 試験開始準備費用、症例登録、症例報告
      const ari_count = cost_of_cooperation_item_name.filter(
        (y) =>
          get_quotation_request_value_(array_quotation_request, y[0]) ===
          "あり",
      ).length;
      const temp_price =
        ari_count > 0 ? Math.floor(Number(totalPrice) / ari_count) : null;

      cost_of_cooperation_item_name.forEach((target) => {
        const items_row = get_row_num_matched_value_(sheet.items, 2, target[1]);
        if (
          get_quotation_request_value_(array_quotation_request, target[0]) ===
          "あり"
        ) {
          const unit = sheet.items.getRange(items_row, 4).getValue();
          const price =
            unit === "症例"
              ? temp_price / numberOfCases
              : unit === "施設"
                ? temp_price / facilities
                : temp_price;

          set_items_price_(sheet.items, price, items_row);
        } else {
          set_items_price_(sheet.items, 0, items_row);
        }
      });
    } else {
      // 保険料
      const items_header = x[1];
      const items_row = get_row_num_matched_value_(
        sheet.items,
        2,
        items_header,
      );
      set_items_price_(sheet.items, totalPrice, items_row);
    }
  });
}
/**
 * itemsシートに単価を設定する
 */
function set_items_price_(sheet, price, target_row) {
  if (target_row === 0) return;
  const target_col = getColumnNumber_("S");
  if (Number(price) > 0) {
    sheet.getRange(target_row, target_col).setValue(price);
    sheet.getRange(target_row, target_col).offset(0, 1).setValue(1);
    sheet.getRange(target_row, target_col).offset(0, 2).setValue(1);
  } else {
    sheet.getRange(target_row, target_col).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 1).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 2).setValue("");
  }
}
