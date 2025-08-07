const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse"); // assuming you're using pdf-parse
const pdfDir = path.join(__dirname, "src", "data", "pdfs");
const outputFilePath = path.join(__dirname, "src", "data", "database.json");

const allResults = [];

fs.readdirSync(pdfDir).forEach(file => {
  const filePath = path.join(pdfDir, file);
  const dataBuffer = fs.readFileSync(filePath);

  pdf(dataBuffer).then(result => {
    console.log(`✅ Extracted: ${file}`);
    allResults.push({
      filename: file,
      content: result.text.trim()
    });

    // Check if all PDFs processed before writing
    if (allResults.length === fs.readdirSync(pdfDir).length) {
      fs.writeFileSync(outputFilePath, JSON.stringify(allResults, null, 2), "utf-8");
      console.log("✅ All data saved to database.json");
    }
  }).catch(err => {
    console.error(`❌ Error parsing ${file}:`, err);
  });
});
