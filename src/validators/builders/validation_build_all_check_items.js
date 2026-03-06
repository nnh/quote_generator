/** 総チェック項目生成のラッパー */
function buildAllCheckItems_(params) {
  const totalCheckItems = buildTotalCheckItems_(params).totalCheckItems;
  const totalAmountCheckItems =
    buildTotalCheckItems_(params).totalAmountCheckItems;
  return { totalCheckItems, totalAmountCheckItems };
}
