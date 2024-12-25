function generatePDFs() {
  const templateDocId = '';
  const folderId = ''; 
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();
  const folder = DriveApp.getFolderById(folderId);

 // Define Thai month names
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  for (let i = 1; i < values.length; i++) {
    try {
      const row = values[i];

      // Prepare data for placeholders
      const pressureGauge = row[15] ? row[15].toString() : ''; // Column P

      // Prepare data for placeholders
      const date = formatThaiDate(row[5]); // Column F
      const time = Utilities.formatDate(new Date(row[6]), Session.getScriptTimeZone(), "HH:mm:ss"); // Column G

      if (!pressureGauge) {
        Logger.log('Pressure Gauge data is missing for row ' + (i + 1));
        continue;
      }

      // สร้างสำเนาของ Google Doc template
      const docCopy = DriveApp.getFileById(templateDocId).makeCopy();
      const docId = docCopy.getId();
      const doc = DocumentApp.openById(docId);
      const body = doc.getBody();

      // แทนที่ placeholder ด้วยข้อมูลจริง
      body.replaceText('{หมายเลขจุดวัด}', row[2]); // Column C
      body.replaceText('{สาขา}', row[3]); // Column D
      body.replaceText('{หน่วยบริการ}', row[4]); // Column E
      body.replaceText('{วันที่}', date); // Formatted date
      body.replaceText('{เวลา}', time); // Formatted time
      body.replaceText('{DMA}', row[7]); // Column H
      body.replaceText('{พิกัด}', row[8]); // Column I
      body.replaceText('{สถานที่ใกล้เคียง}', row[10]); // Column K
      body.replaceText('{แรงดัน}', pressureGauge); // Column P
      body.replaceText('{ผู้รายงาน}', row[16]); // Column Q

      // แทนที่ placeholder ด้วยรูปภาพ
      replaceTextToImage(body, '{LinkImage1}', row[13], 70, 50); // Column R
      replaceTextToImage(body, '{LinkImage2}', row[14], 70, 50); // Column S
      replaceTextToImage(body, '{LinkImage3}', row[17], 80, 80); // Column T


      // บันทึกไฟล์และแปลงเป็น PDF
      doc.saveAndClose();
      const pdfContentBlob = docCopy.getAs(MimeType.PDF);
      const fileName = row[2] + "_" + new Date().getTime() + ".pdf";
      folder.createFile(pdfContentBlob).setName(fileName);

      // ลบไฟล์สำเนาของ Google Doc
      DriveApp.getFileById(docId).setTrashed(true);

    } catch (e) {
      Logger.log("Error creating PDF for row " + (i + 1) + ": " + e.toString());
    }
  }
}

function formatThaiDate(dateValue) {
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const date = new Date(dateValue);
  const day = Utilities.formatDate(date, Session.getScriptTimeZone(), "dd");
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543; // Convert from AD to BE (Buddhist Era)

  return `${day} ${month} ${year}`;
}

function replaceTextToImage(body, placeholder, imageUrl, maxWidth, maxHeight) {
  try {
    if (imageUrl) {
      const response = UrlFetchApp.fetch(imageUrl);
      const blob = response.getBlob();

      // Resize image while maintaining aspect ratio
      const resizedBlob = resizeImage(blob, maxWidth, maxHeight);
      
      // Find the placeholder and replace it with the resized image
      const element = body.findText(placeholder);

      if (element) {
        const paragraph = element.getElement().asParagraph();
        paragraph.clear(); // Clear placeholder text
        paragraph.appendInlineImage(resizedBlob).setWidth(maxWidth).setHeight(maxHeight); // Insert resized image
      }
    }
  } catch (e) {
    Logger.log("Error replacing placeholder with image: " + e.toString());
  }
}

function resizeImage(blob, maxWidth, maxHeight) {
  // Create a temporary file to manipulate the image
  const tempFile = DriveApp.createFile(blob);
  const image = ImagesService.getImage(tempFile.getId());
  
  // Resize image while maintaining aspect ratio
  const { width, height } = image.getSize();
  let newWidth = maxWidth;
  let newHeight = (height / width) * newWidth;
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = (width / height) * newHeight;
  }
  
  const resizedBlob = image.resize(newWidth, newHeight).getBlob();
  
  // Clean up temporary file
  DriveApp.getFileById(tempFile.getId()).setTrashed(true);
  
  return resizedBlob;
}

