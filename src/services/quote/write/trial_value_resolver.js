/**
 * trialシートに設定する値を解決する
 *
 * @param {string} key 項目名
 * @param {*} fieldValue quotation_requestの値
 * @param {{isCdiscEnabled?: boolean}} [options]
 * @return {*} 変換後の値
 */
function resolveTrialFieldValue_(key, fieldValue, options = {}) {
  if (fieldValue == null) return null;

  const { isCdiscEnabled = false } = options;

  switch (key) {
    case TRIAL_SHEET.ITEMNAMES.QUOTATION_TYPE:
      return convertQuotationTypeLabel_(fieldValue);

    case ITEM_LABELS.FUNDING_SOURCE_LABEL:
      return normalizeCoefficient_(fieldValue);

    case TRIAL_SHEET.ITEMNAMES.CRF:
      return convertCrfValueForCdisc_(fieldValue, isCdiscEnabled);

    default:
      return fieldValue;
  }
}

/**
 * trialシート関連の副作用処理を実行する
 *
 * - プロパティ設定
 * - シート更新
 * - コメント更新
 * - スプレッドシート名変更
 *
 * @param {string} key 項目名
 * @param {*} fieldValue 値
 * @param {{scriptProperties: PropertiesService.Properties, isCdiscEnabled: boolean}} context
 * @return {void}
 */
function applyTrialSideEffects_(key, fieldValue, context) {
  const { scriptProperties, isCdiscEnabled } = context;

  switch (key) {
    case TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE:
      applyTrialType_(fieldValue, _cachedSheets);
      break;
    case ITEM_LABELS.NUMBER_OF_CASES:
      setNumberOfCasesProperty_(fieldValue, scriptProperties);
      break;
    case ITEM_LABELS.FACILITIES:
      setFacilitiesProperty_(fieldValue, scriptProperties);
      break;
    case ITEM_LABELS.ACRONYM:
      renameSpreadsheetWithAcronym_(fieldValue);
      break;
    case TRIAL_SHEET.ITEMNAMES.CRF:
      applyCdiscComment_(isCdiscEnabled);
      break;
  }
}
