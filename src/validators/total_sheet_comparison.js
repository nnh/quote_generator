/**
 * In the Total sheet, compare the total to the vertical total.
 * @param none.
 * @return {string} <array> output message.
 */
function compareTotalSheetTotaltoVerticalTotal_() {
  const sheet = get_sheets();
  const GetRowCol = new GetTargetRowCol();
  const goukeikingakuCol = GetRowCol.getTargetCol(
    sheet.total,
    4,
    ITEM_LABELS.AMMOUNT,
  );
  const totalValues = sheet.total.getDataRange().getValues();
  const sum = totalValues.filter((x) => x[1] === ITEM_LABELS.SUM)[0][
    goukeikingakuCol - 1
  ];
  const arrayGoukeikingaku = totalValues
    .filter(
      (x) => x[goukeikingakuCol] !== "" && x[goukeikingakuCol] !== "　合計金額",
    )
    .map((x) => x[goukeikingakuCol]);
  const sumGoukeikingaku = arrayGoukeikingaku.reduce((x, y) => x + y, 0);
  return [
    sum === sumGoukeikingaku ? "OK" : "NG：値が想定と異なる",
    "Totalシートの縦計と合計金額のチェック, 縦計:" +
      +sumGoukeikingaku +
      ", 合計金額:" +
      sum,
  ];
}
/**
 * In the Total2 sheet and Total3 sheet, compare the horizontal total to the vertical total.
 * @param none.
 * @return {string} <array> output message.
 */
class CompareTotal2Total3SheetVerticalTotalToHorizontal {
  constructor() {
    const st = get_sheets();
    this.discountRate = st.trial.getRange("B47").getValue();
    this.targetSheet = [
      [st.total2, 3],
      [st.total3, 2],
    ];
    this.GetRowCol = new GetTargetRowCol();
    this.target = this.targetSheet.map((x) => {
      const res = {};
      res.sheet = x[0];
      res.termRowIdx = x[1];
      res.setupIdx = 3;
      res.totalValues = res.sheet.getDataRange().getValues();
      return res;
    });
  }
  getTargetRowCol(target, rowItemName, colItemName) {
    const res = {};
    res.col = this.GetRowCol.getTargetColIndex(
      target.sheet,
      target.termRowIdx,
      colItemName,
    );
    res.row = this.GetRowCol.getTargetRowIndex(target.sheet, 1, rowItemName);
    return res;
  }
  getVerticalHorizontalTotal(target, goukeiRowCol) {
    const res = {};
    res.horizontalTotal = this.getHorizontalTotal(target, goukeiRowCol);
    res.verticalTotal = this.getVerticalTotal(target, goukeiRowCol);
    return res;
  }
  getHorizontalTotal(target, goukeiRowCol) {
    const targetSum = target.totalValues[goukeiRowCol.row].slice(
      target.setupIdx,
      goukeiRowCol.col,
    );
    return targetSum.filter((x) => x > 0).reduce((x, y) => x + y, 0);
  }
  getVerticalTotal(target, goukeiRowCol) {
    return target.totalValues
      .filter((x, idx) => x[goukeiRowCol.col] > 0 && idx < goukeiRowCol.row)
      .map((x) => x[goukeiRowCol.col])
      .reduce((x, y) => x + y, 0);
  }
  compareTotal() {
    const res = this.target.map((x) => {
      const goukeiRowCol = this.getTargetRowCol(
        x,
        ITEM_LABELS.SUM,
        ITEM_LABELS.SUM,
      );
      const compareTarget = this.getVerticalHorizontalTotal(x, goukeiRowCol);
      return this.getComparisonResultEqual(compareTarget);
    });
    return [
      res.every((x) => x) ? "OK" : "NG：値が想定と異なる",
      "Total2, Total3の縦計と横計のチェック",
    ];
  }
  compareDiscountTotal() {
    // Compare the vertical totals of Total2 and 3 multiplied by the overall discount with the discounted totals of Total2 and 3.
    // An error of 1 yen is acceptable.
    const res = this.target.map((x) => {
      const res = {};
      const goukeiRowCol = this.getTargetRowCol(
        x,
        ITEM_LABELS.SUM,
        ITEM_LABELS.SUM,
      );
      res.verticalTotal =
        this.getVerticalTotal(x, goukeiRowCol) * (1 - this.discountRate);
      const discountRowCol = this.getTargetRowCol(
        x,
        "特別値引後合計",
        ITEM_LABELS.SUM,
      );
      res.horizontalTotal = this.getHorizontalTotal(x, discountRowCol);
      return res;
    });
    return res.map(
      (x) =>
        x.horizontalTotal - 1 <= x.verticalTotal &&
        x.verticalTotal <= x.horizontalTotal + 1,
    );
  }
  getComparisonResultEqual(compareTarget) {
    return compareTarget.horizontalTotal === compareTarget.verticalTotal;
  }
}
function compareTotal2Total3SheetVerticalTotalToHorizontalTotal_() {
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
  return cp.compareTotal();
}
function compareTotal2Total3SheetVerticalTotalToHorizontalDiscountTotal_() {
  const cp = new CompareTotal2Total3SheetVerticalTotalToHorizontal();
  const res = cp.compareDiscountTotal();
  return [
    res.every((x) => x) ? "OK" : "NG",
    "Total2, Total3の縦計*特別値引率と特別値引後合計の横計のチェック",
  ];
}
