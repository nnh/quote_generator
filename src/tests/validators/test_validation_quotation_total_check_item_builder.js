function test_validation_quotation_total_check_item_builder() {
  if (
    COMMON_EXISTENCE_LABELS.YES !== "あり" ||
    COMMON_EXISTENCE_LABELS.NO !== "なし"
  ) {
    throw new Error(
      "COMMON_EXISTENCE_LABELS should have YES='あり' and NO='なし'",
    );
  }
  test_buildProtocolItems_fullCombination_();
  test_buildOfficeOperationItems_fullCombination_();
  test_countStatisticalDocumentSets_bothNo_();
  test_countStatisticalDocumentSets_interimOnly_();
  test_countStatisticalDocumentSets_finalOnly_();
  test_countStatisticalDocumentSets_bothYes_();
  test_countStatisticalDocumentSets_unexpectedValue_();
  test_buildStatisticalItems_fullCombination_();
  test_buildCostItems_fullCombination_();
  test_buildMonitoringItems_fullCombination_();
}
/**
 * buildProtocolItems_ の全組み合わせテスト
 *
 * 【網羅している条件】
 *
 * ■ trialType
 *   - getTrialTypeListForTest_() が返す全試験種別
 *     - 医師主導治験
 *     - 特定臨床研究
 *     - 観察研究・レジストリ
 *     - 介入研究（特定臨床研究以外）
 *     - 先進
 *
 * ■ YES/NO分岐（全組み合わせ）
 *   - pmdaConsultingSupport
 *   - amedApplicationSupport
 *   - kickoffMeeting
 *   - caseReviewMeeting
 *
 * ■ trialType依存ロジックの検証
 *
 *   ▼ 医師主導治験の場合
 *     - 薬剤対応 = facilities_value
 *     - 監査対応 = 1
 *     - SOP一式、CTR登録案、TMF管理 = 1
 *     - IRB項目名 = "IRB承認確認、施設管理"
 *     - IRB value = facilities_value
 *
 *   ▼ 医師主導治験以外の場合
 *     - 上記項目は 0
 *     - IRB項目名 = "IRB準備・承認確認"
 *
 *   ▼ 特定臨床研究の場合
 *     - 特定臨床研究法申請資料作成支援 = facilities_value
 *
 *   ▼ それ以外の試験種別
 *     - 特定臨床研究法申請資料作成支援 = 0
 *
 * ■ 固定値検証
 *   - プロトコルレビュー・作成支援 = 1
 *   - 検討会実施（TV会議等） = 4
 *   - プロジェクト管理 = total_months
 *   - PMDA対応、照会事項対応 = 0
 *   - 契約・支払手続、実施計画提出支援 = 0
 *
 * 【保証していること】
 *   - 全分岐のロジックが期待通りの数値を返すこと
 *   - trialTypeによる項目名の動的切り替えが正しいこと
 *   - YES/NO入力が正しく 1/0 に変換されること
 *   - 配列の順序が変更されていないこと
 */
