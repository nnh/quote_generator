/**
 * 症例数をスクリプトプロパティに保存する
 * @param {string} value 症例数
 * @param {PropertiesService.Properties} scriptProperties
 * @return {void}
 */
function setNumberOfCasesProperty_(value, scriptProperties) {
  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.NUMBER_OF_CASES,
    value,
    scriptProperties,
  );
}
/**
 * 施設数をスクリプトプロパティに保存する
 * @param {string} value 施設数
 * @param {PropertiesService.Properties} scriptProperties
 * @return {void}
 */
function setFacilitiesProperty_(value, scriptProperties) {
  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.FACILITIES_VALUE,
    value,
    scriptProperties,
  );
}
/**
 * 試験種別をスクリプトプロパティに保存する
 * @param {string} trialType 試験種別
 * @param {PropertiesService.Properties} scriptProperties
 * @return {void}
 */
function setTrialTypeProperty_(trialType, scriptProperties) {
  setScriptProperty_(
    SCRIPT_PROPERTY_KEYS.TRIAL_TYPE_VALUE,
    trialType,
    scriptProperties,
  );
}
/**
 * Setup / Closing期間をスクリプトプロパティに保存する
 * @param {number} setupTerm Setup期間（月数）
 * @param {number} closingTerm Closing期間（月数）
 * @return {void}
 */
function saveSetupClosingTerm_(setupTerm, closingTerm) {
  const props = PropertiesService.getScriptProperties();

  props.setProperty(SCRIPT_PROPERTY_KEYS.SETUP_TERM, setupTerm);

  props.setProperty(SCRIPT_PROPERTY_KEYS.CLOSING_TERM, closingTerm);
}
