const { PDFParse } = require('pdf-parse');

const extractTextFromPDF = async (buffer) => {
  let parser = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};

module.exports = { extractTextFromPDF };
