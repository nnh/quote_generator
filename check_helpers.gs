function addTrialTypeConditionalItem(checkItems, investigatorName, otherName, requestArray, properties, investigatorValue, otherValue = '') {
  const trialType = get_quotation_request_value(requestArray, '試験種別');
  const isInvestigator = trialType === properties.getProperty('investigator_initiated_trial');
  const itemName = isInvestigator ? investigatorName : otherName;
  const value = isInvestigator ? investigatorValue : otherValue;
  checkItems.push({itemname: itemName, value: value});
  return value;
}

function addThresholdCheckItem(checkItems, itemName, requestArray, conditionKey, thresholdValue, trueValue, falseValue = '') {
  const actualValue = get_quotation_request_value(requestArray, conditionKey);
  const value = actualValue > thresholdValue ? trueValue : falseValue;
  checkItems.push({itemname: itemName, value: value});
  return value;
}

function addMonitoringCheckItem(checkItems, itemName, requestArray, facilitiesValue) {
  const condition1 = get_quotation_request_value(requestArray, '1例あたりの実地モニタリング回数') > 0;
  const condition2 = get_quotation_request_value(requestArray, '年間1施設あたりの必須文書実地モニタリング回数') > 0;
  const value = (condition1 || condition2) ? facilitiesValue : '';
  checkItems.push({itemname: itemName, value: value});
  return value;
}

function addAnalysisCountItem(checkItems, itemName, requestArray, conditions) {
  let value = 0;
  conditions.forEach(condition => {
    if (get_quotation_request_value(requestArray, condition) === CONDITION_ARI) {
      value++;
    }
  });
  const finalValue = value === 0 ? '' : value;
  checkItems.push({itemname: itemName, value: finalValue});
  return finalValue;
}

function addDelegateCheckItem(checkItems, itemName, requestArray, conditionKey, trialMonths) {
  const value = get_quotation_request_value(requestArray, conditionKey) === SETUP_DELEGATE ? trialMonths : '';
  checkItems.push({itemname: itemName, value: value});
  return value;
}

function addYearBasedItem(checkItems, itemName, requestArray, conditionKey, facilitiesValue, trialYear) {
  if (get_quotation_request_value(requestArray, conditionKey) === CONDITION_ARI) {
    const value = trialYear > 0 ? facilitiesValue * trialYear : facilitiesValue;
    checkItems.push({itemname: itemName, value: value});
    return value;
  } else {
    checkItems.push({itemname: itemName, value: ''});
    return '';
  }
}

function addCRBYearItem(checkItems, itemName, requestArray, trialYear, isFirstYear = true) {
  if (get_quotation_request_value(requestArray, 'CRB申請') === CONDITION_ARI) {
    let value;
    if (isFirstYear) {
      value = 1;
    } else {
      value = trialYear > 1 ? trialYear - 1 : '';
    }
    checkItems.push({itemname: itemName, value: value});
    return value;
  } else {
    checkItems.push({itemname: itemName, value: ''});
    return '';
  }
}
