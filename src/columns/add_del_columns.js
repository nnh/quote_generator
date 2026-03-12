/**
 * Setup〜Closing の列構造を整理するクラス。
 *
 * 以下の処理を行う：
 * - Setup〜Closing の範囲外の列を無視
 * - 見出しが空白の列を削除
 * - 重複している見出し列を1列に統一
 * - 必要に応じて列を追加
 */
class AddDelColumns {
  /**
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 対象シート（Total2 / Total3）
   */
  constructor(sheet) {
    /** @type {GoogleAppsScript.Spreadsheet.Sheet} */
    this.sheet = sheet;

    /** @type {number} 見出し行番号 */
    this.term_row_number = 2;

    /** @type {string} Setup〜Closing外の列を示すダミー文字列 */
    this.dummy_str = "***dummy***";

    /** @type {string} Setup列の見出し名 */
    this.setupName = QUOTATION_SHEET_NAMES.SETUP;

    /** @type {string} Closing列の見出し名 */
    this.closingName = QUOTATION_SHEET_NAMES.CLOSING;

    /** @type {string[] | null} Setup〜Closing範囲の見出しキャッシュ */
    this._cachedHeader = null;
  }
  /**
   * 見出し行の文字列を取得する。
   *
   * Setup より左、Closing より右の列はダミー文字列に置き換える。
   * 一度取得した結果はキャッシュされる。
   *
   * @returns {string[] | undefined} 見出し配列（Setup〜Closing範囲外はダミー文字列）
   */
  getSetupClosingHeader() {
    // すでに取得済みならキャッシュを返す
    if (this._cachedHeader) return this._cachedHeader;

    const header_t = this.sheet
      .getRange(this.term_row_number, 1, 1, this.sheet.getLastColumn())
      .getValues()[0];

    const setup_idx = header_t.indexOf(this.setupName);
    const closing_idx = header_t.indexOf(this.closingName);

    if (setup_idx < 0 || closing_idx < 0) {
      return;
    }

    // Setup〜Closing 以外をダミーに置換してキャッシュ
    this._cachedHeader = header_t.map((x, idx) =>
      idx < setup_idx || closing_idx < idx ? this.dummy_str : x,
    );

    return this._cachedHeader;
  }
  /**
   * ヘッダキャッシュを無効化する。
   *
   * 列構造が変更された場合に呼び出す。
   *
   * @returns {void}
   */
  invalidateCache() {
    this._cachedHeader = null;
  }

  /**
   * 列の初期化処理を行う。
   *
   * 以下の処理を順番に実行する：
   * 1. 見出しが空白の列を削除
   * 2. 重複している列を削除
   *
   * @returns {void}
   */
  initCols() {
    this.removeColsWithoutHeader();
    this.removeCol();
  }

  /**
   * Setup〜Closing範囲で重複している見出し列を削除する。
   *
   * 同じ見出しが複数ある場合は
   * 最初の1列だけ残して残りを削除する。
   *
   * @returns {void}
   */
  removeCol() {
    // Setup、Closingの見出しがなければ処理しない
    const header_t = this.getSetupClosingHeader();
    if (!header_t) return;

    // ダミーを除いた対象ヘッダ（元のインデックス付きで保持）
    const targets = header_t
      .map((name, idx) => ({ name, idx }))
      .filter((x) => x.name !== this.dummy_str);

    // 見出しごとに列番号をまとめる
    const indexMap = {};
    targets.forEach(({ name, idx }) => {
      if (!indexMap[name]) indexMap[name] = [];
      indexMap[name].push(idx + 1); // 列番号は1始まり
    });

    // 削除対象の列番号を収集（各見出しの2列目以降）
    const deleteCols = [];
    Object.values(indexMap).forEach((cols) => {
      if (cols.length > 1) {
        // 先頭1列を残して、それ以外を削除対象に
        deleteCols.push(...cols.slice(1));
      }
    });

    // 削除対象がなければ終了
    if (deleteCols.length === 0) return;

    // 列番号を降順で削除（ずれ防止）
    deleteCols
      .sort((a, b) => b - a)
      .forEach((col) => {
        this.sheet.deleteColumn(col);
        this.invalidateCache(); // キャッシュ無効化
      });
  }
  /**
   * Setup〜Closing範囲で見出しが空白の列を削除する。
   *
   * 空白列がなくなるまで繰り返し削除する。
   *
   * @returns {void}
   */
  removeColsWithoutHeader() {
    while (true) {
      const header_t = this.getSetupClosingHeader();
      if (!header_t) return;

      const emptyIndex = header_t.indexOf("");
      if (emptyIndex < 0) return;

      this.sheet.deleteColumn(emptyIndex + 1);
      this.invalidateCache(); // 列構成が変わったのでキャッシュ破棄
    }
  }

  /**
   * 指定された見出しの列を必要数まで追加する。
   *
   * 既存の列数が不足している場合、
   * 最初の列をコピーして追加する。
   *
   * @param {[string, number]} param0
   * @param {string} param0[0] 対象の見出し名
   * @param {number} param0[1] 必要な列数
   *
   * @returns {void}
   */
  addCols([target_head, target_columns_count]) {
    // Setup、Closingの見出しがなければ処理しない
    let header_t = this.getSetupClosingHeader();
    if (!header_t) return;

    // 現在の列数を取得
    const currentCols = header_t
      .map((name, idx) => ({ name, idx }))
      .filter((x) => x.name === target_head);

    const currentCount = currentCols.length;

    // すでに必要数あれば何もしない
    if (currentCount >= target_columns_count) return;

    // 基準となるコピー元列（最初の1列）
    const baseColNumber = currentCols[0].idx + 1;

    // 追加が必要な本数
    const needToAdd = target_columns_count - currentCount;

    // まとめて追加
    for (let i = 0; i < needToAdd; i++) {
      this.sheet.insertColumnAfter(baseColNumber + i);
      this.invalidateCache(); // 列構成が変わったのでキャッシュ破棄

      this.sheet
        .getRange(1, baseColNumber, this.sheet.getLastRow(), 1)
        .copyTo(this.sheet.getRange(1, baseColNumber + i + 1));
    }
  }
}
