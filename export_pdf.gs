/**
 * PDF Export Configuration Constants
 */
class PdfExportConfig {
  constructor() {
    this.PAGE_FIT = 4;
    this.VERTICAL = true;
    this.HORIZONTAL = false;
    this.OUTPUT_FOLDER = DriveApp.getRootFolder();
    this.PDF_SIZE = 'letter';
    this.PDF_OPTIONS = {
      fitw: true,
      sheetnames: false,
      printtitle: false,
      pagenumbers: false,
      gridlines: false,
      fzr: false
    };
  }
}

/**
* PDFを作成する
* @param {Array.<Object>} target_sheets PDF出力対象のシート
* @param {Object} pdf_settings PDF設定情報
* @return none
*/
function create_pdf_total_book_(target_sheets, pdf_settings){
  try {
    if (!target_sheets || !Array.isArray(target_sheets) || target_sheets.length === 0) {
      console.error('Invalid target_sheets provided');
      return;
    }
    
    if (!pdf_settings) {
      console.error('PDF settings not provided');
      return;
    }
    
    // 出力対象シートが全て非表示ならば処理をスキップする
    if (target_sheets.every(x => x && x.isSheetHidden())){
      console.log('All target sheets are hidden, skipping PDF creation');
      return;
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error('Failed to get active spreadsheet');
      return;
    }
    
    // シートの表示非表示状態を取得
    // 非表示ならtrueになる
    const sheets_show_hide = ss.getSheets().map(x => {
      let temp = {};
      temp.sheet = x;
      temp.isHidden = x.isSheetHidden();
      temp.sheetName = x.getName();
      return temp;
    });
    
    // PDF出力対象外のシートを非表示にする
    const target_sheet_names = target_sheets.map(x => x.getName());
    const non_target_sheets = sheets_show_hide.map(x => !target_sheet_names.includes(x.sheetName)? x : null).filter(x => x);
    non_target_sheets.forEach(x => x.sheet.hideSheet());
    
    // PDF出力
    convertSpreadsheetToPdf_(pdf_settings.sheet_name, pdf_settings.portrait, pdf_settings.scale, pdf_settings.pdf_name, pdf_settings.output_folder);
    
    // 全てのシートの表示／非表示状態を元に戻す
    sheets_show_hide.forEach(x => {
      if (x.isHidden){
        x.sheet.hideSheet();
      } else {
        x.sheet.showSheet();
      }
    });
  } catch (error) {
    console.error('Error in create_pdf_total_book_:', error.toString());
  }
}
/**
 * Initialize PDF export process
 */
function initializePdfExport_() {
  try {
    initial_process();
    filterhidden();
    total2_3_show_hidden_cols();
  } catch (error) {
    console.error('Error in initializePdfExport_:', error.toString());
    throw error;
  }
}

/**
 * Get main sheets for PDF export
 */
