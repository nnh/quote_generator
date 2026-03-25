/**
 * 年数計算用の数式を生成する
 *
 * @param {string} startAddr 開始日セルのA1形式
 * @param {string} endAddr 終了日セルのA1形式
 * @return {string} 年数計算式
 */
function buildYearFormula_(startAddr, endAddr) {
  return `=if(and(${startAddr}<>"",${endAddr}<>""),datedif(${startAddr},${endAddr},"y")+1,"")`;
}

/**
 * 総月数の数式を生成する
 *
 * @param {string} startAddr
 * @param {string} endAddr
 * @return {string}
 */
function buildTotalMonthFormula_(startAddr, endAddr) {
  return `=datedif(${startAddr},(${endAddr}+1),"m")`;
}

/**
 * 年月表示用の数式を生成する
 *
 * @param {string} totalAddr 総月数セルのA1形式
 * @return {string}
 */
function buildYearMonthDisplayFormula_(totalAddr) {
  return `=trunc(${totalAddr}/12) & "年" & if(mod(${totalAddr},12)<>0,mod(${totalAddr},12) & "ヶ月","")`;
}
