/**
 * スクリプトプロパティを設定する共通関数
 *
 * - scriptProperties が渡された場合はそれを使用
 * - 未指定の場合は ScriptProperties を取得して使用
 *
 * @param {string} key
 *   設定するプロパティキー
 *
 * @param {string|number|boolean} value
 *   設定する値
 *
 * @param {PropertiesService.Properties} [scriptProperties]
 *   使用するプロパティオブジェクト。省略した場合は ScriptProperties を使用
 *
 * @return {void}
 */
function setScriptProperty_(key, value, scriptProperties) {
  const sp = scriptProperties || PropertiesService.getScriptProperties();
  sp.setProperty(key, value);
}
/**
 * スクリプトプロパティを取得する共通関数
 *
 * - scriptProperties が渡された場合はそれを使用
 * - 未指定の場合は ScriptProperties を取得して使用
 *
 * @param {string} key
 *   取得するプロパティキー
 *
 * @param {PropertiesService.Properties} [scriptProperties]
 *   使用するプロパティオブジェクト。省略した場合は ScriptProperties を使用
 *
 * @return {string|null}
 *   プロパティの値。存在しない場合は null
 */
function getScriptProperty_(key, scriptProperties) {
  const sp = scriptProperties || PropertiesService.getScriptProperties();
  return sp.getProperty(key);
}
