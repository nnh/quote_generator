/**
 * itemsシートに単価・数量・合計を設定する
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 単価を設定する対象のシート
 * @param {number} price - 設定する単価（0以下の場合はクリアされる）
 * @param {number} target_row - 単価を設定する行番号（0の場合は処理を行わない）
 *
 * 処理概要:
 * - target_row が 0 の場合、何もせず終了。
 * - "S"列（単価列）の列番号を取得。
 * - price が 0 より大きい場合:
 *    ・"S"列に単価を設定。
 *    ・その右隣の列（T列, U列）にそれぞれ 1 を設定（数量・係数などを示す列と想定）。
 * - price が 0 以下の場合:
 *    ・"S"列、"T"列、"U"列をすべて空欄にする。
 */
function set_items_price_(sheet, price, target_row) {
  if (target_row == 0) return;
  const target_col = getColumnNumber("S");
  if (price > 0) {
    sheet.getRange(target_row, target_col).setValue(price);
    sheet.getRange(target_row, target_col).offset(0, 1).setValue(1);
    sheet.getRange(target_row, target_col).offset(0, 2).setValue(1);
  } else {
    sheet.getRange(target_row, target_col).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 1).setValue("");
    sheet.getRange(target_row, target_col).offset(0, 2).setValue("");
  }
}
/**
 * 保険料を items シートに設定する関数
 *
 * 指定された項目名（items_header）に対応する行を検索し、
 * 該当行の単価セルに totalPrice を設定します。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - 見積書全体のシートオブジェクト。
 *   `sheet.items` に単価を書き込む対象の items シートが含まれていることが前提。
 * @param {string} items_header - 単価を設定する項目の名前（items シートの2列目で検索）
 * @param {number} totalPrice - 設定する金額（単価）
 *
 * @returns {void} なし（itemsシートの該当セルを書き込む副作用あり）
 *
 * @example
 * // 「保険料」の単価を 50000 に設定
 * quote_script_set_items_by_insurance_fee_(sheet, "保険料", 50000);
 *
 * @remarks
 * - 内部で `get_row_num_matched_value()` により items シート内の行番号を特定。
 * - `set_items_price_()` を呼び出して、該当行に単価と数量・係数を設定。
 */
function quote_script_set_items_by_insurance_fee_(
  sheet,
  items_header,
  totalPrice
) {
  const items_row = get_row_num_matched_value(sheet.items, 2, items_header);
  set_items_price_(sheet.items, totalPrice, items_row);
}
/**
 * 試験協力費を items シートに設定する関数
 *
 * 見積依頼情報（array_quotation_request）に基づき、
 * 試験開始準備費用、症例登録費用、症例報告費用の各項目について
 * 「あり」の場合は totalPrice を項目数に応じて按分し、
 * items シートの該当行に単価を設定します。
 *
 * @param {Object} cache - スクリプトキャッシュオブジェクト。
 *   各項目名やスクリプトプロパティ（症例数、施設数）を参照。
 * @param {Object} sheet - 見積書全体のシートオブジェクト。
 *   `sheet.items` に単価を書き込む対象の items シートを含む。
 * @param {number} totalPrice - 協力費の合計金額
 * @param {Array} array_quotation_request - 見積依頼情報配列。
 *   各項目の有無を `get_quotation_request_value()` で判定。
 *
 * @returns {void} なし（items シートの該当セルに単価を設定する副作用あり）
 *
 * @example
 * // 協力費（試験開始準備費用・症例登録費用・症例報告費用）を設定
 * quote_script_set_items_by_cooperation_cost_(cache, sheet, 150000, quotationRequestArray);
 *
 * @remarks
 * 内部処理：
 * 1. 設定対象項目（準備費用・登録費用・報告費用）のリストを作成
 * 2. 見積依頼情報で「あり」となっている項目数を算出
 * 3. totalPrice を「あり」の項目数で按分して temp_price を計算
 * 4. 各項目について：
 *    - 該当項目が「あり」の場合：
 *      ・単価を算出（単位が「症例」なら症例数で割る、「施設」なら施設数で割る）
 *      ・`set_items_price_()` で items シートに設定
 *    - 該当項目が「なし」の場合：
 *      ・`set_items_price_()` で 0 を設定（クリア）
 */
