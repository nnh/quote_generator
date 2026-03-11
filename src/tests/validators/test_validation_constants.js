function test_buildQuotationRequestValidationContext() {
  const result = buildQuotationRequestValidationContext_();

  if (result && typeof result === "object" && !Array.isArray(result)) {
    console.log(
      "✅ buildQuotationRequestValidationContext_ returned an object.",
    );
  } else {
    throw new Error(
      "❌ buildQuotationRequestValidationContext_ did not return an object.",
    );
  }
}
