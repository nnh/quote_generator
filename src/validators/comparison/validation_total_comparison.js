/**
 * On the Quote, Total, Total2, and Total3 sheets, check that the totals and discounted totals are printed correctly.
 * @param none.
 * @return {boolean} <array> Return True if OK, False otherwise.
 */
function checkQuoteSum_() {
  const GetRowCol = new GetTargetRowCol();
  const quoteGoukeiRow = GetRowCol.getTargetRow(_cachedSheets.quote, 3, "小計");
  const totalGoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total,
    2,
    ITEM_LABELS.SUM,
  );
  const total2GoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total2,
    2,
    ITEM_LABELS.SUM,
  );
  const total3GoukeiRow = GetRowCol.getTargetRow(
    _cachedSheets.total3,
    2,
    ITEM_LABELS.SUM,
  );
  const quoteGoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.quote,
    11,
    ITEM_LABELS.AMMOUNT,
  );
  const totalGoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total,
    4,
    ITEM_LABELS.AMMOUNT,
  );
  const total2GoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total2,
    4,
    ITEM_LABELS.SUM,
  );
  const total3GoukeiCol = GetRowCol.getTargetCol(
    _cachedSheets.total3,
    3,
    ITEM_LABELS.SUM,
  );
  const checkAmount = [
    _cachedSheets.quote.getRange(quoteGoukeiRow, quoteGoukeiCol).getValue(),
    _cachedSheets.total.getRange(totalGoukeiRow, totalGoukeiCol).getValue(),
    _cachedSheets.total2.getRange(total2GoukeiRow, total2GoukeiCol).getValue(),
    _cachedSheets.total3.getRange(total3GoukeiRow, total3GoukeiCol).getValue(),
  ].map((x) => (x === "" ? 0 : Math.round(x)));
  const checkDiscount = [
    _cachedSheets.quote.getRange(quoteGoukeiRow + 2, quoteGoukeiCol).getValue(),
    _cachedSheets.total.getRange(totalGoukeiRow + 1, totalGoukeiCol).getValue(),
    _cachedSheets.total2
      .getRange(total2GoukeiRow + 1, total2GoukeiCol)
      .getValue(),
    _cachedSheets.total3
      .getRange(total3GoukeiRow + 1, total3GoukeiCol)
      .getValue(),
  ].map((x) => (x === "" ? 0 : Math.round(x)));
  return [
    checkAmount.every((x, _, arr) => x === arr[0]),
    checkDiscount.every((x, _, arr) => x === arr[0]),
  ];
}
/**
 * Check that the total and the discounted total on each sheet from Setup to Closing are output correctly.
 * @param {string} The sheet name.
 * @param {number} Discount rate for Trial sheets.
 * @return {boolean} Return True if OK, False otherwise.
 */
function checkAmountByYearSheet_(sheetName, discountRate) {
  const ss = getSpreadsheet_();
  const targetSheet = ss.getSheetByName(sheetName);
  const GetRowCol = new GetTargetRowCol();
  const sumRow = GetRowCol.getTargetRow(targetSheet, 2, ITEM_LABELS.SUM);
  const sumCol = GetRowCol.getTargetCol(targetSheet, 4, ITEM_LABELS.AMMOUNT);
  const sumValue = targetSheet.getRange(sumRow, sumCol).getValue();
  const discountValue = targetSheet.getRange(sumRow + 1, sumCol).getValue();
  const test1 = Math.trunc(sumValue * (1 - discountRate));
  const test2 = Math.trunc(discountValue);
  const discountCheck =
    discountRate >= 0 ||
    ss
      .getSheetByName(sheetName)
      .getSheetByName(sheetName)
      .getRange("B2")
      .getValue() === ""
      ? test1 === test2
      : discountValue === "";
  return discountCheck;
}

/**
 * Totalシートの合計金額と縦計の値を比較する
 *
 * Totalシートの指定列（AMOUNT列）の縦計の合計値と、合計行の金額を比較し、
 * 一致していれば「OK」、一致していなければNGメッセージを返す。
 *
 * @returns {Array} 配列 [ステータス, メッセージ]
 *   - ステータス: VALIDATION_STATUS.OK または buildNgMessage_で生成されたNGメッセージ
 *   - メッセージ: 縦計と合計金額の値を含む説明文字列
 */
function compareTotalSheetTotaltoVerticalTotal_() {
  const RowColResolver = new GetTargetRowCol();
  const amountColumnIndex = RowColResolver.getTargetCol(
    _cachedSheets.total,
    4,
    ITEM_LABELS.AMMOUNT,
  );
  const totalValues = _cachedSheets.total.getDataRange().getValues();

  const TOTAL_LABEL = "　合計金額";
  const toNumber = (v) => Number(v) || 0;

  // 合計行を取得
  const totalRow = totalValues.find((row) => row[1] === ITEM_LABELS.SUM);
  if (!totalRow) {
    return [
      buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
      "合計金額行が見つかりません",
    ];
  }

  const totalAmountCellValue = totalRow[amountColumnIndex - 1];

  // 縦計の値を取得（空白・ラベル行除外）
  const verticalTotal = totalValues
    .filter(
      (row) =>
        row[amountColumnIndex] !== "" && row[amountColumnIndex] !== TOTAL_LABEL,
    )
    .map((row) => toNumber(row[amountColumnIndex]))
    .reduce((sum, val) => sum + val, 0);

  return [
    totalAmountCellValue === verticalTotal
      ? VALIDATION_STATUS.OK
      : buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
    `Totalシートの縦計と合計金額のチェック, 縦計: ${verticalTotal}, 合計金額: ${totalAmountCellValue}`,
  ];
}

