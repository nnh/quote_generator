function runAllUnitTests_quote() {
  console.warn("!!! analysis_service.jsのテストは未実装");
  // apply_target_items.js
  testApplyTargetItemsToValues();
  // calculate_setup_term.js
  testCalculateSetupTermResult();
  // imbalance_distribution.js
  execAllImbalanceTests();
  // item_price_applier.js
  testItem_price_applier();
  // quotation_allSheet_items.js
  test_calculateDatabaseManagementTermPure();
  //quotation_closing_items.js
  test_getClosingTrialTypeConfig();
  test_createClosingItemsList();
  // quotation_registration_set_items.js
  test_createRegistrationItemsList();
  // quotation_registration_term_items.js
  test_setRegistrationTermItems();
  test_calcClinicalTrialsOfficeValues();
  test_shouldSkipRegistrationTermItems();
  // quotation_setup_items.js
  test_createSetupItemsList();
  test_getSetupTrialTypeConfig();
  // quotation_context.js
  test_initTargetColumn();
  test_isClinicalTrialsOfficeRequired();
  test_buildTrialTermResult();
  test_getTrialTermSheetValues();
  test_buildTrialDatesPure();
  // quote_main.js
  console.warn("!!! quote_main.jsのテストは未実装");
  // set_sheet_item_values.js
  console.warn("!!! set_sheet_item_values.jsのテストは未実装");
  // sheet_value_builder.js
  test_buildSheetValuesWithTargetItems();
  test_convertItemsMapToList();
  // trial_comment_manager.js
  testTrial_comment_manager();
  // trial_condition.js
  testDecideSetupClosingTerm();

  console.log("All unit tests executed.");
}
function runAllUnitTest_utils() {}
