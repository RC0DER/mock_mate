require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-2.5-flash'];
  for (let m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("hello");
      console.log(`✅ ${m} works!`);
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.status || e.message}`);
    }
  }
}
testModels();
