/**
 * 【テスト用】
 * シート名を返す
 */
function getSetupSheetNameForTest_() {
  return "Setup";
}
function getRegistration1SheetNameForTest_() {
  return "Registration_1";
}
function getClosingSheetNameForTest_() {
  return "Closing";
}
function getTargetSheetNameForTest_() {
  const targetSheetsName = [
    getSetupSheetNameForTest_(),
    getRegistration1SheetNameForTest_(),
    "Registration_2",
    "Interim_1",
    "Observation_1",
    "Interim_2",
    "Observation_2",
    getClosingSheetNameForTest_(),
  ];
  return targetSheetsName;
}
/**
 * 【テスト用】
 * 試験種別の一覧を返す
 */
function getTrialTypeListForTest_() {
  return [
    "医師主導治験",
    "特定臨床研究",
    "観察研究・レジストリ",
    "介入研究（特定臨床研究以外）",
    "先進",
  ];
}
/**
 * 【テスト用】
 * 事務局関連条件の全組み合わせを返す
 *
 * @returns {Array<Object>}
 */
function getClinicalTrialsOfficeTestArray_() {
  const fundSources = [
    "営利企業原資（製薬企業等）",
    "公的資金（税金由来）",
    "",
  ];

  const officeFlags = ["あり", "なし", ""];

  return createAllCombinations_(fundSources, officeFlags).map(
    ([fundSource, officeFlag]) => ({
      funding_source: fundSource,
      office_value: officeFlag,
    }),
  );
}
/**
 * 試験条件から「事務局運営フラグ」を判定する
 *
 * 判定ルール：
 * 1. 試験種別が「医師主導治験」の場合は、他条件に関わらず必ず 1
 * 2. 上記以外で、事務局運営が「あり」の場合は 1
 * 3. 上記以外で、資金提供元が「営利企業原資（製薬企業等）」の場合は 1
 * 4. いずれにも該当しない場合は 0
 *
 * ※ 条件は優先度順に評価される
 *
 * @param {Object} obj 判定に必要な情報をまとめたオブジェクト
 * @param {string} obj.office_value 事務局運営の有無（例："あり" / "なし"）
 * @param {string} obj.funding_source 資金提供元
 * @returns {number} 事務局運営フラグ（1: 対象, 0: 非対象）
 */
function test_get_clinical_trials_office_flg_(obj) {
  const trialType =
    PropertiesService.getScriptProperties().getProperty("trial_type_value");
  const office_value = obj.office_value;
  const cofficient_value = obj.funding_source;
  if (trialType === "医師主導治験") {
    return 1;
  } else if (office_value === "あり") {
    return 1;
  } else if (cofficient_value === "営利企業原資（製薬企業等）") {
    return 1;
  } else {
    return 0;
  }
}
