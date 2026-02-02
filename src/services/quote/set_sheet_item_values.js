/**
 * 年度別シート値設定クラス
 * - class SetSheetItemValues
 */
class SetSheetItemValues {
  constructor(sheetname, array_quotation_request) {
    this.sheetname = sheetname;
    this.array_quotation_request = array_quotation_request;
    const trialTerm = getTrialTerm_(this.sheetname);
    this.trial_target_terms = trialTerm.trial_target_terms;
    this.trial_term_values = trialTerm.trial_term_values;
    //initSetSheetItemValues_(this);
    const trialDates = initSetSheetItemTrialDates_(this.trial_term_values);
    this.trial_target_start_date = trialDates.trial_target_start_date;
    this.trial_target_end_date = trialDates.trial_target_end_date;
    this.trial_start_date = trialDates.trial_start_date;
    this.trial_end_date = trialDates.trial_end_date;
    this.target_col = initTargetColumn_();
    // 企業原資または調整事務局の有無が「あり」または医師主導治験ならば事務局運営を積む
    this.clinical_trials_office_flg = initClinicalTrialsOfficeFlg_(
      this.array_quotation_request,
    );
  }
  /*
  initTrialDates_() {
    const get_s_p = PropertiesService.getScriptProperties();

    this.trial_target_start_date = Moment.moment(
      this.trial_term_values
        ? this.trial_term_values[TRIAL_SHEET.COLUMNS.TRIAL_START - 1]
        : undefined,
    );

    this.trial_target_end_date = Moment.moment(
      this.trial_term_values
        ? this.trial_term_values[TRIAL_SHEET.COLUMNS.TRIAL_END - 1]
        : undefined,
    );

    this.trial_start_date = Moment.moment(
      get_s_p.getProperty("trial_start_date"),
    );

    this.trial_end_date = Moment.moment(get_s_p.getProperty("trial_end_date"));
  }*/
  /*
  get_registration_month_() {
    const registration_month =
      this.trial_target_terms > 12
        ? 12
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
  */
  get_registration_month_() {
    return calcRegistrationMonth_({
      trial_target_terms: this.trial_target_terms,
      trial_start_date: this.trial_start_date,
      trial_end_date: this.trial_end_date,
      trial_target_start_date: this.trial_target_start_date,
      trial_target_end_date: this.trial_target_end_date,
    });
  }

