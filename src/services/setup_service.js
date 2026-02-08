function setEditUsers_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const users = ss.getEditors();
  const protections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  protections.forEach((protection) => {
    users.forEach((user) => protection.addEditor(user));
  });
}
