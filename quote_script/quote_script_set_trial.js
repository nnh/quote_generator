/**
 * CDISC対応の有無に基づき、CRF項目数（のべ項目数）の計算式および
 * 試験シート上のコメントを動的に設定する関数。
 *
 * CDISC対応が「あり」の場合は、補正係数（`QuoteScriptConstants.CDISC_ADDITION`）を掛けた式を返し、
 * コメントを「CDISC SDTM変数へのプレマッピングを想定した内容」に変更します。
 * CDISC対応が「なし」の場合は、補正を行わず、通常のコメントに戻します。
 *
 * @param {*} target_value - CRF項目数の基準となる値。数値または数式を表す文字列。
 * @param {*} array_quotation_request - 見積依頼情報を格納した配列。
 *   この配列から `"CDISC対応"` の値を取得して、対応の有無を判定する。
 * @returns {string} - CDISC対応「あり」の場合は補正係数を掛けた式、
 *   「なし」の場合は元の値を返す。
 *
 * @example
 * // CDISC対応が「あり」の場合（補正が入る）
 * set_trial_sheet_set_value_cdisc_("100", quotationRequestArray);
 * // => "=100 * 1.1" のような式が返る（CDISC_ADDITIONが1.1の場合）
 *
 * @example
 * // CDISC対応が「なし」の場合（補正なし）
 * set_trial_sheet_set_value_cdisc_("100", quotationRequestArray);
 * // => "100" が返る
 *
 * @remarks
 * 本関数は内部的に以下の副作用を伴います：
 * - 試験シート上のコメントを `set_trial_comment_()` および `delete_trial_comment_()` により更新します。
 */

function set_trial_sheet_set_value_cdisc_(
  target_value,
  array_quotation_request
) {
  const cdisc_addition = QuoteScriptConstants.CDISC_ADDITION;
  const cdisc = get_quotation_request_value(
    array_quotation_request,
    "CDISC対応"
  );
  const cdisc_nashi =
    '="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"';
  const cdisc_ari =
    '="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"';
  if (cdisc == "あり") {
    delete_trial_comment_(cdisc_nashi);
    const res = "=" + target_value + " * " + cdisc_addition;
    set_trial_comment_(cdisc_ari);
    return res;
  } else {
    delete_trial_comment_(cdisc_ari);
    set_trial_comment_(cdisc_nashi);
    return target_value;
  }
}
/**
 * 試験区分（trial type）の値を設定し、それに基づいて試験期間情報を更新する関数。
 *
 * 指定された `target_value`（試験区分）をスクリプトプロパティに保存したうえで、
 * `processAndWriteTrialPeriod_()` を呼び出してシート上の試験期間情報を再計算・書き込みます。
 *
 * 試験期間の更新処理が失敗した場合は空文字列を返し、成功した場合は元の `trial_value` を返します。
 *
 * @param {*} trial_value - 試験区分を示す識別子。処理成功時に戻り値として返される。
 * @param {*} target_value - 設定する試験区分の値（例：医師主導治験、市販後調査など）。
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 試験期間などの情報を書き込む対象シート。
 * @param {Array} array_quotation_request - 見積依頼情報を格納した配列。
 *   試験区分に応じた期間や条件の算出に使用される。
 * @param {GoogleAppsScript.Cache.Cache} cache - スクリプト内で共有されるキャッシュオブジェクト。
 *   試験区分値をスクリプトプロパティとして保存するために使用。
 * @returns {string} - 試験期間更新が成功した場合は `trial_value`、
 *   失敗した場合は空文字列（`""`）を返す。
 *
 * @example
 * // 試験区分を「医師主導治験」に設定して試験期間を更新
 * set_trial_sheet_set_value_trial_type_(
 *   const_trial_type,
 *   "医師主導治験",
 *   sheet,
 *   quotationRequestArray,
 *   cache
 * );
 * // => 成功時は const_trial_type が返る
 *
 * @remarks
 * この関数は内部で副作用を持ちます：
 * - `cache.scriptProperties` に `trial_type_value` を保存します。
 * - `processAndWriteTrialPeriod_()` によりシート上の内容を更新します。
 */
