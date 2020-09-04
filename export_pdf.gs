/**
* PDFを作成する
* @param {[sheet]} target_sheets PDF出力対象のシート
* @param {Object} pdf_settings PDF設定情報
* @return none
*/
function create_pdf_total_book(target_sheets, pdf_settings){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // スプレッドシート内の全シートを取得
  const ws_t = ss.getSheets();
  // 出力対象シートが非表示なら出力対象外とする
  target_sheets = target_sheets.filter(function(x){
    return !(x.isSheetHidden());
  });
  // PDF出力対象外のシートを取得
  const target_sheets_name = target_sheets.map(function(x){
    return x.getName();
  });
  const non_target_sheets = ws_t.filter(function(x){
    return target_sheets_name.indexOf(x.getName()) == -1;
  });
  // PDF出力対象外シートの表示／非表示状態を取得
  const non_target_sheet_visible_hidden = non_target_sheets.map(function(x){
    return [x, x.isSheetHidden()];  // 非表示ならtrueになる
  });
  // PDF出力対象外のシートを非表示にする
  non_target_sheet_visible_hidden.map(function(x){
    x[0].hideSheet();
  });
  // PDF出力
  convertSpreadsheetToPdf(pdf_settings.sheet_name, pdf_settings.portrait, pdf_settings.scale, pdf_settings.pdf_name, pdf_settings.output_folder);
  // PDF出力対象外シートの表示／非表示状態を元に戻す
  non_target_sheet_visible_hidden.map(function(x){
    if (x[1]){
      // 非表示にする
      x[0].hideSheet();
    } else {
      // 表示する
      x[0].showSheet();
    }
  });  
}
/**
* ブック全体のPDFとTotal2, Total3を横方向で出力したPDFをマイドライブに出力する
* @param none
* @return none
*/
function ssToPdf(){
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  // フィルタ：0を非表示にする
  filterhidden();
  // Total2, Total3シートの合計0円の列を非表示に、0円以上の列を表示にする
  total2_3_show_hidden_cols();
  const output_folder = DriveApp.getRootFolder();
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const const_page_fit = 4;
  const const_vertical = true;
  const const_horizontal = false;
  // Setup〜Closingシートを取得
  var target_sheets = get_target_term_sheets();
  // Quote, Total, Total2, Total3を追加
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('quote_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total2_sheet_name')));
  target_sheets.push(ss.getSheetByName(get_s_p.getProperty('total3_sheet_name')));
  var pdf_settings_all_sheets ={
    sheet_name: null,
    portrait: const_vertical,
    scale: const_page_fit,
    pdf_name: ss.getName(),
    output_folder: output_folder};
  create_pdf_total_book(target_sheets, pdf_settings_all_sheets);
  // nmc
  const target_sheet_nmc = [ss.getSheetByName(get_s_p.getProperty('quote_nmc_sheet_name')),
                            ss.getSheetByName(get_s_p.getProperty('total_nmc_sheet_name')),
                            ss.getSheetByName(get_s_p.getProperty('total2_nmc_sheet_name'))];
  pdf_settings_all_sheets.pdf_name = ss.getName() + '_' + get_s_p.getProperty('name_nmc');
  create_pdf_total_book(target_sheet_nmc, pdf_settings_all_sheets);
  // oscr
  const target_sheet_oscr = [ss.getSheetByName(get_s_p.getProperty('quote_oscr_sheet_name')),
                            ss.getSheetByName(get_s_p.getProperty('total_oscr_sheet_name')),
                            ss.getSheetByName(get_s_p.getProperty('total2_oscr_sheet_name'))];
  pdf_settings_all_sheets.pdf_name = ss.getName() + '_' + get_s_p.getProperty('name_oscr');
  create_pdf_total_book(target_sheet_oscr, pdf_settings_all_sheets);
  // Total2, Total3横を出力
  const target_sheets_name_horizontal = [get_s_p.getProperty('total2_sheet_name'),
                                         get_s_p.getProperty('total3_sheet_name'),
                                         get_s_p.getProperty('total2_nmc_sheet_name'),
                                         get_s_p.getProperty('total2_oscr_sheet_name')];
  target_sheets_name_horizontal.map(function(x){
    if (!(ss.getSheetByName(x).isSheetHidden())){
      convertSpreadsheetToPdf(x, const_horizontal, const_page_fit, x, output_folder); 
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
function convertSpreadsheetToPdf(sheet_name, portrait, scale, pdf_name, output_folder){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const url_base = ss.getUrl().replace(/edit$/,'');
  var str_id = '&id=' +ss.getId();
  if (sheet_name != null){
    var sheet_id = ss.getSheetByName(sheet_name).getSheetId();
    str_id = '&gid=' + sheet_id;
  }
  const url_ext = 'export?exportFormat=pdf&format=pdf'
      + str_id
      + '&size=letter'
      + '&portrait=' + portrait 
      + '&fitw=true'
      + '&scale=' + scale
      + '&sheetnames=false&printtitle=false&pagenumbers=false'
      + '&gridlines=false'  // hide gridlines
      + '&fzr=false';       // do not repeat row headers (frozen rows) on each page
  const options = {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken(),
    }
  }
  const response = UrlFetchApp.fetch(url_base + url_ext, options);
  const blob = response.getBlob().setName(pdf_name + '.pdf');
  output_folder.createFile(blob);
}
