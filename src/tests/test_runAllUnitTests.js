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
  console.log("All unit tests executed.");
}
function runAllUnitTest_utils() {}
