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
    const scriptProperties = PropertiesService.getScriptProperties();
    const setupTermLimit = Number(scriptProperties.getProperty("setup_term"));
    const closingTermLimit = Number(
      scriptProperties.getProperty("closing_term"),
    );

    if (
      shouldSkipRegistrationTermItems_(
        this.sheetname,
        this.trial_target_terms,
        setupTermLimit,
        closingTermLimit,
      )
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
      date_list: date_list,
      sheetname: this.sheetname,
      clinical_trials_office_flg: this.clinical_trials_office_flg,
      array_quotation_request: this.array_quotation_request,
    };
    const target_items = buildRegistrationTermItems_(context);
    return this.getSetValues(target_items, this.sheetname, input_values);
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
  set_nonSetup_term_items_(input_values) {
    const scriptProperties = PropertiesService.getScriptProperties();

    if (this.sheetname === QUOTATION_SHEET_NAMES.SETUP) {
      this.set_setup_term_("reg1_setup_database_management");
    }

    const setupTerm = Number(scriptProperties.getProperty("setup_term"));
    if (
      shouldSkipDatabaseManagement_(
        this.sheetname,
        this.trial_target_terms,
        setupTerm,
      )
    ) {
      return input_values;
    }

    const databaseManagementTerm = calculateDatabaseManagementTerm_(
      this.sheetname,
      this.trial_target_terms,
      scriptProperties,
    );

    const setItemsList = [
      [ITEMS_SHEET.ITEMNAMES.DATABASE_MANAGEMENT_FEE, databaseManagementTerm],
    ];

    return this.getSetValues(setItemsList, this.sheetname, input_values);
  }

  set_all_sheet_common_items_(input_values) {
    const setItemsList = buildCommonSetItems_(this.trial_target_terms);
    return this.getSetValues(setItemsList, this.sheetname, input_values);
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
      this.sheetname === QUOTATION_SHEET_NAMES.SETUP ||
      this.sheetname === QUOTATION_SHEET_NAMES.CLOSING
    ) {
      return input_values;
    }

    const setItemsList = buildRegistrationSetItems_(
      this.array_quotation_request,
      this.sheetname,
    );

    return this.getSetValues(setItemsList, this.sheetname, input_values);
  }

  setInterimAnalysis() {
    const scriptProperties = PropertiesService.getScriptProperties();

    const trialType = scriptProperties.getProperty("trial_type_value");

    const interimTableCount = get_quotation_request_value_(
      this.array_quotation_request,
      "中間解析に必要な図表数",
    );

    const dataCleaningBefore = this.getTargetItemCount(
      ITEMS_SHEET.ITEMNAMES.DATA_CLEANING,
    );

    const setItems = buildInterimAnalysisItems_({
      trialType,
      interimTableCount,
      dataCleaningBefore,
    });

    const values = this.getSetValues(setItems, this.sheetname, null);
    this.setSheetValues(this.sheetname, values);
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
