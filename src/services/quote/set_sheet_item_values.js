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
    const date_list = {
      trial_target_terms: this.trial_target_terms,
      trial_start_date: this.trial_start_date,
      trial_end_date: this.trial_end_date,
      trial_target_start_date: this.trial_target_start_date,
      trial_target_end_date: this.trial_target_end_date,
    };
    const context = {
      data_list: date_list,
      sheetname: this.sheetname,
      clinical_trials_office_flg: this.clinical_trials_office_flg,
      array_quotation_request: this.array_quotation_request,
    };
    setRegistrationTermItems_(input_values, context);
    /*
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
    const registration_month = calcRegistrationMonth_({
      trial_target_terms: this.trial_target_terms,
      trial_start_date: this.trial_start_date,
      trial_end_date: this.trial_end_date,
      trial_target_start_date: this.trial_target_start_date,
      trial_target_end_date: this.trial_target_end_date,
    });
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
    );*/
  }
  getSetValues(target_items, sheetname, input_values) {
    return buildSheetValuesWithTargetItems_(
      sheetname,
      target_items,
      input_values,
    );
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
  /**
   * SETUP期間の消費量を計算し、残期間を次年度へ繰り越すための処理
   *
   * - Script Properties に保存されている setup_term（SETUPの残期間）を取得する
   * - trial_target_terms（当年度で消費可能な期間）分だけ SETUP期間を消費する
   * - 消費後に残った SETUP期間は、指定したプロパティ名で保存し、
   *   次年度以降に繰り越される
   * - 実際の消費量と残量の計算ロジックは calculateSetupTermResult_ に委譲する
   *
   * @param {string} property_name
   *   消費後の SETUP期間（残期間）を保存する Script Properties のキー
   *
   * @return {number}
   *   当年度で消費された SETUP期間
   */
  set_setup_term_(property_name) {
    const properties = PropertiesService.getScriptProperties();

    const setupTerm = parseInt(properties.getProperty("setup_term"), 10) || 0;

    const { consumed, remaining } = calculateSetupTermResult_(
      setupTerm,
      this.trial_target_terms,
    );
    // 残った SETUP期間は次年度に繰り越す
    properties.setProperty(property_name, remaining);

    return consumed;
  }

  set_setup_clinical_trials_office() {
    if (!this.clinical_trials_office_flg) {
      return "";
    }
    return this.set_setup_term_("reg1_setup_clinical_trials_office");
  }
  set_setup_items_(input_values) {
    if (this.sheetname != QUOTATION_SHEET_NAMES.SETUP) {
      return input_values;
    }
    // 事務局運営
    const clinical_trials_office = this.set_setup_clinical_trials_office();

    const set_items_list = buildSetupSetItems_(
      this.array_quotation_request,
      clinical_trials_office,
    );

    return this.getSetValues(set_items_list, this.sheetname, input_values);
  }
  set_closing_items_(input_values) {
    if (this.sheetname !== QUOTATION_SHEET_NAMES.CLOSING) {
      return input_values;
    }
    // 事務局運営
    const clinical_trials_office = this.clinical_trials_office_flg ? 1 : "";
    const set_items_list = buildClosingSetItems_(
      this.array_quotation_request,
      clinical_trials_office,
    );
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