  set_registration_term_items_(input_values) {
    const get_s_p = PropertiesService.getScriptProperties();
    if (
      (this.sheetname == QUOTATION_SHEET_NAMES.SETUP &&
        this.trial_target_terms <
          parseInt(get_s_p.getProperty("setup_term"))) ||
      (this.sheetname == QUOTATION_SHEET_NAMES.CLOSING &&
        this.trial_target_terms < parseInt(get_s_p.getProperty("closing_term")))
    ) {
      return input_values;
    }
    const registration_month = this.get_registration_month_();
    // 事務局運営
    let setup_clinical_trials_office = 0;
    let registration_clinical_trials_office = 0;
    if (this.clinical_trials_office_flg) {
      registration_clinical_trials_office = registration_month;
      if (this.sheetname === QUOTATION_SHEET_NAMES.REGISTRATION_1) {
        setup_clinical_trials_office =
          Number(get_s_p.getProperty("reg1_setup_clinical_trials_office")) || 0;
      }
    }
    const central_monitoring =
      "ロジカルチェック、マニュアルチェック、クエリ対応";
    // 安全性管理、効安、事務局運営
    const ankan = returnIfEquals_(
      get_quotation_request_value_(
        this.array_quotation_request,
        "安全性管理事務局設置",
      ),
      "設置・委託する",
      "安全性管理事務局業務",
    );
    const kouan = returnIfEquals_(
      get_quotation_request_value_(
        this.array_quotation_request,
        "効安事務局設置",
      ),
      "設置・委託する",
      "効果安全性評価委員会事務局業務",
    );
    const clinical_trials_office = [
      ["事務局運営（試験開始前）", setup_clinical_trials_office],
      [
        "事務局運営（試験開始後から試験終了まで）",
        registration_clinical_trials_office,
      ],
    ].filter((x) => x[1] > 0);
    const target_items = [central_monitoring, ankan, kouan]
      .filter((x) => x != "")
      .map((x) => [x, registration_month]);
    return this.getSetValues(
      target_items.concat(clinical_trials_office),
      this.sheetname,
      input_values,
    );
  }
  getSetValues(target_items, sheetname, input_values) {
    const get_s_p = PropertiesService.getScriptProperties();
    let array_count = input_values
      ? input_values
      : this.getSheetValues(sheetname);
    const target_sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    const array_item = get_fy_items_(
      target_sheet,
      TOTAL_AND_PHASE_SHEET.COLUMNS.ITEM_NAME,
    );
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
    return getTargetCountRange_(sheetname, this.target_col);
  }
  getSheetValues(sheetname) {
    return getTargetCountValues_(sheetname, this.target_col);
  }
  setSheetValues(sheetname, target_values) {
    setTargetCountValues_(sheetname, this.target_col, target_values);
  }
  set_all_sheet_exclude_setup_(input_values) {
    const get_s_p = PropertiesService.getScriptProperties();
    if (this.sheetname == QUOTATION_SHEET_NAMES.SETUP) {
      const dummy = this.set_setup_term_("reg1_setup_database_management");
    }
    if (
      this.sheetname == QUOTATION_SHEET_NAMES.SETUP &&
      this.trial_target_terms <= parseInt(get_s_p.getProperty("setup_term"))
    ) {
      return input_values;
    }
    let databaseManagementTerm =
      this.trial_target_terms < 12 ? this.trial_target_terms : 12;
    if (this.sheetname == QUOTATION_SHEET_NAMES.SETUP) {
      databaseManagementTerm =
        databaseManagementTerm - parseInt(get_s_p.getProperty("setup_term"));
    }
    if (this.sheetname === QUOTATION_SHEET_NAMES.REGISTRATION_1) {
      databaseManagementTerm =
        databaseManagementTerm -
        parseInt(get_s_p.getProperty("reg1_setup_database_management"));
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
    const get_s_p = PropertiesService.getScriptProperties();
    get_s_p.setProperty(property_name, 0);
    const tempTerm = parseInt(get_s_p.getProperty("setup_term"));
    const targetTerm = tempTerm - this.trial_target_terms;
    if (targetTerm > 0) {
      get_s_p.setProperty(property_name, targetTerm);
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
    const get_s_p = PropertiesService.getScriptProperties();
    if (this.sheetname != QUOTATION_SHEET_NAMES.SETUP) {
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
      "=if(isblank(" +
      TRIAL_SHEET.NAME +
      "!C" +
      String(TRIAL_SHEET.ROWS.FACILITIES) +
      "), " +
      TRIAL_SHEET.NAME +
      "!B" +
      String(TRIAL_SHEET.ROWS.FACILITIES) +
      "," +
      TRIAL_SHEET.NAME +
      "!C" +
      String(parseInt(TRIAL_SHEET.ROWS.TRIAL_CONST_FACILITIES)) +
      ")";
    if (
      get_s_p.getProperty("trial_type_value") ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
    ) {
      sop = 1;
      office_irb_str = "IRB承認確認、施設管理";
      office_irb = FUNCTION_FORMULAS.FACILITIES;
      set_accounts = "初期アカウント設定（施設・ユーザー）";
      drug_support = FUNCTION_FORMULAS.FACILITIES;
    }
    const set_items_list = [
      ["プロトコルレビュー・作成支援", 1],
      ["検討会実施（TV会議等）", 4],
      [
        "PMDA相談資料作成支援",
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "PMDA相談資料作成支援",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          1,
        ),
      ],
      [
        "AMED申請資料作成支援",
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "AMED申請資料作成支援",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          1,
        ),
      ],
      [
        "特定臨床研究法申請資料作成支援",
        returnIfEquals_(
          TRIAL_SHEET.ITEMNAMES.TRIAL_TYPE,
          TRIAL_TYPE_LABELS.SPECIFIED_CLINICAL,
          FUNCTION_FORMULAS.FACILITIES,
        ),
      ],
      [
        "キックオフミーティング準備・実行",
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "キックオフミーティング",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          1,
        ),
      ],
      ["SOP一式、CTR登録案、TMF管理", sop],
      ["事務局運営（試験開始前）", clinical_trials_office],
      [office_irb_str, office_irb],
      ["薬剤対応", drug_support],
      [
        "モニタリング準備業務（関連資料作成）",
        returnIfGreaterThan_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "1例あたりの実地モニタリング回数",
          ),
          0,
          1,
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
        returnIfGreaterThan_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "監査対象施設数",
          ),
          0,
          1,
        ),
      ],
      [
        ITEMS_SHEET.ITEMNAMES.PREPARE_FEE,
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            QUOTATION_REQUEST_SHEET.ITEMNAMES.PREPARE_FEE,
          ),
          COMMON_EXISTENCE_LABELS.YES,
          FUNCTION_FORMULAS.FACILITIES,
        ),
      ],
      [
        "保険料",
        returnIfGreaterThan_(
          get_quotation_request_value_(
            this.array_quotation_request,
            QUOTATION_REQUEST_SHEET.ITEMNAMES.INSURANCE_FEE,
          ),
          0,
          1,
        ),
      ],
      [
        "治験薬管理（中央）",
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "治験薬管理",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          1,
        ),
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_closing_items_(input_values) {
    const get_s_p = PropertiesService.getScriptProperties();
    if (this.sheetname != QUOTATION_SHEET_NAMES.CLOSING) {
      return input_values;
    }
    // csrの作成支援は医師主導治験ならば必須
    let csr_count = returnIfEquals_(
      get_quotation_request_value_(
        this.array_quotation_request,
        "研究結果報告書作成支援",
      ),
      COMMON_EXISTENCE_LABELS.YES,
      1,
    );
    // 医師主導治験のみ算定または名称が異なる項目に対応する
    let csr = "研究結果報告書の作成";
    let final_analysis = "最終解析プログラム作成、解析実施（シングル）";
    let final_analysis_table_count = get_quotation_request_value_(
      this.array_quotation_request,
      "統計解析に必要な図表数",
    );
    let clinical_conference = "";
    let closing_meeting = "";
    let pmda_support = "";
    let audit_support = "";
    if (
      get_s_p.getProperty("trial_type_value") ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
    ) {
      csr = "CSRの作成支援";
      csr_count = 1;
      final_analysis = "最終解析プログラム作成、解析実施（ダブル）";
      audit_support = 1;
      // 医師主導治験で症例検討会ありの場合症例検討会資料作成に1をセット、ミーティング1回追加
      if (
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "症例検討会",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          1,
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
        returnIfGreaterThan_(final_analysis_table_count, 0, 1),
      ],
      [
        final_analysis,
        returnIfGreaterThan_(
          final_analysis_table_count,
          0,
          final_analysis_table_count,
        ),
      ],
      [
        "最終解析報告書作成（出力結果＋表紙）",
        returnIfGreaterThan_(final_analysis_table_count, 0, 1),
      ],
      [csr, csr_count],
      [
        ITEMS_SHEET.ITEMNAMES.REPORT_FEE,
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            QUOTATION_REQUEST_SHEET.ITEMNAMES.REPORT_FEE,
          ),
          COMMON_EXISTENCE_LABELS.YES,
          FUNCTION_FORMULAS.NUMBER_OF_CASES,
        ),
      ],
      [
        "外部監査費用",
        returnIfGreaterThan_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "監査対象施設数",
          ),
          0,
          1,
        ),
      ],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_registration_items_(input_values) {
    if (
      this.sheetname == QUOTATION_SHEET_NAMES.SETUP ||
      this.sheetname == QUOTATION_SHEET_NAMES.CLOSING
    ) {
      return input_values;
    }
    let crb_first_year = "";
    let crb_after_second_year = "";
    // CRB申請費用
    if (this.sheetname == QUOTATION_SHEET_NAMES.REGISTRATION_1) {
      crb_first_year = returnIfEquals_(
        get_quotation_request_value_(this.array_quotation_request, "CRB申請"),
        COMMON_EXISTENCE_LABELS.YES,
        1,
      );
    } else {
      crb_after_second_year = returnIfEquals_(
        get_quotation_request_value_(this.array_quotation_request, "CRB申請"),
        COMMON_EXISTENCE_LABELS.YES,
        1,
      );
    }
    // 開始前モニタリング・必須文書確認
    const essential_documents_count = get_quotation_request_value_(
      this.array_quotation_request,
      "年間1施設あたりの必須文書実地モニタリング回数",
    );
    const essential_documents = Number.isInteger(essential_documents_count)
      ? FUNCTION_FORMULAS.FACILITIES + " * " + essential_documents_count
      : "";
    const set_items_list = [
      ["名古屋医療センターCRB申請費用(初年度)", crb_first_year],
      ["名古屋医療センターCRB申請費用(2年目以降)", crb_after_second_year],
      [
        "治験薬運搬",
        returnIfEquals_(
          get_quotation_request_value_(
            this.array_quotation_request,
            "治験薬運搬",
          ),
          COMMON_EXISTENCE_LABELS.YES,
          FUNCTION_FORMULAS.FACILITIES,
        ),
      ],
      ["開始前モニタリング・必須文書確認", essential_documents],
    ];
    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  setInterimAnalysis() {
    const get_s_p = PropertiesService.getScriptProperties();
    const dataCleaning_before = this.getTargetItemCount("データクリーニング");
    const dataCleaning = dataCleaning_before > 0 ? dataCleaning_before + 1 : 1;
    const interimAnalysis =
      get_s_p.getProperty("trial_type_value") ===
      TRIAL_TYPE_LABELS.INVESTIGATOR_INITIATED
        ? "中間解析プログラム作成、解析実施（ダブル）"
        : "中間解析プログラム作成、解析実施（シングル）";
    const interimTableCount = get_quotation_request_value_(
      this.array_quotation_request,
      "中間解析に必要な図表数",
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
    return getTargetItemCount_(this.sheetname, itemname);
  }
}
