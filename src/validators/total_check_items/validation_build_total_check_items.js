function buildTotalCheckItems_(params) {
  const totalCheckItems = [];
  const totalAmountCheckItems = [];

  /** ==============================
   * Protocol
   ============================== */
  totalCheckItems.push(...buildProtocolItems_(params));

  /** ==============================
   * Monitoring
   ============================== */
  totalCheckItems.push(...buildMonitoringItems_(params));
  /** ==============================
   * Office / DM
   ============================== */
  totalCheckItems.push(...buildQuotationOfficeOperationItems_(params));
  totalCheckItems.push(...buildOfficeOperationItems_(params));

  /** ==============================
   * Statistical
   ============================== */
  totalCheckItems.push(...buildStatisticalItems_(params));

  /** ==============================
   * Audit
   ============================== */
  totalCheckItems.push(...buildAuditItems_());

  /** ==============================
   * Research Funding
   ============================== */
  const costAndPayment = buildCostAndPaymentItems_(params);
  totalCheckItems.push(...costAndPayment.checkItems);
  totalAmountCheckItems.push(...costAndPayment.amountCheckItems);

  /** ==============================
   * Publication
   ============================== */
  totalCheckItems.push(...buildPublicationItems_());

  /** ==============================
   * Cost
   ============================== */
  const costItems = buildCostItems_(params);

  totalCheckItems.push(...costItems.totalCheckItems);
  totalAmountCheckItems.push(...costItems.totalAmountCheckItems);

  /** ==============================
   * Other
   ============================== */
  totalCheckItems.push(...buildOtherItems_(params));

  return {
    totalCheckItems,
    totalAmountCheckItems,
  };
}
