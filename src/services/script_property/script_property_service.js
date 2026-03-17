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
  const scriptProperties =
    scriptProperties || PropertiesService.getScriptProperties();
  scriptProperties.setProperty(key, value);
}
