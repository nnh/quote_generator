function test_validation_quotation_total_check_item_builder() {
  if (
    COMMON_EXISTENCE_LABELS.YES !== "あり" ||
    COMMON_EXISTENCE_LABELS.NO !== "なし"
  ) {
    throw new Error(
      "COMMON_EXISTENCE_LABELS should have YES='あり' and NO='なし'",
    );
  }
  test_countStatisticalDocumentSets_bothNo_();
  test_countStatisticalDocumentSets_interimOnly_();
  test_countStatisticalDocumentSets_finalOnly_();
  test_countStatisticalDocumentSets_bothYes_();
  test_countStatisticalDocumentSets_unexpectedValue_();
  test_buildStatisticalItems_fullCombination_();
}
function test_countStatisticalDocumentSets_bothNo_() {
  const actual = countStatisticalDocumentSets_(
    COMMON_EXISTENCE_LABELS.NO,
    COMMON_EXISTENCE_LABELS.NO,
  );

  const expected = 0;

  assertEquals_(actual, expected, "both NO → 0");
}

function test_countStatisticalDocumentSets_interimOnly_() {
  const actual = countStatisticalDocumentSets_(
    COMMON_EXISTENCE_LABELS.YES,
    COMMON_EXISTENCE_LABELS.NO,
  );

  const expected = 1;

  assertEquals_(actual, expected, "interim YES only → 1");
}

function test_countStatisticalDocumentSets_finalOnly_() {
  const actual = countStatisticalDocumentSets_(
    COMMON_EXISTENCE_LABELS.NO,
    COMMON_EXISTENCE_LABELS.YES,
  );

  const expected = 1;

  assertEquals_(actual, expected, "final YES only → 1");
}

function test_countStatisticalDocumentSets_bothYes_() {
  const actual = countStatisticalDocumentSets_(
    COMMON_EXISTENCE_LABELS.YES,
    COMMON_EXISTENCE_LABELS.YES,
  );

  const expected = 2;

  assertEquals_(actual, expected, "both YES → 2");
}

function test_countStatisticalDocumentSets_unexpectedValue_() {
  const actual = countStatisticalDocumentSets_("unexpected", null);

  const expected = 0;

  assertEquals_(actual, expected, "unexpected values → 0");
}
function test_buildStatisticalItems_fullCombination_() {
  const trialTypes = getTrialTypeListForTest_();
  const yesNoList = [COMMON_EXISTENCE_LABELS.YES, COMMON_EXISTENCE_LABELS.NO];

  trialTypes.forEach((trialType) => {
    yesNoList.forEach((interim) => {
      yesNoList.forEach((finalReq) => {
        const tableCounts =
          finalReq === COMMON_EXISTENCE_LABELS.YES ? [49, 50, 51] : [0];

        tableCounts.forEach((tableCount) => {
          yesNoList.forEach((reportSupport) => {
            const actual = buildStatisticalItems_({
              trialType: trialType,
              interimAnalysisRequest: interim,
              finalAnalysisRequest: finalReq,
              finalAnalysisTableCount: tableCount,
              studyReportSupport: reportSupport,
            });

            const isInvestigator =
              trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

            const expectedDocCount =
              Number(interim === COMMON_EXISTENCE_LABELS.YES) +
              Number(finalReq === COMMON_EXISTENCE_LABELS.YES);

            const expectedInterimProgram =
              interim === COMMON_EXISTENCE_LABELS.YES
                ? "回数がQuotation Requestシートの中間解析に必要な図表数*Quotation Requestシートの中間解析の頻度であることを確認"
                : 0;

            const expectedFinalProgram =
              finalReq === COMMON_EXISTENCE_LABELS.YES
                ? isInvestigator && tableCount >= 1 && tableCount <= 49
                  ? 50
                  : tableCount
                : 0;

            const expectedLastItemName = isInvestigator
              ? "CSRの作成支援"
              : "研究結果報告書の作成";

            const expectedLastItemValue = isInvestigator
              ? 1
              : Number(reportSupport === COMMON_EXISTENCE_LABELS.YES);

            const expected = [
              {
                itemname:
                  "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
                value: expectedDocCount,
              },
              {
                itemname: isInvestigator
                  ? "中間解析プログラム作成、解析実施（ダブル）"
                  : "中間解析プログラム作成、解析実施（シングル）",
                value: expectedInterimProgram,
              },
              {
                itemname: "中間解析報告書作成（出力結果＋表紙）",
                value: interim === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
              },
              {
                itemname: isInvestigator
                  ? "最終解析プログラム作成、解析実施（ダブル）"
                  : "最終解析プログラム作成、解析実施（シングル）",
                value: expectedFinalProgram,
              },
              {
                itemname: "最終解析報告書作成（出力結果＋表紙）",
                value: finalReq === COMMON_EXISTENCE_LABELS.YES ? 1 : 0,
              },
              {
                itemname: expectedLastItemName,
                value: expectedLastItemValue,
              },
            ];

            assertEquals_(
              JSON.stringify(actual),
              JSON.stringify(expected),
              "trialType=" +
                trialType +
                ", interim=" +
                interim +
                ", final=" +
                finalReq +
                ", tableCount=" +
                tableCount +
                ", reportSupport=" +
                reportSupport,
            );
          });
        });
      });
    });
  });
}
