/**
 * Momentライブラリの追加が必要
 * ライブラリキー：MHMchiX6c1bwSqGM1PZiW_PxhMjh3Sh48
 */

/**
 * quotation_requestシートの内容からtrialシート, itemsシートを設定する
 * @param {associative array} sheet 当スプレッドシート内のシートオブジェクト
 * @param {Array.<string>} array_quotation_request quotation_requestシートの1〜2行目の値
 * @return none
 * @example
 *   set_trial_sheet_(sheet, array_quotation_request);
 */
function set_trial_sheet_(sheet, array_quotation_request) {
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error("Failed to initialize ConfigCache in set_trial_sheet_");
    return;
  }
  // trialシートの設定
  quote_script_set_trial_by_trial_list_(sheet, cache, array_quotation_request);
  // trialシートに発行年月日を設定する
  set_issue_date_(sheet);
  // itemsシートの設定
  quote_script_set_items_by_items_list_(sheet, cache, array_quotation_request);
}
/**
 * 見積項目設定
 */
function quote_script_main() {
  // 初回のみsetProtectionEditusersを実行
  initial_process();
  const sheet = get_sheets();
  const quotation_request_last_col = sheet.quotation_request
    .getDataRange()
    .getLastColumn();
  const array_quotation_request = sheet.quotation_request
    .getRange(1, 1, 2, quotation_request_last_col)
    .getValues();
  // Quotation requestシートのA2セルが空白の場合、Quotation requestが入っていないものと判断して処理を終了する
  if (array_quotation_request[1][0] == "") {
    Browser.msgBox(
      "Quotation requestシートの2行目に情報を貼り付けて再実行してください。"
    );
    return;
  }
  const sheetnameIdx = 0;
  const countIdx = 2;
  filtervisible();
  set_trial_sheet_(sheet, array_quotation_request);
  const targetSheetList = getTrialTermInfo_()
    .map((x, idx) => x.concat(idx))
    .filter((x) => x[countIdx] != "");
  targetSheetList.forEach((x) => {
    const set_sheet_item_values = new SetSheetItemValues(
      x[sheetnameIdx],
      array_quotation_request
    );
    const temp = null;
    const temp_setup = set_sheet_item_values.set_setup_items_(temp);
    const temp_reg =
      set_sheet_item_values.set_registration_term_items_(temp_setup);
    const temp_reg_2 = set_sheet_item_values.set_registration_items_(temp_reg);
    const temp_close = set_sheet_item_values.set_closing_items_(temp_reg_2);
    const temp_exclude_setup =
      set_sheet_item_values.set_all_sheet_exclude_setup_(temp_close);
    const temp_all =
      set_sheet_item_values.set_all_sheet_common_items_(temp_exclude_setup);
    set_sheet_item_values.setSheetValues(x[sheetnameIdx], temp_all);
  });
  setImbalanceValues_(array_quotation_request);
  const setupToClosing = get_target_term_sheets();
  setupToClosing.forEach((x) =>
    x.getRange("B2").getValue() == "" ? x.hideSheet() : x.showSheet()
  );
}
function setImbalanceValues_(array_quotation_request) {
  // 年毎に設定する値が不均等である項目への対応
  const cache = new ConfigCache();
  if (!cache.isValid) {
    console.error("Failed to initialize ConfigCache in setImbalanceValues_");
    return;
  }
  const filenameIdx = 0;
  const exclusionIdx = 1;
  const itemnameIdx = 2;
  const multiplierIdx = 3;
  const sheetIdx = 0;
  const valueIdx = 1;
  const setupAndClosingExclusion = ["Setup", "Closing"];
  const patientRegistrationFee = "症例登録毎の支払";
  const targetImbalance = [
    ["監査対象施設数", setupAndClosingExclusion, "施設監査費用", null],
    [
      patientRegistrationFee,
      setupAndClosingExclusion,
      "症例登録",
      cache.numberOfCasesItemname,
    ],
  ];
  const DividedItemsCount = new GetArrayDividedItemsCountAdd();
  const target = targetImbalance.map((x) => {
    let tempCount = get_quotation_request_value(
      array_quotation_request,
      x[filenameIdx]
    );
    // 症例登録毎の支払は「あり、なし」で入力される
    tempCount =
      x[filenameIdx] == patientRegistrationFee && tempCount == "あり"
        ? 1
        : tempCount;
    const tempMultiplier = x[multiplierIdx]
      ? get_quotation_request_value(array_quotation_request, x[multiplierIdx])
      : 1;
    const targetNumber =
      Number.isInteger(tempCount) && Number.isInteger(tempMultiplier)
        ? tempCount * tempMultiplier
        : null;
    return Number.isInteger(targetNumber)
      ? DividedItemsCount.getArrayDividedItemsCount(
          targetNumber,
          x[exclusionIdx]
        )
      : null;
  });
  target.forEach((targetSheetAndValues, idx) => {
    if (targetSheetAndValues) {
      targetSheetAndValues.forEach((targetSheetAndValue) => {
        const targetSheet =
          SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
            targetSheetAndValue[sheetIdx]
          );
        const cache = new ConfigCache();
        if (!cache.isValid) {
          console.error(
            "Failed to initialize ConfigCache in targetSheetAndValues forEach"
          );
          return;
        }
        const sheetItems = get_fy_items(targetSheet, cache.fySheetItemsCol);
        const targetRow = sheetItems[targetImbalance[idx][itemnameIdx]];
        targetSheet
          .getRange(targetRow, parseInt(cache.fySheetCountCol))
          .setValue(targetSheetAndValue[valueIdx]);
      });
    }
  });
}
class SetSheetItemValues {
  constructor(sheetname, array_quotation_request) {
    this.sheetname = sheetname;
    this.array_quotation_request = array_quotation_request;

    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error(
        "Failed to initialize ConfigCache in SetSheetItemValues constructor"
      );
      return;
    }

