const puppeteer = require('puppeteer');

const urls = [
  { "name": "التسوق حسب الهدف > الصحة العامة", "link": "https://www.nahdionline.com/ar/vitamins-supplements" },
  { "name": "التسوق حسب الهدف > الصحة العامة > النوم والاسترخاء", "link": "https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/sleep-relaxation" },
  { "name": "التسوق حسب الهدف > الصحة العامة > القلب والدورة الدموية", "link": "https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/heart-circulation-health" },
  { "name": "التسوق حسب الهدف > الصحة العامة > الفيتامينات والمعادن", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins" },
  { "name": "التسوق حسب الهدف > الصحة العامة > مكملات مرض السكرى", "link": "https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/diabetes-care" },
  { "name": "التسوق حسب الهدف > الصحة العامة > الدماغ والجسم", "link": "https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/brain-body" },
  { "name": "التسوق حسب الهدف > الصحة العامة > دعم المناعة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/shop-by-health-condition/immunity-enhancers" },
  { "name": "التسوق حسب الهدف > صحة المرأة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/women-s-health" },
  { "name": "التسوق حسب الهدف > صحة المرأة > الشعر والبشرة والأظافر", "link": "https://www.nahdionline.com/ar/vitamins-supplements/women-s-health/hair-skin-nails" },
  { "name": "التسوق حسب الهدف > صحة المرأة > فيتامينات الام", "link": "https://www.nahdionline.com/ar/vitamins-supplements/women-s-health/pregnancy-lactation" },
  { "name": "التسوق حسب الهدف > صحة الرجل", "link": "https://www.nahdionline.com/ar/vitamins-supplements/mens-health" },
  { "name": "التسوق حسب الهدف > صحة الرجل > الطاقة والقدرة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/mens-health/energy-boosters" },
  { "name": "التسوق حسب الهدف > صحة الرجل > مكملات الرجال", "link": "https://www.nahdionline.com/ar/vitamins-supplements/mens-health" },
  { "name": "التسوق حسب الهدف > صحة الاطفال", "link": "https://www.nahdionline.com/ar/vitamins-supplements/children-s-health" },
  { "name": "التسوق حسب الهدف > صحة الاطفال > دماغ وجسم الاطفال", "link": "https://www.nahdionline.com/ar/vitamins-supplements/children-s-health/memory-focus" },
  { "name": "التسوق حسب الهدف > صحة الاطفال > دعم المناعة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/children-s-health/immunity-boosters" },
  { "name": "التسوق حسب الهدف > صحة الاطفال > فيتامينات ومعادن الاطفال", "link": "https://www.nahdionline.com/ar/vitamins-supplements/children-s-health/daily-vitamins" },
  { "name": "التسوق حسب الهدف > الرياضة واللياقة البدنية", "link": "https://www.nahdionline.com/ar/vitamins-supplements/sport-nutrition" },
  { "name": "التسوق حسب الهدف > الرياضة واللياقة البدنية > الاداء الرياضى", "link": "https://www.nahdionline.com/ar/vitamins-supplements/sport-nutrition" },
  { "name": "التسوق حسب الهدف > الرياضة واللياقة البدنية > ملحقات الرياضة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/sport-nutrition" },
  { "name": "التسوق حسب الهدف > الرياضة واللياقة البدنية > بروتينات الرياضة", "link": "https://www.nahdionline.com/ar/vitamins-supplements/sport-nutrition" },
  { "name": "التسوق حسب الهدف > الأطعمة الصحية", "link": "https://www.nahdionline.com/ar/healthy-food" },
  { "name": "التسوق حسب الهدف > الأطعمة الصحية > العسل", "link": "https://www.nahdionline.com/ar/healthy-food/honey" },
  { "name": "التسوق حسب الهدف > الأطعمة الصحية > المحليات والمشروبات", "link": "https://www.nahdionline.com/ar/healthy-food/healthy-drinks" },
  { "name": "التسوق حسب الفيتامينات > الكالسيوم", "link": "https://www.nahdionline.com/ar/vitamins-supplements/minerals/calcium" },
  { "name": "التسوق حسب الفيتامينات > فيتامين هـ", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-e" },
  { "name": "التسوق حسب الفيتامينات > فيتامين ك", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-k" },
  { "name": "التسوق حسب الفيتامينات > فيتامين سي", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-c" },
  { "name": "التسوق حسب الفيتامينات > فيتامين د", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-d" },
  { "name": "التسوق حسب الفيتامينات > فيتامين ب", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-b" },
  { "name": "التسوق حسب الفيتامينات > فيتامين أ", "link": "https://www.nahdionline.com/ar/vitamins-supplements/vitamins/vitamin-a" },
  { "name": "التسوق حسب الفيتامينات > زينك", "link": "https://www.nahdionline.com/ar/vitamins-supplements/minerals/zinc" },
  { "name": "التسوق حسب الفيتامينات > زيت كبد الحوت", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/fish-oil-omega-3" },
  { "name": "التسوق حسب الفيتامينات > زيت السمك", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/fish-oil-omega-3" },
  { "name": "التسوق حسب الفيتامينات > أوميجا 9", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/omega-9" },
  { "name": "التسوق حسب الفيتامينات > أوميجا 6", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/omega-6" },
  { "name": "التسوق حسب الفيتامينات > أوميجا 3", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/fish-oil-omega-3" },
  { "name": "التسوق حسب الفيتامينات > إنزيم كيو 10", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/coenzyme-q10" },
  { "name": "التسوق حسب الفيتامينات > الميلاتونين", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/melatonin" },
  { "name": "التسوق حسب الفيتامينات > المغنسيوم", "link": "https://www.nahdionline.com/ar/vitamins-supplements/minerals/magnesium" },
  { "name": "التسوق حسب الفيتامينات > الكولاجين", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/collagen-types-1-and-3" },
  { "name": "التسوق حسب الفيتامينات > الشاي الأخضر", "link": "https://www.nahdionline.com/ar/vitamins-supplements/herbal-remedies/green-tea" },
  { "name": "التسوق حسب الفيتامينات > الحديد", "link": "https://www.nahdionline.com/ar/vitamins-supplements/minerals/iron" },
  { "name": "التسوق حسب الفيتامينات > الجلوكوزامين", "link": "https://www.nahdionline.com/ar/vitamins-supplements/supplements/glucosamine-chondroitin" },
  { "name": "التسوق حسب الفيتامينات > الثوم", "link": "https://www.nahdionline.com/ar/vitamins-supplements/herbal-remedies/garlic" },
  { "name": "التسوق حسب الفيتامينات > البوتاسيوم", "link": "https://www.nahdionline.com/ar/vitamins-supplements/minerals/potassium" },
  { "name": "التسوق حسب الفيتامينات > أشواغاندا", "link": "https://www.nahdionline.com/ar/vitamins-supplements/herbal-remedies/ashwagandha" }
];


async function scrapeCategories() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const result = [];

  for (const category of urls) {
    try {
      await page.goto(category.link, { waitUntil: 'domcontentloaded' });
      console.log("searching : " + category.link);
      

      // Wait for the element containing the breadcrumb or category structure
      await page.waitForSelector('ul.items', { timeout: 30000 });

      // Get the breadcrumb categories
      const breadcrumbs = await page.evaluate(() => {
        const breadcrumbElements = Array.from(document.querySelectorAll('ul.items > li'));
        return breadcrumbElements.map((li) => {
          const link = li.querySelector('a');
          if (link) {
            return link.textContent.trim();
          } else {
            // For <strong> elements that are not links (sub-categories)
            return li.textContent.trim();
          }
        }).filter((text) => text.length > 0); // Filter out empty text values
      });

      if (breadcrumbs.length > 0) {
        result.push({
          originalName: category.name,
          hierarchy: breadcrumbs.join(' > ') // Combine all breadcrumb items with ' > '
        });
      } else {
        result.push({
          originalName: category.name,
          hierarchy: null // If no breadcrumbs found, set hierarchy as null
        });
      }
    } catch (error) {
      console.error(`Error scraping category ${category.name}:`, error.message);
      result.push({
        originalName: category.name,
        hierarchy: null // If an error occurs, set hierarchy as null
      });
    }
  }

  await browser.close();

  // Print out the result
  console.log(JSON.stringify(result, null, 2));
}

scrapeCategories();

