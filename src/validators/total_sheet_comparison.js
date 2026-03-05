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
  const isMatch = (a, b) => a === b;

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
    isMatch(totalAmountCellValue, verticalTotal)
      ? VALIDATION_STATUS.OK
      : buildNgMessage_(VALIDATION_MESSAGES.TOTAL_MISMATCH),
    `Totalシートの縦計と合計金額のチェック, 縦計: ${verticalTotal}, 合計金額: ${totalAmountCellValue}`,
  ];
}

/**
 * Total2シートとTotal3シートにおいて、縦計と横計の整合性をチェックするクラス
 */
class CompareTotal2Total3SheetVerticalTotalToHorizontal {
  constructor() {
    /**
     * 全体の割引率（TrialシートのB47セル）
     * @type {number}
     */
    this.discountRate = _cachedSheets.trial.getRange("B47").getValue();

    /**
     * チェック対象のシート情報
     * @type {Array<{sheet: GoogleAppsScript.Spreadsheet.Sheet, termRowIdx: number}>}
     */
    this.targetSheets = [
      { sheet: _cachedSheets.total2, termRowIdx: 3 },
      { sheet: _cachedSheets.total3, termRowIdx: 2 },
    ];

    /**
     * 行・列インデックス取得用ユーティリティ
     * @type {GetTargetRowCol}
     */
    this.rowColResolver = new GetTargetRowCol();

    /**
     * チェック対象シートのデータを加工したオブジェクト
     * @type {Array<{sheet: GoogleAppsScript.Spreadsheet.Sheet, termRowIdx: number, setupStartColIdx: number, totalValues: any[][]}>}
     */
    this.targets = this.targetSheets.map((info) => ({
      sheet: info.sheet,
      termRowIdx: info.termRowIdx,
      setupStartColIdx: 3,
      totalValues: info.sheet.getDataRange().getValues(),
    }));
  }

  /**
   * 指定セル範囲の縦計または横計を計算する
   * @param {Object} targetData チェック対象シート情報
   * @param {number} rowIndex 対象行インデックス
   * @param {number} colIndex 対象列インデックス
   * @param {"horizontal"|"vertical"} direction 計算方向
   * @return {number} 計算された合計値
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
   * 指定ラベルの行番号・列番号を取得する
   * @param {Object} targetData チェック対象シート情報
   * @param {string} rowLabel 行ラベル
   * @param {string} colLabel 列ラベル
   * @return {{row: number, col: number}} 行番号・列番号
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
   * 横計と縦計を比較する（誤差なし）
   * @param {string} rowLabel 行ラベル（デフォルト: "SUM"）
   * @param {string} colLabel 列ラベル（デフォルト: "SUM"）
   * @return {Array} ["OK"/"NG", チェック説明] の配列
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
   * 割引後の横計と縦計×(1-割引率)を比較する（誤差±1円許容）
   * @return {boolean[]} 各シートの比較結果（true: 許容範囲内、false: 範囲外）
   */
  compareTotalsWithDiscount() {
    const results = this.targets.map((target) => {
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

    return results;
  }
}

/**
 * Total2, Total3の縦計と横計を比較する
 * @return {Array} ["OK"/"NG", チェック説明] の配列
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_() {
  const comparator = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
  return comparator.compareTotalsExact();
}

/**
 * Total2, Total3の縦計×特別値引率と特別値引後横計を比較する
 * 誤差は±1円まで許容
 * @return {Array} ["OK"/"NG", チェック説明] の配列
 */
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_() {
  const comparator = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
  const discountComparisonResults = comparator.compareTotalsWithDiscount();
  return toStatusFromBooleanArray_(
    discountComparisonResults,
    VALIDATION_MESSAGES.TOTAL_MISMATCH,
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  );
}