    const months_col = QuoteScriptConstants.MONTHS_COL;
    const sheetname_col = QuoteScriptConstants.SHEETNAME_COL;
    const trial_sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Trial");
    const const_trial_setup_row = parseInt(cache.trialSetupRow);
    const const_trial_closing_row = parseInt(cache.trialClosingRow);
    const trial_term_values = trial_sheet
      .getRange(
        const_trial_setup_row,
        1,
        const_trial_closing_row - const_trial_setup_row + 1,
        trial_sheet.getDataRange().getLastColumn()
      )
      .getValues()
      .filter((x) => x[sheetname_col] == this.sheetname)[0];
    this.trial_target_terms = trial_term_values[months_col];
    this.trial_target_start_date = Moment.moment(
      trial_term_values[parseInt(cache.trialStartCol) - 1]
    );
    this.trial_target_end_date = Moment.moment(
      trial_term_values[parseInt(cache.trialEndCol) - 1]
    );
    this.trial_start_date = Moment.moment(
      cache.scriptProperties.getProperty("trial_start_date")
    );
    this.trial_end_date = Moment.moment(
      cache.scriptProperties.getProperty("trial_end_date")
    );
    const const_count_col = cache.fySheetCountCol;
    this.target_col = getColumnString(const_count_col);
    // 企業原資または調整事務局の有無が「あり」または医師主導治験ならば事務局運営を積む
    this.clinical_trials_office_flg =
      cache.trialTypeValue === cache.investigatorInitiatedTrial ||
      get_quotation_request_value(
        this.array_quotation_request,
        cache.coefficient
      ) === cache.commercialCompanyCoefficient ||
      get_quotation_request_value(
        this.array_quotation_request,
        QuoteScriptConstants.COORDINATION_OFFICE_SETUP
      ) === QuoteScriptConstants.RESPONSE_YES;
  }
  get_registration_month_() {
    const registration_month =
      this.trial_target_terms > QuoteScriptConstants.MAX_REGISTRATION_MONTHS
        ? QuoteScriptConstants.MAX_REGISTRATION_MONTHS
        : this.trial_start_date <= this.trial_target_start_date &&
          this.trial_target_end_date <= this.trial_end_date
        ? this.trial_target_terms
        : this.trial_target_start_date < this.trial_start_date
        ? this.trial_target_end_date
            .clone()
            .add(1, "days")
            .diff(this.trial_start_date, "months")
        : this.trial_end_date < this.trial_target_end_date
        ? this.trial_end_date
            .clone()
            .add(1, "days")
            .diff(this.trial_target_start_date, "months")
        : "";
    return registration_month;
  }
  set_registration_term_items_(input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error(
        "Failed to initialize ConfigCache in set_registration_term_items_"
      );
      return input_values;
    }

    if (
      (this.sheetname == cache.setupSheetName &&
        this.trial_target_terms < parseInt(cache.setupTerm)) ||
      (this.sheetname == cache.closingSheetName &&
        this.trial_target_terms < parseInt(cache.closingTerm))
    ) {
      return input_values;
    }
    const registration_month = this.get_registration_month_();
    // 事務局運営
    let setup_clinical_trials_office = 0;
    let registration_clinical_trials_office = 0;
    if (this.clinical_trials_office_flg) {
      registration_clinical_trials_office = registration_month;
      if (this.sheetname === cache.registration1SheetName) {
        setup_clinical_trials_office = cache.reg1SetupClinicalTrialsOffice;
      }
    }
    const central_monitoring = QuoteScriptConstants.CENTRAL_MONITORING;
    // 安全性管理、効安、事務局運営
    const ankan = get_count(
      get_quotation_request_value(
        this.array_quotation_request,
        QuoteScriptConstants.SAFETY_MANAGEMENT_SETUP
      ),
      QuoteScriptConstants.RESPONSE_SETUP_DELEGATE,
      QuoteScriptConstants.SAFETY_MANAGEMENT
    );
    const kouan = get_count(
      get_quotation_request_value(
        this.array_quotation_request,
        QuoteScriptConstants.EFFICACY_SAFETY_SETUP
      ),
      QuoteScriptConstants.RESPONSE_SETUP_DELEGATE,
      QuoteScriptConstants.EFFICACY_SAFETY_COMMITTEE
    );
    const clinical_trials_office = [
      [
        QuoteScriptConstants.CLINICAL_TRIALS_OFFICE_SETUP,
        setup_clinical_trials_office,
      ],
      [
        QuoteScriptConstants.CLINICAL_TRIALS_OFFICE_REGISTRATION,
        registration_clinical_trials_office,
      ],
    ].filter((x) => x[1] > 0);
    const target_items = [central_monitoring, ankan, kouan]
      .filter((x) => x != "")
      .map((x) => [x, registration_month]);
    return this.getSetValues(
      target_items.concat(clinical_trials_office),
      this.sheetname,
      input_values
    );
  }
  getSetValues(target_items, sheetname, input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in getSetValues");
      return input_values || [];
    }

    let array_count = input_values
      ? input_values
      : this.getSheetValues(sheetname);
    const target_sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    const array_item = get_fy_items(target_sheet, cache.fySheetItemsCol);
    target_items.forEach((target_item) => {
      const target_items_name = target_item[0];
      const month_count = target_item[1];
      const temp_row = array_item[target_items_name] - 1;
      if (!Number.isNaN(temp_row)) {
        array_count[temp_row][0] = month_count;
      }
    });
    return array_count;
  }
  getTargetRange(sheetname) {
    const target_sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    const target_range = target_sheet.getRange(
      this.target_col + ":" + this.target_col
    );
    return target_range;
  }
  getSheetValues(sheetname) {
    const target_range = this.getTargetRange(sheetname);
    return target_range.getValues();
  }
  setSheetValues(sheetname, target_values) {
    const target_range = this.getTargetRange(sheetname);
    target_range.setValues(target_values);
  }
  set_all_sheet_exclude_setup_(input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error(
        "Failed to initialize ConfigCache in set_all_sheet_exclude_setup_"
      );
      return input_values;
    }
    if (this.sheetname == cache.setupSheetName) {
      const dummy = this.set_setup_term_("reg1_setup_database_management");
    }
    if (
      this.sheetname == cache.setupSheetName &&
      this.trial_target_terms <= parseInt(cache.setupTerm)
    ) {
      return input_values;
    }
    let databaseManagementTerm =
      this.trial_target_terms < 12 ? this.trial_target_terms : 12;
    if (this.sheetname == cache.setupSheetName) {
      databaseManagementTerm =
        databaseManagementTerm - parseInt(cache.setupTerm);
    }
    if (this.sheetname === cache.registration1SheetName) {
      databaseManagementTerm =
        databaseManagementTerm - parseInt(cache.reg1SetupDatabaseManagement);
    }
    const set_items_list = [["データベース管理料", databaseManagementTerm]];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_all_sheet_common_items_(input_values) {
    const set_items_list = [
      [
        "プロジェクト管理",
        this.trial_target_terms < 12 ? this.trial_target_terms : 12,
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_setup_term_(property_name) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in set_setup_term_");
      return;
    }
    cache.scriptProperties.setProperty(property_name, 0);
    const tempTerm = parseInt(cache.setupTerm);
    const targetTerm = tempTerm - this.trial_target_terms;
    if (targetTerm > 0) {
      cache.scriptProperties.setProperty(property_name, targetTerm);
      return this.trial_target_terms;
    } else {
      return tempTerm;
    }
  }
  set_setup_clinical_trials_office() {
    if (!this.clinical_trials_office_flg) {
      return "";
    }
    return this.set_setup_term_("reg1_setup_clinical_trials_office");
  }
  set_setup_items_(input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in set_setup_items_");
      return input_values;
    }
    if (this.sheetname != cache.setupSheetName) {
      return input_values;
    }
    // 医師主導治験のみ算定または名称が異なる項目に対応する
    let sop = "";
    let office_irb_str = "IRB準備・承認確認";
    let office_irb = "";
    let set_accounts = "初期アカウント設定（施設・ユーザー）、IRB承認確認";
    // 事務局運営
    const clinical_trials_office = this.set_setup_clinical_trials_office();
    let drug_support = "";
    // trial!C29が空白でない場合は初期アカウント設定数をC29から取得する
    const dm_irb =
      "=if(isblank(Trial!C" +
      String(parseInt(cache.trialConstFacilitiesRow)) +
      "), " +
      "Trial!B" +
      String(parseInt(cache.trialConstFacilitiesRow)) +
      "," +
      "Trial!C" +
      String(parseInt(cache.trialConstFacilitiesRow)) +
      ")";
    if (cache.trialTypeValue == cache.investigatorInitiatedTrial) {
      sop = 1;
      office_irb_str = "IRB承認確認、施設管理";
      office_irb = cache.scriptProperties.getProperty("function_facilities");
      set_accounts = "初期アカウント設定（施設・ユーザー）";
      drug_support = cache.scriptProperties.getProperty("function_facilities");
    }
    const set_items_list = [
      ["プロトコルレビュー・作成支援", 1],
      ["検討会実施（TV会議等）", 4],
      [
        "PMDA相談資料作成支援",
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "PMDA相談資料作成支援"
          ),
          "あり",
          1
        ),
      ],
      [
        "AMED申請資料作成支援",
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "AMED申請資料作成支援"
          ),
          "あり",
          1
        ),
      ],
      [
        "特定臨床研究法申請資料作成支援",
        get_count(
          cache.trialTypeValue,
          cache.specifiedClinicalTrial,
          cache.scriptProperties.getProperty("function_facilities")
        ),
      ],
      [
        "キックオフミーティング準備・実行",
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "キックオフミーティング"
          ),
          "あり",
          1
        ),
      ],
      ["SOP一式、CTR登録案、TMF管理", sop],
      ["事務局運営（試験開始前）", clinical_trials_office],
      [office_irb_str, office_irb],
      ["薬剤対応", drug_support],
      [
        "モニタリング準備業務（関連資料作成）",
        get_count_more_than(
          get_quotation_request_value(
            this.array_quotation_request,
            "1例あたりの実地モニタリング回数"
          ),
          0,
          1
        ),
      ],
      ["EDCライセンス・データベースセットアップ", 1],
      ["業務分析・DM計画書の作成・CTR登録案の作成", 1],
      ["DB作成・eCRF作成・バリデーション", 1],
      ["バリデーション報告書", 1],
      [set_accounts, dm_irb],
      ["入力の手引作成", 1],
      [
        "外部監査費用",
        get_count_more_than(
          get_quotation_request_value(
            this.array_quotation_request,
            "監査対象施設数"
          ),
          0,
          1
        ),
      ],
      [
        cache.costOfPrepareItem,
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            cache.costOfPrepareQuotationRequest
          ),
          "あり",
          cache.scriptProperties.getProperty("function_facilities")
        ),
      ],
      [
        "保険料",
        get_count_more_than(
          get_quotation_request_value(this.array_quotation_request, "保険料"),
          0,
          1
        ),
      ],
      [
        "治験薬管理（中央）",
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "治験薬管理"
          ),
          "あり",
          1
        ),
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_closing_items_(input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in set_closing_items_");
      return input_values;
    }
    if (this.sheetname != cache.closingSheetName) {
      return input_values;
    }
    // csrの作成支援は医師主導治験ならば必須
    let csr_count = get_count(
      get_quotation_request_value(
        this.array_quotation_request,
        "研究結果報告書作成支援"
      ),
      "あり",
      1
    );
    // 医師主導治験のみ算定または名称が異なる項目に対応する
    let csr = "研究結果報告書の作成";
    let final_analysis = "最終解析プログラム作成、解析実施（シングル）";
    let final_analysis_table_count = get_quotation_request_value(
      this.array_quotation_request,
      "統計解析に必要な図表数"
    );
    let clinical_conference = "";
    let closing_meeting = "";
    let pmda_support = "";
    let audit_support = "";
    if (cache.trialTypeValue == cache.investigatorInitiatedTrial) {
      csr = "CSRの作成支援";
      csr_count = 1;
      final_analysis = "最終解析プログラム作成、解析実施（ダブル）";
      audit_support = 1;
      // 医師主導治験で症例検討会ありの場合症例検討会資料作成に1をセット、ミーティング1回追加
      if (
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "症例検討会"
          ),
          "あり",
          1
        ) > 0
      ) {
        clinical_conference = 1;
        closing_meeting = 1;
      }
      // 医師主導治験で統計解析に必要な帳票数が50未満であれば50をセットしtrialシートのコメントに追加
      if (final_analysis_table_count > 0 && final_analysis_table_count < 50) {
        final_analysis_table_count = 50;
        set_trial_comment_("統計解析に必要な帳票数を50表と想定しております。");
      }
    }
    const clinical_trials_office = this.clinical_trials_office_flg ? 1 : "";
    const set_items_list = [
      ["症例検討会準備・実行", closing_meeting],
      ["データクリーニング", 1],
      ["事務局運営（試験終了時）", clinical_trials_office],
      ["PMDA対応、照会事項対応", pmda_support],
      ["監査対応", audit_support],
      ["データベース固定作業、クロージング", 1],
      ["症例検討会資料作成", clinical_conference],
      [
        "統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成",
        get_count_more_than(final_analysis_table_count, 0, 1),
      ],
      [
        final_analysis,
        get_count_more_than(
          final_analysis_table_count,
          0,
          final_analysis_table_count
        ),
      ],
      [
        "最終解析報告書作成（出力結果＋表紙）",
        get_count_more_than(final_analysis_table_count, 0, 1),
      ],
      [csr, csr_count],
      [
        cache.costOfReportItem,
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            cache.costOfReportQuotationRequest
          ),
          "あり",
          cache.scriptProperties.getProperty("function_number_of_cases")
        ),
      ],
      [
        "外部監査費用",
        get_count_more_than(
          get_quotation_request_value(
            this.array_quotation_request,
            "監査対象施設数"
          ),
          0,
          1
        ),
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_registration_items_(input_values) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error(
        "Failed to initialize ConfigCache in set_registration_items_"
      );
      return input_values;
    }
    if (
      this.sheetname == cache.setupSheetName ||
      this.sheetname == cache.closingSheetName
    ) {
      return input_values;
    }
    let crb_first_year = "";
    let crb_after_second_year = "";
    // CRB申請費用
    if (this.sheetname == cache.registration1SheetName) {
      crb_first_year = get_count(
        get_quotation_request_value(this.array_quotation_request, "CRB申請"),
        "あり",
        1
      );
    } else {
      crb_after_second_year = get_count(
        get_quotation_request_value(this.array_quotation_request, "CRB申請"),
        "あり",
        1
      );
    }
    const set_items_list = [
      ["名古屋医療センターCRB申請費用(初年度)", crb_first_year],
      ["名古屋医療センターCRB申請費用(2年目以降)", crb_after_second_year],
      [
        "治験薬運搬",
        get_count(
          get_quotation_request_value(
            this.array_quotation_request,
            "治験薬運搬"
          ),
          "あり",
          cache.scriptProperties.getProperty("function_facilities")
        ),
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  setInterimAnalysis() {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in setInterimAnalysis");
      return;
    }
    const dataCleaning_before = this.getTargetItemCount("データクリーニング");
    const dataCleaning = dataCleaning_before > 0 ? dataCleaning_before + 1 : 1;
    const interimAnalysis =
      cache.trialTypeValue == cache.investigatorInitiatedTrial
        ? "中間解析プログラム作成、解析実施（ダブル）"
        : "中間解析プログラム作成、解析実施（シングル）";
    const interimTableCount = get_quotation_request_value(
      this.array_quotation_request,
      "中間解析に必要な図表数"
    );
    const set_items_list = [
      ["統計解析計画書・出力計画書・解析データセット定義書・解析仕様書作成", 1],
      [interimAnalysis, interimTableCount],
      ["中間解析報告書作成（出力結果＋表紙）", 1],
      ["データクリーニング", dataCleaning],
    ];
    const array_count = this.getSetValues(set_items_list, this.sheetname, null);
    this.setSheetValues(this.sheetname, array_count);
  }
  /**
   * itemnameの「回数」を取得する。
   * @param {string} 対象の項目名
   * @return {number} 回数
   */
  getTargetItemCount(itemname) {
    const cache = new ConfigCache();
    if (!cache.isValid) {
      console.error("Failed to initialize ConfigCache in getTargetItemCount");
      return 0;
    }
    const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      this.sheetname
    );
    const targetRow = get_row_num_matched_value(
      targetSheet,
      cache.fySheetItemsCol,
      itemname
    );
    return targetSheet
      .getRange(targetRow, parseInt(cache.fySheetCountCol))
      .getValue();
  }
}
/**
 * アクティブシートに中間解析の項目を設定する。
 * @param none
 * @return none
 */
function setInterimAnalysis() {
  const check = get_target_term_sheets().map((x) => x.getName());
  const target = SpreadsheetApp.getActiveSpreadsheet()
    .getActiveSheet()
    .getName();
  if (check.indexOf(target) < 0) {
    return;
  }
  const sheet = get_sheets();
  const quotation_request_last_col = sheet.quotation_request
    .getDataRange()
    .getLastColumn();
  const array_quotation_request = sheet.quotation_request
    .getRange(1, 1, 2, quotation_request_last_col)
    .getValues();
  const set_sheet_item_values = new SetSheetItemValues(
    target,
    array_quotation_request
  );
  set_sheet_item_values.setInterimAnalysis();
}
