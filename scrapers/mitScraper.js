const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'chrome-temp', 'src', 'data', 'database.json');
const url = 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/pages/lecture-notes/';

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    console.log('✅ Loaded lecture notes page');

    await page.waitForSelector('.courseInner h2');

    const content = await page.evaluate(() => {
      const data = [];
      const sections = document.querySelectorAll('.courseInner h2');

      sections.forEach((section) => {
        const question = section.innerText.trim();
        let answer = "";

        // Traverse next siblings to collect answer text until next heading
        let sibling = section.nextElementSibling;
        while (sibling && sibling.tagName !== 'H2') {
          if (sibling.innerText.trim()) {
            answer += sibling.innerText.trim() + "\n";
          }
          sibling = sibling.nextElementSibling;
        }

        if (question && answer) {
          data.push({ question, answer: answer.trim() });
        }
      });

      return data;
    });

    if (content.length === 0) {
      console.warn('⚠️ No content found. The page structure may have changed.');
    } else {
      console.log(`✅ Scraped ${content.length} Q&A items`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');
    console.log(`✅ Data saved to: ${outputPath}`);

    await browser.close();
  } catch (error) {
    console.error('❌ Scraping error:', error);
  }
})();

