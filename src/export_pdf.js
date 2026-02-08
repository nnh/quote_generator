/**
 * PDFを作成する
 * @param {Array.<Object>} target_sheets PDF出力対象のシート
 * @param {Object} pdf_settings PDF設定情報
 * @return none
 */
function create_pdf_total_book_(target_sheets, pdf_settings) {
  // 出力対象シートが全て非表示ならば処理をスキップする
  if (target_sheets.every((x) => x.isSheetHidden())) {
    return;
  }
  // シートの表示非表示状態を取得
  // 非表示ならtrueになる
  const sheets_show_hide = SpreadsheetApp.getActiveSpreadsheet()
    .getSheets()
    .map((x) => {
      let temp = {};
      temp.sheet = x;
      temp.isHidden = x.isSheetHidden();
      temp.sheetName = x.getName();
      return temp;
    });
  // PDF出力対象外のシートを非表示にする
  const target_sheet_names = target_sheets.map((x) => x.getName());
  const non_target_sheets = sheets_show_hide
    .map((x) => (!target_sheet_names.includes(x.sheetName) ? x : null))
    .filter((x) => x);
  non_target_sheets.forEach((x) => x.sheet.hideSheet());
  // PDF出力
  convertSpreadsheetToPdf_(
    pdf_settings.sheet_name,
    pdf_settings.portrait,
    pdf_settings.scale,
    pdf_settings.pdf_name,
    pdf_settings.output_folder,
  );
  // 全てのシートの表示／非表示状態を元に戻す
  sheets_show_hide.forEach((x) => {
    if (x.isHidden) {
      x.sheet.hideSheet();
    } else {
      x.sheet.showSheet();
    }
  });
}
/**
 * ブック全体のPDFとTotal2, Total3を横方向で出力したPDFをマイドライブに出力する
 * @param none
 * @return none
 */
function ssToPdf() {
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  // フィルタ：0を非表示にする
  hideFilterVisibility();
  // Total2, Total3シートの合計0円の列を非表示に、0円以上の列を表示にする
  total2_3_show_hidden_cols();
  const output_folder = DriveApp.getRootFolder();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const const_page_fit = 4;
  const const_vertical = true;
  const const_horizontal = false;
  // Setup〜Closingシートを取得
  var target_sheets = get_target_term_sheets();
  // Quote, Total, Total2, Total3を追加
  target_sheets.push(ss.getSheetByName(QUOTATION_SHEET_NAMES.QUOTE));
  target_sheets.push(ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL));
  target_sheets.push(ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2));
  target_sheets.push(ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL3));
  var pdf_settings_all_sheets = {
    sheet_name: null,
    portrait: const_vertical,
    scale: const_page_fit,
    pdf_name: ss.getName(),
    output_folder: output_folder,
  };
  create_pdf_total_book_(target_sheets, pdf_settings_all_sheets);
  // nmc
  const target_sheet_nmc = [
    ss.getSheetByName(QUOTATION_REQUEST_SHEET_NAMES.QUOTE_NMC),
    ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_NMC),
    ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_NMC),
  ];
  pdf_settings_all_sheets.pdf_name = ss.getName() + "_" + ORG.NMC;
  create_pdf_total_book_(target_sheet_nmc, pdf_settings_all_sheets);
  // oscr
  const target_sheet_oscr = [
    ss.getSheetByName(QUOTATION_SHEET_NAMES.QUOTE_OSCR),
    ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL_OSCR),
    ss.getSheetByName(QUOTATION_SHEET_NAMES.TOTAL2_OSCR),
  ];
  pdf_settings_all_sheets.pdf_name = ss.getName() + "_" + ORG.OSCR;
  create_pdf_total_book_(target_sheet_oscr, pdf_settings_all_sheets);
  // Total2, Total3横を出力
  const target_sheets_name_horizontal = [
    QUOTATION_SHEET_NAMES.TOTAL2,
    QUOTATION_SHEET_NAMES.TOTAL3,
    QUOTATION_SHEET_NAMES.TOTAL2_NMC,
    QUOTATION_SHEET_NAMES.TOTAL2_OSCR,
  ];
  target_sheets_name_horizontal.map(function (x) {
    if (!ss.getSheetByName(x).isSheetHidden()) {
      convertSpreadsheetToPdf_(
        x,
        const_horizontal,
        const_page_fit,
        x,
        output_folder,
      );
    }
  });
}
/**
 * PDFを作成する
 * @param {string} sheet_name シート名
 * @param {boolean} portrait true:vertical false:Horizontal
 * @param {number} scale 1= 標準100%, 2= 幅に合わせる, 3= 高さに合わせる,  4= ページに合わせる
 * @param {string} pdf_name 出力するPDF名
 * @param {folder} output_folder_id GoogleDriveの出力フォルダ
 * @return none
 */
function convertSpreadsheetToPdf_(
  sheet_name,
  portrait,
  scale,
  pdf_name,
  output_folder,
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const url_base = ss.getUrl().replace(/edit.*$/, "");
  var str_id = "&id=" + ss.getId();
  if (sheet_name != null) {
    var sheet_id = ss.getSheetByName(sheet_name).getSheetId();
    str_id = "&gid=" + sheet_id;
  }
  const url_ext =
    "export?exportFormat=pdf&format=pdf" +
    str_id +
    "&size=letter" +
    "&portrait=" +
    portrait +
    "&fitw=true" +
    "&scale=" +
    scale +
    "&sheetnames=false&printtitle=false&pagenumbers=false" +
    "&gridlines=false" + // hide gridlines
    "&fzr=false"; // do not repeat row headers (frozen rows) on each page
  const options = {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken(),
    },
  };
  const response = UrlFetchApp.fetch(url_base + url_ext, options);
  const blob = response.getBlob().setName(pdf_name + ".pdf");
  output_folder.createFile(blob);
}