function quote_script_set_items_by_cooperation_cost_(
  cache,
  sheet,
  totalPrice,
  array_quotation_request
) {
  const cost_of_cooperation_item_name = [
    [cache.costOfPrepareQuotationRequest, cache.costOfPrepareItem],
    [cache.costOfRegistrationQuotationRequest, cache.costOfRegistrationItem],
    [cache.costOfReportQuotationRequest, cache.costOfReportItem],
  ];
  const ari_count = cost_of_cooperation_item_name.filter(
    (y) => get_quotation_request_value(array_quotation_request, y[0]) == "あり"
  ).length;
  const temp_price = ari_count > 0 ? parseInt(totalPrice / ari_count) : null;
  cost_of_cooperation_item_name.forEach((target) => {
    const items_row = get_row_num_matched_value(sheet.items, 2, target[1]);
    if (
      get_quotation_request_value(array_quotation_request, target[0]) == "あり"
    ) {
      const unit = sheet.items.getRange(items_row, 4).getValue();
      const price =
        unit == "症例"
          ? temp_price / cache.scriptProperties.getProperty("number_of_cases")
          : unit == "施設"
          ? temp_price / cache.scriptProperties.getProperty("facilities_value")
          : temp_price;
      set_items_price_(sheet.items, price, items_row);
    } else {
      set_items_price_(sheet.items, 0, items_row);
    }
  });
}
/**
 * itemsシートに見積項目リストに基づき金額を設定する関数
 *
 * 指定された見積項目（保険料や試験協力費など）について、
 * 見積依頼情報（array_quotation_request）から金額を取得し、
 * 各項目に応じて対応する関数を呼び出して items シートに反映します。
 *
 * @param {Object} sheet - 見積書全体のシートオブジェクト。
 *   `sheet.items` に単価を書き込む items シートが含まれることを前提。
 * @param {Object} cache - スクリプトキャッシュオブジェクト。
 *   協力費設定関数などで必要な情報を保持。
 * @param {Array} array_quotation_request - 見積依頼情報を格納した配列。
 *   各項目の金額取得に `get_quotation_request_value()` を使用。
 *
 * @returns {void} なし（itemsシートへの書き込みなどの副作用あり）
 *
 * @example
 * // 見積項目リストに基づき items シートに金額を反映
 * quote_script_set_items_by_items_list_(sheet, cache, quotationRequestArray);
 *
 * @remarks
 * 内部処理：
 * 1. 設定対象項目リスト（保険料、協力費など）を `items_list` に定義
 * 2. 各項目について `array_quotation_request` から金額を取得
 * 3. 項目に応じて対応関数を呼び出す
 *    - `QuoteScriptConstants.INSURANCE_FEE` → `quote_script_set_items_by_insurance_fee_()`
 *    - `QuoteScriptConstants.COST_OF_COOPERATION` → `quote_script_set_items_by_cooperation_cost_()`
 * 4. 各関数内で items シートの該当セルに単価や数量・係数を設定
 */
function quote_script_set_items_by_items_list_(
  sheet,
  cache,
  array_quotation_request
) {
  const cost_of_cooperation = QuoteScriptConstants.COST_OF_COOPERATION;
  const items_list = [
    [QuoteScriptConstants.INSURANCE_FEE, QuoteScriptConstants.INSURANCE_FEE],
    [cost_of_cooperation, null],
  ];
  items_list.forEach((x) => {
    const quotation_request_header = x[0];
    const totalPrice = get_quotation_request_value(
      array_quotation_request,
      quotation_request_header
    );
    // 試験開始準備費用、症例登録、症例報告
    if (quotation_request_header == cost_of_cooperation) {
      quote_script_set_items_by_cooperation_cost_(
        cache,
        sheet,
        totalPrice,
        array_quotation_request
      );
    }
    // 保険料
    if (quotation_request_header == QuoteScriptConstants.INSURANCE_FEE) {
      quote_script_set_items_by_insurance_fee_(sheet, x[1], totalPrice);
    }
  });
}
