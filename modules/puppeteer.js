const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const https = require("follow-redirects").https;
const fs = require("fs");
const AdmZip = require("adm-zip");

puppeteer.use(StealthPlugin());

const apiKey = process.env.ANTI_CPATCHA_KEY;
const pluginUrl = "https://antcpt.com/anticaptcha-plugin.zip";

const initBrowser = async () => {
  // await downloadAndExtractPlugin();
  // await setApiKeyInConfig();

  const browser = await puppeteer.launch({
    headless: false,
    // headless: "new",
    args: getBrowserLaunchArgs(),
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  return { browser, page };
};

const fetchPageHtml = async (page, url) => {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return await page.evaluate(() => document.documentElement.outerHTML);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const downloadAndExtractPlugin = async () => {
  await new Promise((resolve) => {
    https.get(pluginUrl, (resp) =>
      resp.pipe(fs.createWriteStream("./plugin.zip").on("close", resolve))
    );
  });

  const zip = new AdmZip("./plugin.zip");
  zip.extractAllTo("./plugin/", true);
};

const setApiKeyInConfig = async () => {
  const configFilePath = "./plugin/js/config_ac_api_key.js";
  if (fs.existsSync(configFilePath)) {
    let confData = fs.readFileSync(configFilePath, "utf8");
    confData = confData.replace(
      /antiCapthaPredefinedApiKey = ''/g,
      `antiCapthaPredefinedApiKey = '${apiKey}'`
    );
    fs.writeFileSync(configFilePath, confData, "utf8");
  } else {
    console.error("Plugin configuration not found!");
  }
};

const getBrowserLaunchArgs = () => [
  "--disable-web-security",
  "--disable-features=IsolateOrigins,site-per-process",
  "--allow-running-insecure-content",
  "--disable-blink-features=AutomationControlled",
  "--no-sandbox",
  "--mute-audio",
  "--no-zygote",
  "--no-xshm",
  "--window-size=1920,1080",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--enable-webgl",
  "--ignore-certificate-errors",
  "--lang=en-US,en;q=0.9",
  "--password-store=basic",
  "--disable-gpu-sandbox",
  "--disable-software-rasterizer",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-renderer-backgrounding",
  "--disable-infobars",
  "--disable-breakpad",
  "--disable-canvas-aa",
  "--disable-2d-canvas-clip-aa",
  "--disable-gl-drawing-for-tests",
  "--enable-low-end-device-mode",
];

module.exports = { initBrowser, fetchPageHtml };
