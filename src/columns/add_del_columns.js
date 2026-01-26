/**
 * Setup~Closingの間で見出しが空白の行は削除する。
 * @param {sheet} sheet Total2/Total3を指定
 * @param {number} term_row Total2/Total3シートの年度の上の行
 * @return {boolean}
 */
class Add_del_columns {
  constructor(sheet) {
    this.sheet = sheet;
    this.term_row = 2;
    this.dummy_str = "***dummy***";

    const props = PropertiesService.getScriptProperties();
    this.setupName = props.getProperty("setup_sheet_name");
    this.closingName = props.getProperty("closing_sheet_name");
    this._cachedHeader = null;
  }
  /**
   * 見出し行の文字列を取得する。Setupより左、Closingより右の情報はダミー文字列に置き換える。
   */
  get_setup_closing_range() {
    // すでに取得済みならキャッシュを返す
    if (this._cachedHeader) return this._cachedHeader;

    const header_t = this.sheet
      .getRange(this.term_row, 1, 1, this.sheet.getLastColumn())
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
   * ヘッダキャッシュを無効化する
   */
  invalidate_cache() {
    this._cachedHeader = null;
  }

  /**
   * 列の初期化を行う。
   */
  init_cols() {
    this.remove_cols_without_header();
    this.remove_col();
  }
  /**
   * Setup~Closingを一列ずつにする（重複列を削除）
   */
  remove_col() {
    // Setup、Closingの見出しがなければ処理しない
    const header_t = this.get_setup_closing_range();
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
        this.invalidate_cache(); // キャッシュ無効化
      });
  }
  /**
   * Setup~Closingの間で見出しが空白の列を削除する。
   */
  remove_cols_without_header() {
    while (true) {
      const header_t = this.get_setup_closing_range();
      if (!header_t) return;

      const emptyIndex = header_t.indexOf("");
      if (emptyIndex < 0) return;

      this.sheet.deleteColumn(emptyIndex + 1);
      this.invalidate_cache(); // 列構成が変わったのでキャッシュ破棄
    }
  }

  /**
   * 列の追加を行う。
   * @param {[string, number]} 追加対象列情報  [シート名, 必要列数]
   */
  add_cols([target_head, target_columns_count]) {
    // Setup、Closingの見出しがなければ処理しない
    let header_t = this.get_setup_closing_range();
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
      this.invalidate_cache(); // 列構成が変わったのでキャッシュ破棄

      this.sheet
        .getRange(1, baseColNumber, this.sheet.getLastRow(), 1)
        .copyTo(this.sheet.getRange(1, baseColNumber + i + 1));
    }
  }
}