function getMainSheets_(ss, cache) {
  try {
    const sheets = [];
    if (cache.quoteSheetName) {
      const sheet = ss.getSheetByName(cache.quoteSheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.totalSheetName) {
      const sheet = ss.getSheetByName(cache.totalSheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.total2SheetName) {
      const sheet = ss.getSheetByName(cache.total2SheetName);
      if (sheet) sheets.push(sheet);
    }
    if (cache.total3SheetName) {
      const sheet = ss.getSheetByName(cache.total3SheetName);
      if (sheet) sheets.push(sheet);
    }
    return sheets;
  } catch (error) {
    console.error('Error in getMainSheets_:', error.toString());
    return [];
  }
}

/**
 * Create NMC specific PDF
 */
function createNmcPdf_(ss, cache, pdfConfig, basePdfSettings) {
  try {
    if (!cache.nameNmc) {
      console.warn('NMC name not configured, skipping NMC PDF');
      return;
    }
    
    const target_sheet_nmc = [];
    if (cache.quoteNmcSheetName) {
      const sheet = ss.getSheetByName(cache.quoteNmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    if (cache.totalNmcSheetName) {
      const sheet = ss.getSheetByName(cache.totalNmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    if (cache.total2NmcSheetName) {
      const sheet = ss.getSheetByName(cache.total2NmcSheetName);
      if (sheet) target_sheet_nmc.push(sheet);
    }
    
    if (target_sheet_nmc.length === 0) {
      console.warn('No NMC sheets found');
      return;
    }
    
    const pdfSettings = { ...basePdfSettings };
    pdfSettings.pdf_name = ss.getName() + '_' + cache.nameNmc;
    create_pdf_total_book_(target_sheet_nmc, pdfSettings);
  } catch (error) {
    console.error('Error in createNmcPdf_:', error.toString());
  }
}

/**
 * Create OSCR specific PDF
 */
function createOscrPdf_(ss, cache, pdfConfig, basePdfSettings) {
  try {
    if (!cache.nameOscr) {
      console.warn('OSCR name not configured, skipping OSCR PDF');
      return;
    }
    
    const target_sheet_oscr = [];
    if (cache.quoteOscrSheetName) {
      const sheet = ss.getSheetByName(cache.quoteOscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    if (cache.totalOscrSheetName) {
      const sheet = ss.getSheetByName(cache.totalOscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    if (cache.total2OscrSheetName) {
      const sheet = ss.getSheetByName(cache.total2OscrSheetName);
      if (sheet) target_sheet_oscr.push(sheet);
    }
    
    if (target_sheet_oscr.length === 0) {
      console.warn('No OSCR sheets found');
      return;
    }
    
    const pdfSettings = { ...basePdfSettings };
    pdfSettings.pdf_name = ss.getName() + '_' + cache.nameOscr;
    create_pdf_total_book_(target_sheet_oscr, pdfSettings);
  } catch (error) {
    console.error('Error in createOscrPdf_:', error.toString());
  }
}

/**
 * Create horizontal orientation PDFs
 */
function createHorizontalPdfs_(ss, cache, pdfConfig) {
  try {
    const target_sheets_name_horizontal = [
      cache.total2SheetName,
      cache.total3SheetName,
      cache.total2NmcSheetName,
      cache.total2OscrSheetName
    ].filter(name => name !== null && name !== undefined);
    
    target_sheets_name_horizontal.forEach(sheetName => {
      try {
        const sheet = ss.getSheetByName(sheetName);
        if (sheet && !sheet.isSheetHidden()) {
          convertSpreadsheetToPdf_(sheetName, pdfConfig.HORIZONTAL, pdfConfig.PAGE_FIT, sheetName, pdfConfig.OUTPUT_FOLDER);
        }
      } catch (error) {
        console.error(`Error creating horizontal PDF for sheet "${sheetName}":`, error.toString());
      }
    });
  } catch (error) {
    console.error('Error in createHorizontalPdfs_:', error.toString());
  }
}

/**
* ブック全体のPDFとTotal2, Total3を横方向で出力したPDFをマイドライブに出力する
* @param none
* @return none
*/
function ssToPdf(){
  try {
    initializePdfExport_();
    
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error('Failed to initialize ConfigCache for PDF export');
      return;
    }
    
    const pdfConfig = new PdfExportConfig();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error('Failed to get active spreadsheet');
      return;
    }
    
    // Setup〜Closingシートを取得
    var target_sheets = get_target_term_sheets();
    if (!target_sheets || target_sheets.length === 0) {
      console.warn('No target term sheets found');
      target_sheets = [];
    }
    
    // Quote, Total, Total2, Total3を追加
    const mainSheets = getMainSheets_(ss, cache);
    target_sheets = target_sheets.concat(mainSheets);
    
    // メインPDF作成
    const basePdfSettings = {
      sheet_name: null,
      portrait: pdfConfig.VERTICAL,
      scale: pdfConfig.PAGE_FIT,
      pdf_name: ss.getName(),
      output_folder: pdfConfig.OUTPUT_FOLDER
    };
    
    if (target_sheets.length > 0) {
      create_pdf_total_book_(target_sheets, basePdfSettings);
    }
    
    // NMC PDF作成
    createNmcPdf_(ss, cache, pdfConfig, basePdfSettings);
    
    // OSCR PDF作成
    createOscrPdf_(ss, cache, pdfConfig, basePdfSettings);
    
    // 横向きPDF作成
    createHorizontalPdfs_(ss, cache, pdfConfig);
    
    console.log('PDF export process completed');
  } catch (error) {
    console.error('Error in ssToPdf:', error.toString());
  }
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
function convertSpreadsheetToPdf_(sheet_name, portrait, scale, pdf_name, output_folder){
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error('Failed to get active spreadsheet');
      return;
    }
    
    const url_base = ss.getUrl().replace(/edit.*$/,'');
    var str_id = '&id=' + ss.getId();
    
    if (sheet_name != null){
      const sheet = ss.getSheetByName(sheet_name);
      if (!sheet) {
        console.error(`Sheet "${sheet_name}" not found`);
        return;
      }
      var sheet_id = sheet.getSheetId();
      str_id = '&gid=' + sheet_id;
    }
    
    const config = new PdfExportConfig();
    const url_ext = 'export?exportFormat=pdf&format=pdf'
        + str_id
        + '&size=' + config.PDF_SIZE
        + '&portrait=' + portrait 
        + '&fitw=' + config.PDF_OPTIONS.fitw
        + '&scale=' + scale
        + '&sheetnames=' + config.PDF_OPTIONS.sheetnames
        + '&printtitle=' + config.PDF_OPTIONS.printtitle
        + '&pagenumbers=' + config.PDF_OPTIONS.pagenumbers
        + '&gridlines=' + config.PDF_OPTIONS.gridlines
        + '&fzr=' + config.PDF_OPTIONS.fzr;
    
    const options = {
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken(),
      }
    }
    
    const response = UrlFetchApp.fetch(url_base + url_ext, options);
    if (response.getResponseCode() !== 200) {
      console.error(`PDF generation failed with status: ${response.getResponseCode()}`);
      return;
    }
    
    const blob = response.getBlob().setName(pdf_name + '.pdf');
    if (!output_folder) {
      console.error('Output folder is not defined');
      return;
    }
    
    output_folder.createFile(blob);
    console.log(`PDF "${pdf_name}.pdf" created successfully`);
  } catch (error) {
    console.error('Error in convertSpreadsheetToPdf_:', error.toString());
  }
}
