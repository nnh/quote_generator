/**
 * PDF Core Operations Module (pdf-core-operations.gs)
 *
 * This module provides the fundamental PDF generation operations including
 * sheet visibility management and low-level PDF creation via Google's export API.
 *
 * Functions:
 * - create_pdf_total_book_: Manages sheet visibility and orchestrates PDF creation
 * - convertSpreadsheetToPdf_: Low-level PDF generation using Google Sheets export API
 *
 * Dependencies:
 * - PdfExportConfig (from pdf-config.gs)
 * - Google Apps Script APIs: SpreadsheetApp, UrlFetchApp, ScriptApp
 */

/**
 * PDFを作成する
 * @param {Array.<Object>} target_sheets PDF出力対象のシート
 * @param {Object} pdf_settings PDF設定情報
 * @return none
 */
function create_pdf_total_book_(target_sheets, pdf_settings) {
  try {
    if (
      !target_sheets ||
      !Array.isArray(target_sheets) ||
      target_sheets.length === 0
    ) {
      console.error("Invalid target_sheets provided");
      return;
    }

    if (!pdf_settings) {
      console.error("PDF settings not provided");
      return;
    }

    // 出力対象シートが全て非表示ならば処理をスキップする
    if (target_sheets.every((x) => x && x.isSheetHidden())) {
      console.log("All target sheets are hidden, skipping PDF creation");
      return;
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error("Failed to get active spreadsheet");
      return;
    }

    // シートの表示非表示状態を取得
    // 非表示ならtrueになる
    const sheets_show_hide = ss.getSheets().map((x) => {
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
      pdf_settings.output_folder
    );

    // 全てのシートの表示／非表示状態を元に戻す
    sheets_show_hide.forEach((x) => {
      if (x.isHidden) {
        x.sheet.hideSheet();
      } else {
        x.sheet.showSheet();
      }
    });
  } catch (error) {
    console.error("Error in create_pdf_total_book_:", error.toString());
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
function convertSpreadsheetToPdf_(
  sheet_name,
  portrait,
  scale,
  pdf_name,
  output_folder
) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error("Failed to get active spreadsheet");
      return;
    }

    const url_base = ss.getUrl().replace(/edit.*$/, "");
    let str_id = "&id=" + ss.getId();

    if (sheet_name != null) {
      const sheet = ss.getSheetByName(sheet_name);
      if (!sheet) {
        console.error(`Sheet "${sheet_name}" not found`);
        return;
      }
      const sheet_id = sheet.getSheetId();
      str_id = "&gid=" + sheet_id;
    }

    const config = new PdfExportConfig();
    const url_ext =
      "export?exportFormat=pdf&format=pdf" +
      str_id +
      "&size=" +
      config.PDF_SIZE +
      "&portrait=" +
      portrait +
      "&fitw=" +
      config.PDF_OPTIONS.fitw +
      "&scale=" +
      scale +
      "&sheetnames=" +
      config.PDF_OPTIONS.sheetnames +
      "&printtitle=" +
      config.PDF_OPTIONS.printtitle +
      "&pagenumbers=" +
      config.PDF_OPTIONS.pagenumbers +
      "&gridlines=" +
      config.PDF_OPTIONS.gridlines +
      "&fzr=" +
      config.PDF_OPTIONS.fzr;

    const options = {
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken(),
      },
    };

    const response = UrlFetchApp.fetch(url_base + url_ext, options);
    if (response.getResponseCode() !== 200) {
      console.error(
        `PDF generation failed with status: ${response.getResponseCode()}`
      );
      return;
    }

    const blob = response.getBlob().setName(pdf_name + ".pdf");
    if (!output_folder) {
      console.error("Output folder is not defined");
      return;
    }

    output_folder.createFile(blob);
    console.log(`PDF "${pdf_name}.pdf" created successfully`);
  } catch (error) {
    console.error("Error in convertSpreadsheetToPdf_:", error.toString());
  }
}
