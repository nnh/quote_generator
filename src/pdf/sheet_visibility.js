/**
 * 指定したシートのみ表示状態にして処理を実行する
 * 処理後は必ず元の状態に戻す（try-finally）
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet[]} targetSheets
 * @param {Function} callback
 */
function withSheetsVisibleOnly_(targetSheets, callback) {
  const ss = getSpreadsheet_();
  const allSheets = ss.getSheets();

  const state = allSheets.map((sheet) => ({
    sheet,
    isHidden: sheet.isSheetHidden(),
    name: sheet.getName(),
  }));

  const targetSet = new Set(targetSheets.map((s) => s.getName()));

  try {
    // 非対象シートを非表示
    state.forEach(({ sheet, name }) => {
      if (!targetSet.has(name)) {
        sheet.hideSheet();
      }
    });

    callback();
  } finally {
    // 元に戻す
    state.forEach(({ sheet, isHidden }) => {
      isHidden ? sheet.hideSheet() : sheet.showSheet();
    });
  }
}
