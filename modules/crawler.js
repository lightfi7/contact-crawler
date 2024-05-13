const cheerio = require("cheerio");

const extractDataFromHtml = (html) => {
  try {
    const $ = cheerio.load(html, { decodeEntities: false });
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}/g;
    const phonePattern =
      /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/g;
    const socialPattern =
      /https?:\/\/(www\.)?(facebook|twitter|instagram|youtube\.com|linkedin\.com)\.com\/\w+/g;

    const extractedData = {
      emails: extractMatches(html, emailPattern),
      phoneNumbers: extractMatches(html, phonePattern),
      socialLinks: extractSocialLinks($, socialPattern),
    };

    return extractedData;
  } catch (error) {
    console.error("Error extracting data from HTML:", error);
    return {
      emails: [],
      phoneNumbers: [],
      socialLinks: [],
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