function test_buildProtocolItems_fullCombination_() {
  const trialTypes = getTrialTypeListForTest_();
  const yesNoList = [COMMON_EXISTENCE_LABELS.YES, COMMON_EXISTENCE_LABELS.NO];

  const facilitiesValue = 3;
  const totalMonths = 12;

  trialTypes.forEach((trialType) => {
    yesNoList.forEach((pmda) => {
      yesNoList.forEach((amed) => {
        yesNoList.forEach((kickoff) => {
          yesNoList.forEach((caseReview) => {
            const actual = buildProtocolItems_({
              quotationRequestValidationContext: {
                trialType: trialType,
                pmdaConsultingSupport: pmda,
                amedApplicationSupport: amed,
                kickoffMeeting: kickoff,
                caseReviewMeeting: caseReview,
              },
              facilities_value: facilitiesValue,
              total_months: totalMonths,
            });

            const isInvestigator =
              trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

            const isSpecifiedClinical =
              trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL;

            const expectedIrpName = isInvestigator
              ? "IRB承認確認、施設管理"
              : "IRB準備・承認確認";

            const expectedIrpValue = isInvestigator ? facilitiesValue : 0;

            const expected = [
              { itemname: "プロトコルレビュー・作成支援", value: 1 },
              { itemname: "検討会実施（TV会議等）", value: 4 },
              {
                itemname: "PMDA相談資料作成支援",
                value: Number(pmda === COMMON_EXISTENCE_LABELS.YES),
              },
              {
                itemname: "AMED申請資料作成支援",
                value: Number(amed === COMMON_EXISTENCE_LABELS.YES),
              },
              { itemname: "プロジェクト管理", value: totalMonths },
              {
                itemname: "キックオフミーティング準備・実行",
                value: Number(kickoff === COMMON_EXISTENCE_LABELS.YES),
              },
              {
                itemname: "症例検討会準備・実行",
                value: Number(caseReview === COMMON_EXISTENCE_LABELS.YES),
              },
              {
                itemname: "薬剤対応",
                value: isInvestigator ? facilitiesValue : 0,
              },
              { itemname: "PMDA対応、照会事項対応", value: 0 },
              {
                itemname: "監査対応",
                value: isInvestigator ? 1 : 0,
              },
              {
                itemname: "SOP一式、CTR登録案、TMF管理",
                value: isInvestigator ? 1 : 0,
              },
              {
                itemname: expectedIrpName,
                value: expectedIrpValue,
              },
              {
                itemname: "特定臨床研究法申請資料作成支援",
                value: isSpecifiedClinical ? facilitiesValue : 0,
              },
              {
                itemname: "契約・支払手続、実施計画提出支援",
                value: 0,
              },
            ];

            assertEquals_(
              JSON.stringify(actual),
              JSON.stringify(expected),
              "trialType=" +
                trialType +
                ", pmda=" +
                pmda +
                ", amed=" +
                amed +
                ", kickoff=" +
                kickoff +
                ", caseReview=" +
                caseReview,
            );
          });
        });
      });
    });
  });
}
/**
 * 統計解析
 */
function test_countStatisticalDocumentSets_bothNo_() {
  const actual = countStatisticalDocumentSets_(
    COMMON_EXISTENCE_LABELS.NO,
    COMMON_EXISTENCE_LABELS.NO,
  );

  const expected = 0;

  assertEquals_(actual, expected, "both NO → 0");
}

/**
 * buildOfficeOperationItems_ の全組み合わせテスト
 *
 * 【網羅条件】
 * ■ trialType 全種別
 * ■ caseReviewMeeting YES/NO
 * ■ safetyManagementOfficeSetup 設置・委託する / それ以外
 * ■ efficacyOfficeSetup 設置・委託する / それ以外
 *
 * 【検証内容】
 * ・trialType による初期アカウント設定名称分岐
 * ・YES/NO による 1/0 切替
 * ・trial_months を使用する項目の正当性
 * ・trial_months + closing_month 計算
 * ・配列順序保証
 */
