function testTrial_comment_manager() {
  const trialSheetName = TRIAL_SHEET.NAME;
  if (!trialSheetName) {
    throw new Error("TRIAL_SHEET.NAME is not defined");
  }
  const trialSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(trialSheetName);
  if (!trialSheet) {
    throw new Error(`Sheet with name ${trialSheetName} not found`);
  }
  const trialSheetRangeComment = TRIAL_SHEET.RANGES.COMMENT;
  if (!trialSheetRangeComment) {
    throw new Error("TRIAL_SHEET.RANGES.COMMENT is not defined");
  }
  const commentRange = trialSheet.getRange(trialSheetRangeComment);
  const test1 = testHandleCrfWithCdisc_case1_(commentRange);
  const test2 = testHandleCrfWithCdisc_case2_(commentRange);
  const test3 = testHandleCrfWithCdisc_case3_(commentRange);
  const test4 = testHandleCrfWithCdisc_case4_(commentRange);
  const test5 = testHandleCrfWithCdisc_case5_(commentRange);
}
function getTestHandleCrfWithCdisc_QuotationRequestArray_(
  value = COMMON_EXISTENCE_LABELS.YES,
) {
  const array_quotation_request = createTestQuotationRequestArrayWithColumn_(
    null,
    "AL",
    "CDISC対応",
    value,
  );
  const quotation_request_sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      QUOTATION_REQUEST_SHEET.NAME,
    );
  if (!quotation_request_sheet) {
    throw new Error("quotation_requestシートが見つかりません");
  }
  quotation_request_sheet
    .getRange(2, 1, 1, array_quotation_request[0].length)
    .setValues([array_quotation_request[1]]);
  SpreadsheetApp.flush();
  _quotationRequestMap = null; // キャッシュクリア
  buildQuotationRequestMap_();
}
function testHandleCrfWithCdisc_common_(
  commentRange,
  value,
  beforeComments,
  expectedComments,
  testName,
) {
  commentRange.clearContent();
  const crfCount = 999;
  getTestHandleCrfWithCdisc_QuotationRequestArray_(value);
  commentRange
    .offset(0, 0, beforeComments.length, beforeComments[0].length)
    .setValues(beforeComments);
  SpreadsheetApp.flush();
  const enabled = isCdiscEnabled_();
  applyCdiscComment_(enabled);

  const actualCommentFormulas = commentRange.getFormulas();
  const actualCommentValues = commentRange.getValues();
  const actualComments = actualCommentFormulas
    .map((formulaRow, rowIndex) =>
      formulaRow.map((formula, colIndex) =>
        formula !== "" ? formula : actualCommentValues[rowIndex][colIndex],
      ),
    )
    .filter((row) => row.some((cell) => cell !== ""));
  const result = assertEquals_(actualComments, expectedComments, testName);
  if (!result) {
    throw new Error(`${testName} failed`);
  }
  return result;
}

function testHandleCrfWithCdisc_case1_(commentRange) {
  // CDISC対応あり、コメント削除して追加の場合
  const beforeComments = [
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [`="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`諸経費・間接経費は全て各項目の見積に含まれています。`],
  ];
  const expectedComments = [
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`諸経費・間接経費は全て各項目の見積に含まれています。`],
    [
      `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`,
    ],
  ];
  const testName = "CDISC対応あり、コメント削除して追加";
  return testHandleCrfWithCdisc_common_(
    commentRange,
    COMMON_EXISTENCE_LABELS.YES,
    beforeComments,
    expectedComments,
    testName,
  );
}
function testHandleCrfWithCdisc_case2_(commentRange) {
  // CDISC対応あり、コメントが存在しない場合
  const beforeComments = [
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`監査の金額を含みません。`],
  ];
  const expectedComments = [
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`監査の金額を含みません。`],
    [
      `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`,
    ],
  ];
  const testName = "CDISC対応あり、コメントが存在しない場合";
  return testHandleCrfWithCdisc_common_(
    commentRange,
    COMMON_EXISTENCE_LABELS.YES,
    beforeComments,
    expectedComments,
    testName,
  );
}
function testHandleCrfWithCdisc_case3_(commentRange) {
  // CDISC対応あり、コメントが存在する場合
  const beforeComments = [
    ["安全性情報管理システムの構築を含みません。"],
    [
      `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`,
    ],
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`監査の金額を含みません。`],
  ];
  const expectedComments = [
    ["安全性情報管理システムの構築を含みません。"],
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`監査の金額を含みません。`],
    [
      `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`,
    ],
  ];
  const testName = "CDISC対応あり、コメントが存在する場合";
  return testHandleCrfWithCdisc_common_(
    commentRange,
    COMMON_EXISTENCE_LABELS.YES,
    beforeComments,
    expectedComments,
    testName,
  );
}
function testHandleCrfWithCdisc_case4_(commentRange) {
  // のテスト
  // CDISC対応なし１
  const beforeComments = [
    ["安全性情報管理システムの構築を含みません。"],
    [
      `="CDISC SDTM変数へのプレマッピングを想定し、CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`,
    ],
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`監査の金額を含みません。`],
  ];
  const expectedComments = [...beforeComments];
  const testName = "CDISC対応なし１";
  return testHandleCrfWithCdisc_common_(
    commentRange,
    COMMON_EXISTENCE_LABELS.NO,
    beforeComments,
    expectedComments,
    testName,
  );
}
function testHandleCrfWithCdisc_case5_(commentRange) {
  // CDISC対応なし２
  const beforeComments = [
    [
      `="契約期間は"&text($D$40,"yyyy年m月d日")&"〜"&text($E$40,"yyyy年m月d日") & " ("&$C$40&"間）を想定しております。"`,
    ],
    [`="CRFのべ項目数を一症例あたり"&$B$30&"項目と想定しております。"`],
    [
      `="参加施設数を" & $B$29 & "施設と想定しております。" & if ($C$29 > 0, "EDCの初期アカウント設定は" & $C$29 & "施設を想定しております。", "")`,
    ],
    [`諸経費・間接経費は全て各項目の見積に含まれています。`],
  ];
  const expectedComments = [...beforeComments];
  const testName = "CDISC対応なし２";
  return testHandleCrfWithCdisc_common_(
    commentRange,
    COMMON_EXISTENCE_LABELS.NO,
    beforeComments,
    expectedComments,
    testName,
  );
}
