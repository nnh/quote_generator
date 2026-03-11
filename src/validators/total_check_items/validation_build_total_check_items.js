function validationBuildTotalCheckItems_(params) {
  const totalCheckItems = [];
  const totalAmountCheckItems = [];

  /** ==============================
   * Protocol
   ============================== */
  totalCheckItems.push(...validationBuildProtocolItems_(params));

  /** ==============================
   * Monitoring
   ============================== */
  totalCheckItems.push(...validationBuildMonitoringItems_(params));
  /** ==============================
   * Office / DM
   ============================== */
  totalCheckItems.push(
    ...validationBuildQuotationOfficeOperationItems_(params),
  );
  totalCheckItems.push(...validationBuildOfficeOperationItems_(params));

  /** ==============================
   * Statistical
   ============================== */
  totalCheckItems.push(...validationBuildStatisticalItems_(params));

  /** ==============================
   * Audit
   ============================== */
  totalCheckItems.push(...validationBuildAuditItems_());

  /** ==============================
   * Research Funding
   ============================== */
  const costAndPayment = validationBuildCostAndPaymentItems_(params);
  totalCheckItems.push(...costAndPayment.checkItems);
  totalAmountCheckItems.push(...costAndPayment.amountCheckItems);

  /** ==============================
   * Publication
   ============================== */
  totalCheckItems.push(...validationBuildPublicationItems_());

  /** ==============================
   * Cost
   ============================== */
  const costItems = validationBuildCostItems_(params);

  totalCheckItems.push(...costItems.totalCheckItems);
  totalAmountCheckItems.push(...costItems.totalAmountCheckItems);

  /** ==============================
   * Other
   ============================== */
  totalCheckItems.push(...validationBuildOtherItems_(params));

  return {
    totalCheckItems,
    totalAmountCheckItems,
  };
}
