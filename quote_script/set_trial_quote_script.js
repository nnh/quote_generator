/**
 * 見積書シート（trial sheet）に対し、試験関連項目リストをもとに値を一括設定する関数。
 *
 * この関数は、見積依頼情報 (`array_quotation_request`) をもとに、
 * 試験区分・見積種別・試験課題名・CRF項目数などの主要項目を
 * 指定行に書き込みます。
 * 各項目の設定内容に応じて、関連関数（`set_trial_sheet_set_value_()`、
 * `set_trial_sheet_set_value_cdisc_()`、`set_trial_sheet_set_value_trial_type_()`）を呼び出し、
 * 値の整形・副作用処理（プロパティ保存、コメント更新、シート名変更など）を実行します。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 見積書情報を設定する対象シート。
 *   `sheet.trial` 経由でセルへのアクセスを行う。
 * @param {GoogleAppsScript.Cache.Cache} cache - スクリプトキャッシュオブジェクト。
 *   各種項目名・行番号・スクリプトプロパティの参照に使用。
 * @param {Array} array_quotation_request - 見積依頼情報を格納した配列。
 *   各項目の値取得に `get_quotation_request_value()` が利用される。
 * @returns {void} なし（シートのセル値更新およびスクリプトプロパティ更新などの副作用を伴う）。
 *
 * @example
 * // 見積書シートに試験情報を一括反映
 * quote_script_set_trial_by_trial_list_(sheet, cache, quotationRequestArray);
 * // => 各種試験項目が対応行に書き込まれる
 *
 * @remarks
 * 内部処理の流れ：
 * 1. 試験関連項目と対応行番号を `trial_list` に定義。
 * 2. 各項目について `get_quotation_request_value()` で値を取得。
 * 3. 項目種別に応じて以下の処理を実行：
 *    - `QuoteScriptConstants.TRIAL_TYPE` → 試験区分設定 (`set_trial_sheet_set_value_trial_type_()`)
 *    - `QuoteScriptConstants.CRF` → CDISC対応処理 (`set_trial_sheet_set_value_cdisc_()`)
 *    - 上記以外 → 一般項目設定 (`set_trial_sheet_set_value_()`)
 * 4. 取得した値をシートの該当セルに書き込み。
 *
 * 主な副作用：
 * - スクリプトプロパティ（症例数・施設数など）の保存
 * - CDISCコメントの追加／削除
 * - スプレッドシート名の変更（略称設定時）
 */
function quote_script_set_trial_by_trial_list_(
  sheet,
  cache,
  array_quotation_request
) {
  const const_facilities = cache.facilitiesItemname;
  const trial_list = [
    [
      QuoteScriptConstants.QUOTATION_TYPE,
      QuoteScriptConstants.QUOTATION_TYPE_ROW,
    ],
    ["見積発行先", QuoteScriptConstants.ISSUE_DESTINATION_ROW],
    ["研究代表者名", QuoteScriptConstants.PRINCIPAL_INVESTIGATOR_ROW],
    ["試験課題名", QuoteScriptConstants.TRIAL_TITLE_ROW],
    [QuoteScriptConstants.ACRONYM, QuoteScriptConstants.ACRONYM_ROW],
    [QuoteScriptConstants.TRIAL_TYPE, QuoteScriptConstants.TRIAL_TYPE_ROW],
    [cache.numberOfCasesItemname, cache.trialNumberOfCasesRow],
    [const_facilities, cache.trialConstFacilitiesRow],
    [QuoteScriptConstants.CRF, QuoteScriptConstants.CRF_ITEMS_ROW],
    [cache.coefficient, QuoteScriptConstants.COEFFICIENT_ROW],
  ];
  for (let i = 0; i < trial_list.length; i++) {
    const target_value = trial_list[i][0];
    const target_row = trial_list[i][1];
    const temp_str = get_quotation_request_value(
      array_quotation_request,
      target_value
    );
    let setText = null;
    if (temp_str === null || temp_str === undefined) {
      continue;
    }
    if (target_value === QuoteScriptConstants.TRIAL_TYPE) {
      setText = set_trial_sheet_set_value_trial_type_(
        temp_str,
        target_value,
        sheet,
        array_quotation_request,
        cache
      );
    } else if (target_value === QuoteScriptConstants.CRF) {
      setText = set_trial_sheet_set_value_cdisc_(
        temp_str,
        array_quotation_request
      );
    } else {
      setText = set_trial_sheet_set_value_(target_value, temp_str, cache);
    }
    if (setText === null) {
      continue;
    }
    sheet.trial.getRange(parseInt(target_row), 2).setValue(setText);
  }
}
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
/**
 * 発行年月日を設定する関数。
 *
 * シート上で「発行年月日」に対応する行を特定し、
 * その隣のセルに現在の日付（YYYY/MM/DD形式）を設定します。
 * @param {*} スプレッドシート内のシートオブジェクトリスト
 * @returns none.
 */
function set_issue_date_(sheet) {
  const date_of_issue = get_row_num_matched_value(sheet.trial, 1, "発行年月日");
  if (!date_of_issue) {
    return;
  }
  if (date_of_issue <= 0) {
    return;
  }
  sheet.trial
    .getRange(date_of_issue, 2)
    .setValue(Moment.moment().format("YYYY/MM/DD"));
}
