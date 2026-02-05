/**
 * データベース管理料の対象月数を計算する（純粋関数）
 * @param {string} sheetName
 * @param {number} trialTargetTerms
 * @param {number} setupTerm
 * @param {number} reg1SetupDatabaseManagement
 * @return {number}
 */
function calculateDatabaseManagementTermPure_(
  sheetName,
  trialTargetTerms,
  setupTerm,
  reg1SetupDatabaseManagement,
) {
  let term = Math.min(trialTargetTerms, 12);

  if (sheetName === QUOTATION_SHEET_NAMES.SETUP) {
    term -= setupTerm;
  }

  if (sheetName === QUOTATION_SHEET_NAMES.REGISTRATION_1) {
    term -= reg1SetupDatabaseManagement;
  }

  return term;
}
/**
 * データベース管理料の対象月数を計算する
 * @param {string} sheetName
 * @param {number} trialTargetTerms
 * @param {PropertiesService.Properties} scriptProperties
 * @return {number}
 */
function calculateDatabaseManagementTerm_(
  sheetName,
  trialTargetTerms,
  scriptProperties,
) {
  return calculateDatabaseManagementTermPure_(
    sheetName,
    trialTargetTerms,
    Number(scriptProperties.getProperty("setup_term")),
    Number(scriptProperties.getProperty("reg1_setup_database_management")),
  );
}
function shouldSkipDatabaseManagement_(sheetName, trialTargetTerms, setupTerm) {
  return (
    sheetName === QUOTATION_SHEET_NAMES.SETUP && trialTargetTerms <= setupTerm
  );
}
/**
 * プロジェクト管理料の対象月数を計算する
 * @param {number} trialTargetTerms
 * @return {number}
 */
function calculateProjectManagementTerm_(trialTargetTerms) {
  return Math.min(trialTargetTerms, 12);
}
/**
 * 共通（全シート共通）の設定項目を生成する
 * @param {number} trialTargetTerms
 * @return {Array<Array>}
 */
function buildCommonSetItems_(trialTargetTerms) {
  return [
    [
      ITEMS_SHEET.ITEMNAMES.PROJECT_MANAGEMENT,
      calculateProjectManagementTerm_(trialTargetTerms),
    ],
  ];
}
