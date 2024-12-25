function generateQRCode() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("");
  var dataRange = sheet.getRange("I2:I"); 
  var data = dataRange.getValues();
 
  for (var i = 0; i < data.length; i++) {
    var row = i + 2; 
    var coordinates = data[i][0];
    
    if (coordinates && sheet.getRange(row, 20).getValue() !== "Generated") {
        
      sheet.getRange(row, 19).setValue(qrCodeUrl);

      sheet.getRange(row, 20).setValue("Generated");
    }
  }
}