/**
 * Total2/Total3シートの縦計と横計を比較するクラス
 */
class CompareTotal2Total3Sheet {
  constructor() {
    /** 全体の割引率（TrialシートB47） */
    this.discountRate = _cachedSheets.trial.getRange("B47").getValue();

    /** チェック対象シート情報 */
    this.targetSheets = [
      { sheet: _cachedSheets.total2, termRowIdx: 3 },
      { sheet: _cachedSheets.total3, termRowIdx: 2 },
    ];

    /** 行・列インデックス取得用 */
    this.rowColResolver = new GetTargetRowCol();

    /** シートデータを加工したオブジェクト */
    this.targets = this.targetSheets.map((info) => ({
      sheet: info.sheet,
      termRowIdx: info.termRowIdx,
      setupStartColIdx: 3,
      totalValues: info.sheet.getDataRange().getValues(),
    }));
  }

  /**
   * 指定セル範囲の縦計または横計を計算
   * @param {Object} targetData チェック対象シート情報
   * @param {number} rowIndex 対象行番号
   * @param {number} colIndex 対象列番号
   * @param {"horizontal"|"vertical"} direction 計算方向
   * @returns {number} 合計値
   */
  getSum(targetData, rowIndex, colIndex, direction = "horizontal") {
    if (direction === "horizontal") {
      return targetData.totalValues[rowIndex]
        .slice(targetData.setupStartColIdx, colIndex)
        .filter((v) => v > 0)
        .reduce((sum, v) => sum + v, 0);
    } else {
      return targetData.totalValues
        .filter((row, idx) => row[colIndex] > 0 && idx < rowIndex)
        .map((row) => row[colIndex])
        .reduce((sum, v) => sum + v, 0);
    }
  }

  /**
   * 行番号・列番号を取得
   * @param {Object} targetData チェック対象シート情報
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @returns {{row:number, col:number}} 行番号・列番号
   */
  getRowCol(targetData, rowLabel, colLabel) {
    return {
      row: this.rowColResolver.getTargetRowIndex(targetData.sheet, 1, rowLabel),
      col: this.rowColResolver.getTargetColIndex(
        targetData.sheet,
        targetData.termRowIdx,
        colLabel,
      ),
    };
  }

  /**
   * 縦計と横計を誤差なしで比較
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @returns {Array} ["OK"/"NG", チェック説明]
   */
  compareTotalsExact(rowLabel = ITEM_LABELS.SUM, colLabel = ITEM_LABELS.SUM) {
    const results = this.targets.map((target) => {
      const { row, col } = this.getRowCol(target, rowLabel, colLabel);
      const horizontalTotal = this.getSum(target, row, col, "horizontal");
      const verticalTotal = this.getSum(target, row, col, "vertical");
      return horizontalTotal === verticalTotal;
    });

    return toStatusFromBooleanArray_(
      results,
      VALIDATION_MESSAGES.VALUE_MISMATCH,
      "Total2, Total3の縦計と横計のチェック",
    );
  }

  /**
   * 割引後の横計と縦計×(1-割引率)を比較（誤差±1円）
   * @returns {boolean[]} 比較結果（true: 許容範囲内）
   */
  compareTotalsWithDiscount() {
    return this.targets.map((target) => {
      const sumRowCol = this.getRowCol(
        target,
        ITEM_LABELS.SUM,
        ITEM_LABELS.SUM,
      );
      const discountRowCol = this.getRowCol(
        target,
        "特別値引後合計",
        ITEM_LABELS.SUM,
      );

      const verticalTotal =
        this.getSum(target, sumRowCol.row, sumRowCol.col, "vertical") *
        (1 - this.discountRate);
      const horizontalTotal = this.getSum(
        target,
        discountRowCol.row,
        discountRowCol.col,
        "horizontal",
      );

      return Math.abs(verticalTotal - horizontalTotal) <= 1;
    });
  }
}

/**
 * Total2, Total3の縦計と横計をチェック（誤差なし）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_() {
  const comparator = new CompareTotal2Total3Sheet();
  return comparator.compareTotalsExact();
}

/**
 * Total2, Total3の縦計×特別値引率と特別値引後横計をチェック（誤差±1円）
 * @returns {Array} ["OK"/"NG", チェック説明]
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_() {
  const comparator = new CompareTotal2Total3Sheet();
  const discountResults = comparator.compareTotalsWithDiscount();
  return toStatusFromBooleanArray_(
    discountResults,
    VALIDATION_MESSAGES.TOTAL_MISMATCH,
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  );
}