function set_trial_sheet_set_value_trial_type_(
  trial_value,
  target_value,
  sheet,
  array_quotation_request,
  cache
) {
  cache.scriptProperties.setProperty("trial_type_value", target_value);
  const processResult = processAndWriteTrialPeriod_(
    sheet,
    array_quotation_request,
    target_value,
    cache
  );
  if (!processResult) {
    return "";
  }
  return trial_value;
}
/**
 * 見積書シートの各項目に対応する値を設定し、必要に応じてスクリプトプロパティやスプレッドシート名を更新する関数。
 *
 * 引数 `trial_value` によって設定対象を判定し、対象に応じた処理を行います。
 *
 * 主な処理内容：
 * - 見積種別（正式見積／参考見積）に応じて「御見積書」または「御参考見積書」を返す
 * - 症例数・施設数をスクリプトプロパティに保存
 * - 原資区分に応じて係数（1 または 1.5）を返す
 * - 略称（ACRONYM）設定時にスプレッドシート名を `"Quote [略称] [日付]"` に変更する
 *
 * @param {*} trial_value - 設定対象を表す識別子。
 *   例: `QuoteScriptConstants.QUOTATION_TYPE`, `cache.numberOfCasesItemname`, `QuoteScriptConstants.ACRONYM` など。
 * @param {*} target_value - 設定する値。
 *   見積種別、症例数、施設数、略称、または係数の基準値などが渡される。
 * @param {GoogleAppsScript.Cache.Cache} cache - スクリプトキャッシュオブジェクト。
 *   `scriptProperties` を通じて値を永続化するために使用。
 * @returns {*}
 * - 見積種別の場合：「御見積書」または「御参考見積書」
 * - 係数設定の場合：`1.5` または `1`
 * - それ以外の場合：引数 `target_value` をそのまま返す
 *
 * @example
 * // 見積種別を設定
 * set_trial_sheet_set_value_(QuoteScriptConstants.QUOTATION_TYPE, "正式見積", cache);
 * // => "御見積書"
 *
 * @example
 * // 原資区分に基づく係数を設定
 * set_trial_sheet_set_value_(cache.coefficient, cache.commercialCompanyCoefficient, cache);
 * // => 1.5
 *
 * @example
 * // 略称（ACRONYM）設定時にはスプレッドシート名が変更される
 * set_trial_sheet_set_value_(QuoteScriptConstants.ACRONYM, "ABC123", cache);
 * // => "ABC123"（シート名は "Quote ABC123 YYYYMMDD" に変更）
 *
 * @remarks
 * 本関数は副作用を伴います：
 * - `cache.scriptProperties` に症例数・施設数などを保存します。
 * - 試験略称（ACRONYM）設定時にアクティブスプレッドシート名を変更します。
 */
function set_trial_sheet_set_value_(trial_value, target_value, cache) {
  if (trial_value === QuoteScriptConstants.QUOTATION_TYPE) {
    if (target_value == "正式見積") {
      return "御見積書";
    } else {
      return "御参考見積書";
    }
  }
  if (trial_value === cache.numberOfCasesItemname) {
    cache.scriptProperties.setProperty("number_of_cases", target_value);
  }
  if (trial_value === cache.facilitiesItemname) {
    cache.scriptProperties.setProperty("facilities_value", target_value);
  }
  if (trial_value === cache.coefficient) {
    if (target_value == cache.commercialCompanyCoefficient) {
      return 1.5;
    } else {
      return 1;
    }
  }
  if (trial_value === QuoteScriptConstants.ACRONYM) {
    SpreadsheetApp.getActiveSpreadsheet().rename(
      `Quote ${target_value} ${Utilities.formatDate(
        new Date(),
        "JST",
        "yyyyMMdd"
      )}`
    );
  }
  return target_value;
}
