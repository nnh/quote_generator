function testTrial_comment_manager() {
  const trialSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
  const commentRange = trialSheet.getRange(TRIAL_SHEET.RANGES.COMMENT);
  const test1 = testHandleCrfWithCdisc_case1_(commentRange);
  const test2 = testHandleCrfWithCdisc_case2_(commentRange);
  const test3 = testHandleCrfWithCdisc_case3_(commentRange);
  const test4 = testHandleCrfWithCdisc_case4_(commentRange);
  const test5 = testHandleCrfWithCdisc_case5_(commentRange);
}
function getTestHandleCrfWithCdisc_QuotationRequestArray_(
  value = COMMON_EXISTENCE_LABELS.YES,
) {
  return createTestQuotationRequestArrayWithColumn_(
    null,
    "AL",
    "CDISC対応",
    value,
  );
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
  const arrayQuotationRequest =
    getTestHandleCrfWithCdisc_QuotationRequestArray_(value);
  commentRange
    .offset(0, 0, beforeComments.length, beforeComments[0].length)
    .setValues(beforeComments);
  const dummy = handleCrfWithCdisc_(crfCount, arrayQuotationRequest);
  SpreadsheetApp.flush();
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
  // handleCrfWithCdisc_のテスト
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
  // handleCrfWithCdisc_のテスト
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
  // handleCrfWithCdisc_のテスト
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
  // handleCrfWithCdisc_のテスト
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
  // handleCrfWithCdisc_のテスト
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
