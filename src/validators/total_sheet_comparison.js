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

/**
 * Itemsシートと totalCheckItems の整合性を検証する。
 *
 * 【検証内容】
 * 1. Itemsシートに存在する項目が totalCheckItems に含まれているか（不足チェック）
 * 2. totalCheckItems に存在する項目が Itemsシートに含まれているか（余分チェック）
 *
 * Itemsシートの「（税抜）」「（税込）」は除去して比較する。
 *
 * 不整合がある場合は Error をスローする。
 *
 * @param {Array<Object>} totalCheckItems
 * @param {string} totalCheckItems[].itemname
 */
function validateItemsSheetCoverage_(totalCheckItems) {
  const itemsSheetValues = _cachedSheets.items
    .getRange(1, 2, _cachedSheets.items.getLastRow(), 1)
    .getValues()
    .flat();

  /** Itemsシート項目 */
  const sheetItemSet = new Set(
    itemsSheetValues
      .map((item) => item.replace(/（税抜）|（税込）/g, ""))
      .map((item) => item.trim())
      .filter((item) => item !== ""),
  );

  /** コード側項目 */
  const codeItemSet = new Set(totalCheckItems.map((item) => item.itemname));

  /** ===== 不足チェック ===== */
  const missingItems = [...sheetItemSet].filter(
    (name) => !codeItemSet.has(name),
  );

  /** ===== 余分チェック ===== */
  const extraItems = [...codeItemSet].filter((name) => !sheetItemSet.has(name));

  if (missingItems.length > 0 || extraItems.length > 0) {
    const messages = [];

    if (missingItems.length > 0) {
      messages.push(
        "Itemsシートに存在するがチェック対象に含まれていない項目:\n" +
          missingItems.join("\n"),
      );
    }

    if (extraItems.length > 0) {
      messages.push(
        "コード側に存在するがItemsシートに存在しない項目:\n" +
          extraItems.join("\n"),
      );
    }

    console.error(messages.join("\n\n"));
  }
}
