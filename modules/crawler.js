const cheerio = require("cheerio");

const extractDataFromHtml = (html) => {
  try {
    const $ = cheerio.load(html, { decodeEntities: false });
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phonePattern =
      /\+(?:1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const socialPattern =
      /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|twitter|linkedin|instagram|youtube)\.com\/(?:[\w\-\.]+\/?)+/g;
    const extractedData = {
      email_addresses: extractMatches(html, emailPattern),
      phone_numbers: extractMatches(html, phonePattern),
      social_links: extractSocialLinks($, socialPattern),
    };

    return extractedData;
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return {
      email_addresses: [],
      phone_numbers: [],
      social_links: [],
    };
  }
};

const extractMatches = (text, pattern) => {
  const matches = text.match(pattern) || [];
  return [...new Set(matches)];
};

const extractSocialLinks = ($, pattern) => {
  const links = new Set();
  $("a").each((_, anchor) => {
    const href = $(anchor).attr("href");
    if (href && pattern.test(href)) {
      links.add(href);
    }
  });
  return [...links];
};

module.exports = {
  extractDataFromHtml,
};
