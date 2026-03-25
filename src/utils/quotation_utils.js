/**
 * 見積区分ラベルを表示用の文言に変換する
 *
 * @param {string} value 見積区分（例: "正式見積"）
 * @return {string} 表示用ラベル（"御見積書" または "御参考見積書"）
 */
function convertQuotationTypeLabel_(value) {
  return value === "正式見積" ? "御見積書" : "御参考見積書";
}

/**
 * 資金区分に応じて見積係数を正規化する
 *
 * - 商用企業の場合: 1.5
 * - それ以外: 1
 *
 * @param {string} coefficientValue quotation_requestシートの資金区分ラベル
 * @return {number} 正規化された係数
 */
function normalizeCoefficient_(coefficientValue) {
  const commercialCoefficient = QUOTATION_COMMERCIAL_FUNDING_SOURCE_LABEL;

  return coefficientValue === commercialCoefficient ? 1.5 : 1;
}

/**
 * CDISC対応有無に応じてCRF項目数を変換する
 *
 * @param {string|number} crfCount CRF項目数
 * @param {boolean} isCdiscEnabled CDISC対応フラグ
 * @return {string|number} 変換後の値（CDISCありの場合は数式文字列）
 */
function convertCrfValueForCdisc_(crfCount, isCdiscEnabled) {
  if (!isCdiscEnabled) {
    return crfCount;
  }

  return buildCdiscCrfFormula_(crfCount);
}

/**
 * CRF項目数をCDISC加算用の数式に変換する
 *
 * @param {string|number} crfCount CRF項目数
 * @return {string} CDISC加算用の数式（例: "=10*1.2"）
 */
function buildCdiscCrfFormula_(crfCount) {
  const crfValue = typeof crfCount === "number" ? crfCount : `"${crfCount}"`;
  return `=${crfValue}*${CDISC_ADDITION}`;
}
