/**
 * Sheet Utilities Module (sheet-utilities.gs)
 *
 * This module provides utility functions for sheet manipulation, column/row finding,
 * and display control. These functions are designed to be reusable across the system.
 *
 * Functions:
 * - show_hidden_cols(): Controls column visibility based on values
 * - total2_3_show_hidden_cols(): Applies visibility rules to target sheets
 * - get_years_target_col(): Finds column numbers by header text
 * - get_goukei_row(): Finds row numbers for totals
 * - extract_target_sheet(): Gets target sheet objects for operations
 *
 * Dependencies:
 * - ConfigCache (from config-cache.gs)
 * - Add_del_columns (from column-operations.gs)
 * - get_sheets() (from common.gs)
 */

/**
 * Total2, Total3シート
 * 合計0円の列を非表示に、0円以上の列を表示にする
 * @param {sheet} target_sheet シート名
 * @return none
 */
function show_hidden_cols(target_sheet, configCache = null) {
  try {
    if (!target_sheet) {
      console.error("Target sheet is not provided");
      return;
    }

    const cache = configCache || new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to get script properties");
      return;
    }

    // 「合計」行を取得
    const goukei_row = get_goukei_row(target_sheet, cache);
    if (!goukei_row || goukei_row <= 0) {
      console.warn("Could not find goukei row");
      return;
    }

    // 「合計」列を取得
    const goukei_col = get_years_target_col(target_sheet, "合計", cache);
    if (!goukei_col || goukei_col <= 0) {
      console.warn("Could not find goukei column");
      return;
    }

    // 「Setup」列を取得
    const add_del = new Add_del_columns(target_sheet);
    const header_t = add_del.get_setup_closing_range();
    if (!header_t) {
      console.warn("Could not get setup closing range");
      return;
    }

    if (!cache.setupSheetName) {
      console.error("Setup sheet name property not found");
      return;
    }

    const setup_idx = header_t.indexOf(cache.setupSheetName);
    if (setup_idx < 0) {
      console.warn(`Setup sheet "${cache.setupSheetName}" not found in header`);
      return;
    }

    const setup_col = setup_idx + 1;

    // 「Setup」〜「合計」の一つ前のセルまでを処理対象にする
    for (let i = setup_col; i < goukei_col; i++) {
      if (i > 0 && i <= target_sheet.getLastColumn()) {
        let temp_range = target_sheet.getRange(goukei_row, i);
        const value = temp_range.getValue();
        if (typeof value === "number") {
          value > 0
            ? target_sheet.unhideColumn(temp_range)
            : target_sheet.hideColumn(temp_range);
        } else {
          target_sheet.hideColumn(temp_range);
        }
      }
    }
  } catch (error) {
    console.error("Error in show_hidden_cols:", error.toString());
  }
}

function total2_3_show_hidden_cols() {
  try {
    const cache = new ConfigCache();
    const target_sheets = extract_target_sheet(cache);
    if (!target_sheets || target_sheets.length === 0) {
      console.warn("No target sheets found for show_hidden_cols");
      return;
    }
    target_sheets.forEach((x) => show_hidden_cols(x, cache));
  } catch (error) {
    console.error("Error in total2_3_show_hidden_cols:", error.toString());
  }
}

/**
 * 引数に与えた文字列があるセルの列番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @param {string} target_str 検索する文字列
 * @return {number}
 */
