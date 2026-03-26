function test_buildPdfExportUrl_withSheet() {
  const url = buildPdfExportUrl_({
    baseUrl: "https://example.com/",
    spreadsheetId: "abc",
    sheetId: 123,
    portrait: false,
    scale: 2,
  });

  if (!url.includes("gid=123")) {
    throw new Error("gidが含まれていない");
  }

  if (!url.includes("portrait=false")) {
    throw new Error("portraitが反映されていない");
  }

  if (!url.includes("scale=2")) {
    throw new Error("scaleが反映されていない");
  }
}

function test_buildPdfExportUrl_withoutSheet() {
  const url = buildPdfExportUrl_({
    baseUrl: "https://example.com/",
    spreadsheetId: "abc",
    sheetId: null,
  });

  if (!url.includes("id=abc")) {
    throw new Error("spreadsheetIdが使われていない");
  }

  if (url.includes("gid=")) {
    throw new Error("gidが含まれてはいけない");
  }
}
