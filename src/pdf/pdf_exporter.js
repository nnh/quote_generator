/**
 * PDF export用URLを生成する（純関数）
 */
function buildPdfExportUrl_({
  baseUrl,
  spreadsheetId,
  sheetId = null,
  portrait = true,
  scale = 4,
}) {
  const idParam = sheetId ? `&gid=${sheetId}` : `&id=${spreadsheetId}`;

  return (
    baseUrl +
    "export?exportFormat=pdf&format=pdf" +
    idParam +
    "&size=letter" +
    `&portrait=${portrait}` +
    "&fitw=true" +
    `&scale=${scale}` +
    "&sheetnames=false&printtitle=false&pagenumbers=false" +
    "&gridlines=false&fzr=false"
  );
}

function exportSpreadsheetPdf_({
  sheetName = null,
  portrait = true,
  scale = 4,
  pdfName,
  outputFolder,
}) {
  const ss = getSpreadsheet_();

  const url = buildPdfExportUrl_({
    baseUrl: ss.getUrl().replace(/edit.*$/, ""),
    spreadsheetId: ss.getId(),
    sheetId: sheetName ? getSheetByNameCached_(sheetName).getSheetId() : null,
    portrait,
    scale,
  });

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: "Bearer " + ScriptApp.getOAuthToken() },
  });

  const blob = response.getBlob().setName(`${pdfName}.pdf`);
  outputFolder.createFile(blob);
}