function get_years_target_col(sheet, target_str, configCache = null) {
  try {
    if (!sheet) {
      console.error("Sheet is not provided");
      return null;
    }

    if (!target_str) {
      console.error("Target string is not provided");
      return null;
    }

    const cache = configCache || new ConfigCache();
    if (!cache.isValid || !cache.total2SheetName || !cache.total3SheetName) {
      console.error("Total2 or Total3 sheet name properties not found");
      return null;
    }

    const sheet_name = sheet.getName();
    const target_row = sheet_name.includes(cache.total2SheetName)
      ? 4
      : sheet_name.includes(cache.total3SheetName)
      ? 3
      : null;

    if (!target_row) {
      console.warn(
        `Sheet "${sheet_name}" does not match total2 or total3 sheet names`
      );
      return null;
    }

    const lastColumn = sheet.getLastColumn();
    if (lastColumn <= 0) {
      console.error("Sheet has no columns");
      return null;
    }

    const target_values = sheet
      .getRange(target_row, 1, 1, lastColumn)
      .getValues()[0];
    if (!target_values || target_values.length === 0) {
      console.error("Target row is empty");
      return null;
    }

    const target_idx = target_values.indexOf(target_str);
    return target_idx >= 0 ? target_idx + 1 : null;
  } catch (error) {
    console.error("Error in get_years_target_col:", error.toString());
    return null;
  }
}

/**
 * 「合計」の行番号を返す。
 * @param {sheet} sheet Total2/Total3を指定
 * @return {number}
 */
function get_goukei_row(sheet, configCache = null) {
  try {
    if (!sheet) {
      console.error("Sheet is not provided");
      return null;
    }

    const cache = configCache || new ConfigCache();
    if (!cache.isValid || !cache.total2SheetName || !cache.total3SheetName) {
      console.error("Total2 or Total3 sheet name properties not found");
      return null;
    }

    const sheet_name = sheet.getName();
    const target_col = sheet_name.includes(cache.total2SheetName)
      ? 2
      : sheet_name.includes(cache.total3SheetName)
      ? 2
      : null;

    if (!target_col) {
      console.warn(
        `Sheet "${sheet_name}" does not match total2 or total3 sheet names`
      );
      return null;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow <= 0) {
      console.error("Sheet has no rows");
      return null;
    }

    const target_values = sheet.getRange(1, target_col, lastRow, 1).getValues();
    if (!target_values || target_values.length === 0) {
      console.error("Target column is empty");
      return null;
    }

    const goukei_indices = target_values
      .map((x, idx) => (x[0] === "合計" ? idx : null))
      .filter((x) => x !== null && x >= 0);

    if (goukei_indices.length === 0) {
      console.warn('Could not find "合計" in target column');
      return null;
    }

    return goukei_indices[0] + 1;
  } catch (error) {
    console.error("Error in get_goukei_row:", error.toString());
    return null;
  }
}

/**
 * Total2, Total3シートの列構成用
 * 対象のシートオブジェクトの配列を返す
 * @param none
 * @return {[sheet]}
 */
function extract_target_sheet(configCache = null) {
  try {
    const cache = configCache || new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to get script properties");
      return [];
    }

    const sheet = get_sheets();
    if (!sheet) {
      console.error("Failed to get sheets");
      return [];
    }

    if (!cache.total2SheetName || !cache.total3SheetName) {
      console.error("Total2 or Total3 sheet name properties not found");
      return [];
    }

    const total_T = [
      cache.total2SheetName.toLowerCase(),
      cache.total3SheetName.toLowerCase(),
    ];
    const total_foot_T = [
      "",
      cache.nameNmc ? "_" + cache.nameNmc : "",
      cache.nameOscr ? "_" + cache.nameOscr : "",
    ].filter((x) => x !== null);

    const target_sheets = total_T.reduce((res, total) => {
      if (!total) {
        console.warn("Empty total sheet name found");
        return res;
      }
      // Total3は_nmc, _oscrが存在しない
      const sheetsToAdd = total_foot_T
        .filter((_, idx) => {
          return !(total === cache.total3SheetName.toLowerCase() && idx > 0);
        })
        .map((foot) => {
          const sheet_key = total + foot;
          if (sheet[sheet_key]) {
            return sheet[sheet_key];
          }
          console.warn(`Sheet "${sheet_key}" not found`);
          return null; // 存在しない場合はnullを返しておく
        })
        .filter((sheetObject) => sheetObject !== null);
      return res.concat(sheetsToAdd);
    }, []);
    if (target_sheets.length === 0) {
      console.warn("No target sheets found");
    }

    return target_sheets;
  } catch (error) {
    console.error("Error in extract_target_sheet:", error.toString());
    return [];
  }
}
