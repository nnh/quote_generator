/**
 * DM・事務局関連作業項目を構築する。
 *
 * EDCセットアップ、DB管理、データマネジメント業務、
 * 事務局業務等の項目を生成する。
 *
 * 【含まれる業務】
 * ・EDC関連
 * ・DB関連
 * ・ロジカルチェック
 * ・データ固定
 * ・症例検討会資料
 * ・安全性管理事務局
 * ・効果安全性評価委員会事務局
 *
 * @param {Object} params
 * @param {Object} params.quotationRequestValidationContext
 * @param {number} params.facilities_value
 * @param {number} params.trial_months
 * @param {number} params.closing_month
 * @param {number} params.interimCount
 * @param {number} params.closingCount
 * @return {Array<Object>}
 */
function validationBuildOfficeOperationItems_(params) {
  const {
    quotationRequestValidationContext,
    facilities_value,
    trial_months,
    closing_month,
    interimCount,
    closingCount,
  } = params;

  const items = [];

  items.push({ itemname: "問い合わせ対応", value: 0 });

  items.push({
    itemname: "EDCライセンス・データベースセットアップ",
    value: 1,
  });

  items.push({
    itemname: "データベース管理料",
    value: trial_months + closing_month,
  });

  items.push({
    itemname: "業務分析・DM計画書の作成・CTR登録案の作成",
    value: 1,
  });

  items.push({
    itemname: "紙CRFのEDC代理入力（含む問合せ）",
    value: 0,
  });

  items.push({
    itemname: "DB作成・eCRF作成・バリデーション",
    value: 1,
  });

  items.push({ itemname: "バリデーション報告書", value: 1 });

  const initialAccountSetupName =
    quotationRequestValidationContext.trialType ===
    TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
      ? "初期アカウント設定（施設・ユーザー）"
      : "初期アカウント設定（施設・ユーザー）、IRB承認確認";

  items.push({
    itemname: initialAccountSetupName,
    value: facilities_value,
  });

  items.push({ itemname: "入力の手引作成", value: 1 });

  items.push({
    itemname: "ロジカルチェック、マニュアルチェック、クエリ対応",
    value: trial_months,
  });

  items.push({
    itemname: "データベース固定作業、クロージング",
    value: 1,
  });

  items.push({
    itemname: "データクリーニング",
    value: interimCount + closingCount,
  });

  items.push({
    itemname: "症例検討会資料作成",
    value: validationGetValueIfMatch_(
      quotationRequestValidationContext.caseReviewMeeting,
      COMMON_EXISTENCE_LABELS.YES,
      1,
      0,
    ),
  });

  items.push({
    itemname: "安全性管理事務局業務",
    value: validationGetValueIfMatch_(
      quotationRequestValidationContext.safetyManagementOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  items.push({
    itemname: "効果安全性評価委員会事務局業務",
    value: validationGetValueIfMatch_(
      quotationRequestValidationContext.efficacyOfficeSetup,
      "設置・委託する",
      trial_months,
      0,
    ),
  });

  return items;
}
