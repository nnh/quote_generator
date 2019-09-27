/**
* ブック全体のPDFとTotal2, Total3を横方向で出力したPDFを作成する
* @param none
* @return none
*/
function ssToPdf(){
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  const get_s_p = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ws_t = ss.getSheets();
  const excluded_sheets = ['trial', 'items', 'quotation_request'];
  const pdf_h = [get_s_p.getProperty('total2_sheet_name'), get_s_p.getProperty('total3_sheet_name')];
  var temp_target_sheets = get_sheets();
  var target_sheetsName = [];
  var show_sheets;
  temp_target_sheets.quote = ss.getSheetByName(get_s_p.getProperty('quote_sheet_name'));
  excluded_sheets.map(function(x){ delete temp_target_sheets[x] });
  Object.keys(temp_target_sheets).forEach(function(x){
    target_sheetsName.push(this[x].getName());
  }, temp_target_sheets);
  show_sheets = ws_t.map(function(x){
    if (!(x.isSheetHidden())){
      var temp = x;
    } 
    if (this.indexOf(x.getName()) == -1){
      x.hideSheet();
    }
    return temp;
  }, target_sheetsName);
  // remove null
  show_sheets = show_sheets.filter(Boolean);
  filterhidden();
  total2_3_show_hidden_cols();
  convertSpreadsheetToPdf(null, true, 4);
  if (show_sheets !== void　0){
    show_sheets.map(function(x){ x.showSheet(); });
  }
  pdf_h.map(function(x){
    if (!(ss.getSheetByName(x).isSheetHidden())){
      convertSpreadsheetToPdf(x, false, 4); 
    }
  });
}
/**
* PDFを作成する
* @param {string} sheet_name シート名
* @param {boolean} portrait true:vertical false:Horizontal
* @param {number} scale 1= 標準100%, 2= 幅に合わせる, 3= 高さに合わせる,  4= ページに合わせる
* @return none
*/
function convertSpreadsheetToPdf(sheet_name, portrait, scale){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const folder_id = PropertiesService.getScriptProperties().getProperty("folder_id");
  const output_folder = DriveApp.getFolderById(folder_id);
  const url_base = ss.getUrl().replace(/edit$/,'');
  var pdfName = ss.getName();
  var str_id = '&id=' +ss.getId();
  if (sheet_name != null){
    var sheet_id = ss.getSheetByName(sheet_name).getSheetId();
    str_id = '&gid=' + sheet_id;
    pdfName = sheet_name;
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
  const blob = response.getBlob().setName(pdfName + '.pdf');
  output_folder.createFile(blob);
}
