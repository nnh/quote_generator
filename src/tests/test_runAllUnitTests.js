function runAllUnitTests_quote() {
  console.warn("!!! analysis_service.jsのテストは未実装");
  // quotation_target_item_applier.js
  testApplyTargetItemsToValues();
  // calculate_setup_term.js
  testCalculateSetupTermResult();
  // imbalance_distribution.js
  execAllImbalanceTests();
  // item_price_applier.js
  testItem_price_applier();
  // quotation_all_sheet_item_definition.js
  test_calculateDatabaseManagementTermPure();
  //quotation_closing_item_definition.js
  test_getClosingTrialTypeConfig();
  test_createClosingItemsList();
  // quotation_registration_set_item_definition.js
  test_createRegistrationItemsList();
  // quotation_registration_term_item_definition.js
  test_setRegistrationTermItems();
  test_calcClinicalTrialsOfficeValues();
  test_shouldSkipRegistrationTermItems();
  // quotation_setup_item_definition.js
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
  // quotation_sheet_item_value_writer.js
  console.warn("!!! quotation_sheet_item_value_writer.jsのテストは未実装");
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