function test_buildOfficeOperationItems_fullCombination_() {
  const trialTypes = getTrialTypeListForTest_();
  const yesNoList = [COMMON_EXISTENCE_LABELS.YES, COMMON_EXISTENCE_LABELS.NO];
  const officeSetupList = ["設置・委託する", "設置しない"];

  const facilitiesValue = 5;
  const trialMonths = 10;
  const closingMonth = 2;
  const interimCount = 3;
  const closingCount = 4;

  trialTypes.forEach((trialType) => {
    yesNoList.forEach((caseReview) => {
      officeSetupList.forEach((safetySetup) => {
        officeSetupList.forEach((efficacySetup) => {
          const param = {
            quotationRequestValidationContext: {
              trialType: trialType,
              caseReviewMeeting: caseReview,
              safetyManagementOfficeSetup: safetySetup,
              efficacyOfficeSetup: efficacySetup,
            },
            facilities_value: facilitiesValue,
            trial_months: trialMonths,
            closing_month: closingMonth,
            interimCount: interimCount,
            closingCount: closingCount,
          };
          const actual = buildOfficeOperationItems_(param);

          const isInvestigator =
            trialType === TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED;

          const expectedInitialAccountName = isInvestigator
            ? "初期アカウント設定（施設・ユーザー）"
            : "初期アカウント設定（施設・ユーザー）、IRB承認確認";

          const expected = [
            { itemname: "問い合わせ対応", value: 0 },
            { itemname: "EDCライセンス・データベースセットアップ", value: 1 },
            {
              itemname: "データベース管理料",
              value: trialMonths + closingMonth,
            },
            {
              itemname: "業務分析・DM計画書の作成・CTR登録案の作成",
              value: 1,
            },
            { itemname: "紙CRFのEDC代理入力（含む問合せ）", value: 0 },
            { itemname: "DB作成・eCRF作成・バリデーション", value: 1 },
            { itemname: "バリデーション報告書", value: 1 },
            {
              itemname: expectedInitialAccountName,
              value: facilitiesValue,
            },
            { itemname: "入力の手引作成", value: 1 },
            {
              itemname: "ロジカルチェック、マニュアルチェック、クエリ対応",
              value: trialMonths,
            },
            { itemname: "データベース固定作業、クロージング", value: 1 },
            {
              itemname: "データクリーニング",
              value: interimCount + closingCount,
            },
            {
              itemname: "症例検討会資料作成",
              value: Number(caseReview === COMMON_EXISTENCE_LABELS.YES),
            },
            {
              itemname: "安全性管理事務局業務",
              value: safetySetup === "設置・委託する" ? trialMonths : 0,
            },
            {
              itemname: "効果安全性評価委員会事務局業務",
              value: efficacySetup === "設置・委託する" ? trialMonths : 0,
            },
          ];

          assertEquals_(
            JSON.stringify(actual),
            JSON.stringify(expected),
            "trialType=" +
              trialType +
              ", caseReview=" +
              caseReview +
              ", safetySetup=" +
              safetySetup +
              ", efficacySetup=" +
              efficacySetup,
          );
        });
      });
    });
  });
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
            const params = {
              quotationRequestValidationContext: {
                trialType: trialType,
                interimAnalysisRequest: interim,
                finalAnalysisRequest: finalReq,
                studyReportSupport: reportSupport,
                finalAnalysisTableCount: tableCount,
              },
            };
            const actual = buildStatisticalItems_(params);

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
/**
 * buildCostItems_ の網羅テスト
 *
 * 【網羅条件】
 * ・CRB申請：あり / なし
 * ・trial_year：1 / 2 / 3
 * ・auditTargetSiteCount：0 / 1 / 3
 * ・insuranceFee：0 / 100
 */
function test_buildCostItems_fullCombination_() {
  const trialTypes = getTrialTypeListForTest_();
  const crbList = [COMMON_EXISTENCE_LABELS.YES, COMMON_EXISTENCE_LABELS.NO];
  const trialYears = [1, 2, 3];
  const auditCounts = [0, 1, 3];
  const insuranceFees = [0, 100];
  trialTypes.forEach((trialType) => {
    crbList.forEach((crb) => {
      trialYears.forEach((trialYear) => {
        auditCounts.forEach((auditCount) => {
          insuranceFees.forEach((insuranceFee) => {
            const context = {
              crbApplication: crb,
              auditTargetSiteCount: auditCount,
              insuranceFee: insuranceFee,
              trialType: trialType,
            };

            const actual = buildCostItems_({
              quotationRequestValidationContext: context,
              trial_year: trialYear,
            });

            /** ===== expected ===== */

            const isCrbYes = crb === COMMON_EXISTENCE_LABELS.YES;

            const expectedCrbFirst =
              trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL
                ? isCrbYes
                  ? 1
                  : 0
                : 0;
            const expectedCrbAfter =
              trialType === TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL
                ? isCrbYes && trialYear > 1
                  ? trialYear - 1
                  : 0
                : 0;

            const expectedExternalAudit = auditCount > 0 ? 2 : 0;
            const expectedSiteAudit = auditCount > 0 ? auditCount : 0;

            const expectedInsuranceCount = insuranceFee > 0 ? 1 : 0;
            const expectedInsuranceAmount = insuranceFee > 0 ? insuranceFee : 0;

            const expected = {
              totalCheckItems: [
                {
                  itemname: "名古屋医療センターCRB申請費用(初年度)",
                  value: expectedCrbFirst,
                },
                {
                  itemname: "名古屋医療センターCRB申請費用(2年目以降)",
                  value: expectedCrbAfter,
                },
                {
                  itemname: "外部監査費用",
                  value: expectedExternalAudit,
                },
                {
                  itemname: "施設監査費用",
                  value: expectedSiteAudit,
                },
                {
                  itemname: "保険料",
                  value: expectedInsuranceCount,
                },
              ],
              totalAmountCheckItems: [
                {
                  itemname: "保険料",
                  value: expectedInsuranceAmount,
                },
              ],
            };

            assertEquals_(
              JSON.stringify(actual),
              JSON.stringify(expected),
              `trialType=${trialType}, expectedCrbFirst=${expectedCrbFirst}, expectedCrbAfter=${expectedCrbAfter}, crb=${crb}, trialYear=${trialYear}, auditCount=${auditCount}, insuranceFee=${insuranceFee}`,
            );
          });
        });
      });
    });
  });
}
/**
 * buildMonitoringItems_ の網羅テスト
 *
 * 【網羅条件】
 * ・monitoringVisitsPerCase：0 / 2
 * ・annualRequiredDocMonitoringPerSite：0 / 3
 */
function test_buildMonitoringItems_fullCombination_() {
  const monitoringVisitsList = [0, 2];
  const requiredDocMonitoringList = [0, 3];

  const facilities_value = 5;
  const number_of_cases_value = 10;
  const trial_ceil_year = 2;

  monitoringVisitsList.forEach((monitoringVisitsPerCase) => {
    requiredDocMonitoringList.forEach((annualRequiredDocMonitoringPerSite) => {
      const context = {
        monitoringVisitsPerCase: monitoringVisitsPerCase,
        annualRequiredDocMonitoringPerSite: annualRequiredDocMonitoringPerSite,
      };

      const actual = buildMonitoringItems_({
        facilities_value,
        number_of_cases_value,
        trial_ceil_year,
        quotationRequestValidationContext: context,
      });

      /** ===== expected ===== */

      const expectedMonitoringPreparation = monitoringVisitsPerCase > 0 ? 1 : 0;

      const expectedPreStudyMonitoring =
        annualRequiredDocMonitoringPerSite > 0
          ? annualRequiredDocMonitoringPerSite *
            facilities_value *
            trial_ceil_year
          : 0;

      const expectedCaseMonitoring =
        monitoringVisitsPerCase > 0
          ? monitoringVisitsPerCase * number_of_cases_value
          : 0;

      const expected = [
        {
          itemname: "モニタリング準備業務（関連資料作成）",
          value: expectedMonitoringPreparation,
        },
        {
          itemname: "開始前モニタリング・必須文書確認",
          value: expectedPreStudyMonitoring,
        },
        {
          itemname: "症例モニタリング・SAE対応",
          value: expectedCaseMonitoring,
        },
      ];

      assertEquals_(
        JSON.stringify(actual),
        JSON.stringify(expected),
        `monitoringVisitsPerCase=${monitoringVisitsPerCase}, annualRequiredDocMonitoringPerSite=${annualRequiredDocMonitoringPerSite}`,
      );
    });
  });
}
