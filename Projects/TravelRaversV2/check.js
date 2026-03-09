const { chromium } = require('playwright');
(async () => {
  try {
    const b = await chromium.launch({ headless: true });
    const p = await b.newPage();

    await p.goto('http://localhost:8081');
    await p.waitForFunction(() => !!document.body);
    await p.waitForTimeout(4000);

    const results = await p.evaluate(() => {
      // Traverse React Native elements to find background color
      function getDeepBgColors(node) {
        if (!node) return [];
        const styles = window.getComputedStyle(node);
        let bg = styles.backgroundColor;
        let colors = [];
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'rgb(255, 255, 255)') {
          colors.push(bg);
        }
        for (const child of node.children) {
          colors.push(...getDeepBgColors(child));
        }
        return colors;
      }

      const allBgColors = getDeepBgColors(document.body);
      const hasDarkBg = allBgColors.includes('rgb(3, 6, 15)'); // #03060f

      const divs = document.querySelectorAll('div');
      const mods = Array.from(divs).filter(d => {
        const text = d.innerText || '';
        return text.includes('EVENTS') || text.includes('MAP');
      });

      return {
        hasDarkBg,
        uniqueBgColors: [...new Set(allBgColors)],
        tronModulesFound: mods.length,
        sampleInnerText: document.body.innerText.substring(0, 200)
      };
    });

    console.log('UI Verification:', JSON.stringify(results, null, 2));

    await p.screenshot({ path: 'tron-ui-screenshot.png' });
    await b.close();
  } catch (err) {
    console.error('Playwright Error:', err.message);
    process.exit(1);
  }
})();
