require("dotenv").config();
const events = require("events");
const { initBrowser, fetchPageHtml } = require("./modules/puppeteer");
const { makeDBConnection, makeCollection, makeSchema } = require("./database");
const { makeSocketConnection } = require("./modules/socket");
const gmapSchema = require("./database/schemas/gmap.schema");
const websiteSchema = require("./database/schemas/website.schema");
const contactSchema = require("./database/schemas/contact.schema");
const { extractDataFromHtml } = require("./modules/crawler");
const { resolve } = require("path");

let started = false;
let Gmap = null,
  Website = null,
  Contact = null;

const myEmitter = new events.EventEmitter();
let onStopEvent = null;

const startWork = () =>
  new Promise(async (resolve) => {
    started = true;
    const { browser, page } = await initBrowser();
    socket?.emit("started", {});
    onStopEvent = async () => {
      started = false;
      socket?.emit("stopped", {});
      await browser.close();
      if (resolve) resolve();
    };
    myEmitter.on("stop", onStopEvent);
    try {
      let n = 0;
      while (started) {
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        socket?.emit("message", {
          message: ">",
        });
        let websites = await Website.find({}, { url: 1 })
          .skip(n * 1000)
          .limit((n + 1) * 1000);
        if (websites.length === 0) {
          n = 0;
        }
        for (let i = 0; i < websites.length; i++) {
          let url = websites[i].url;
          let html = await fetchPageHtml(page, url);
          let result = extractDataFromHtml(html);
          socket?.emit("message", { message: `u: ${url}` });
          socket?.emit("message", {
            message: `emails: ${result.email_addresses.length} phones: ${result.phone_numbers.length} socials: ${result.social_links.length}`,
          });
          await Contact.updateOne(
            { url },
            {
              $set: {
                result,
              },
            },
            {
              upsert: true,
            }
          );
        }
        n++;
      }
      started = false;
      await browser.close();
      socket?.emit("stopped", {});
      resolve();
    } catch (err) {
      console.error(err);
      started = false;
      await browser.close();
      socket?.emit("message", { message: err.message });
      socket?.emit("stopped", {});
      resolve();
    }
  });

(async () => {
  try {
    await makeDBConnection(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
    });

    Gmap = makeCollection("gmaps", makeSchema(gmapSchema));
    Website = makeCollection("websites", makeSchema(websiteSchema));
    Contact = makeCollection("Contact", makeSchema(contactSchema));

    (async () => {
      await startWork();
    })();

    makeSocketConnection(process.env.SOCKET_URL, (socket) => {
      global.socket = socket;
      socket.on("connect", () => {
        console.log(":)");
        socket.emit("ping", { type: "cli" });
        if (started) socket.emit("started", {});

        socket.on("start", async () => {
          if (!started) {
            await startWork();
            myEmitter.on("off", onStopEvent);
            onStopEvent = null;
          }
        });

        socket.on("stop", async (data) => {
          if (started) {
            started = false;
            myEmitter.emit("stop");
          }
        });

        socket.on("disconnect", () => {
          console.log(";)");
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
})();
