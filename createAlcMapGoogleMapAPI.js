function createAlcMapGoogleMapAPI() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("");

  var dataRange = sheet.getRange("I2:I" + sheet.getLastRow()); 
  var data = dataRange.getValues();
  
  for (var i = 0; i < data.length; i++) {
    var row = i + 2; 
    var coordinates = data[i][0];
    
    if (coordinates) { 
      var mapUrl = generateMapUrl(coordinates);
      sheet.getRange(row, 22).setValue(mapUrl);
    }
  }
}

function generateMapUrl(coordinates) {
  var apiKey = ''; 
  var zoom = 15;
  var scale = 1;
  var size = '550x350';
  
  if (coordinates && typeof coordinates === 'string') {
    var parts = coordinates.split(',');

    if (parts.length !== 2) {
      throw new Error('Invalid coordinates format: ' + coordinates);
    }

    var lat = parts[0].trim();
    var lng = parts[1].trim();
  } else {
    throw new Error('Invalid coordinates input');
  }
}
