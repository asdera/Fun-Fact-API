import express from 'express';
import db from './db/db';
const request = require('request');
const cheerio = require('cheerio');

// Set up the express app
const app = express();
// get all todos
app.get('/facts', (req, res) => {
  request('https://en.wikipedia.org/wiki/Main_Page', (error, response, html) => {
      if (!error && response.statusCode == 200) {
          const $ = cheerio.load(html);

          var special = $('#mp-tfa > p > a').attr('href').substring(6).replace(/_/g, ' ');

          getWiki(res, special);
      }
  });
});

app.get('/facts/:id', (req, res) => {
  const id = req.params.id;
  getWiki(res, id);
  // return res.status(200).send({
  //   success: 'true',
  //   message: 'todo retrieved successfully',
  //   topic: id,
  //   fact: id,
  // });

  // return res.status(404).send({
  //   success: 'false',
  //   message: 'topic does not exist',
  // });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});

async function getWiki(res, text, force=true) {
  request('https://en.wikipedia.org/wiki/' + text, (error, response, html) => {
  if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);

      var facts = [];

      $('.mw-parser-output > p').each((i, el) => {
          // console.log("\n\n\n");
          // console.log(i, $(el).text());
          facts.push($(el).text());
      });

      // console.log('Scraping Done...');

      facts = facts.map(fact => cleanFact(fact)).filter(Boolean);

      var fact = facts.random();

      if (facts.length == 0) {
          if (force) {
              bot.sendMessage({
                  to: res,
                  message: "**No Fun Facts Found D:**"
              });
          }
      } else if (fact.slice(-1) == ":") {
          var refers = [];

          $('.mw-parser-output > ul > li > a').each((i, el) => {
              // console.log("\n\n\n");
              // console.log(i, $(el).attr('href'));
              refers.push($(el).attr('href').substring(6));
          });
          
          if (refers.length) {
            var refer;
              if (force) {
                  refer = refers.random();
                  
                  // bot.sendMessage({
                  //     to: res,
                  //     message: fact.slice(0, -1) + " **" + refer.replace(/_/g, ' ') + "**"
                  // });

                  // setTimeout(async () => { 
                  getWiki(res, refer);
                  // }, 2000);
              } else {
                  refer = refers[[0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3].random() % refers.length];
                  console.log(fact.slice(0, -1), refer.replace(/_/g, ' '));

                  getWiki(res, refer, false);
              }
          } else {
              console.log("nothing found")
          }
          
      } else {
          if (force) {
              return res.status(200).send({
                success: 'true',
                message: 'todo retrieved successfully',
                topic: text,
                fact: fact,
              });
          } else {
              // bot.sendMessage({
              //     to: res,
              //     message: "**Fun Fact about " + text.replace(/_/g, ' ') + ": **" + fact
              // });
          }
      }
  } else {
      // console.log(error + response.statusCode);
      if (force) {
          return res.status(404).send({
            success: 'false',
            message: 'topic not found',
          });
      }
  }
  });
}

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

Array.prototype.random = function () {
  return this[Math.floor((Math.random()*this.length))];
}

function replacer(match) {
  return match.slice(0, 2) + " " + match.slice(2)
}

function cleanFact(fact) {
  return fact.replace(/\[/g, '(').replace(/]/g, ')').replace(/\{/g, '(').replace(/}/g, ')').replace(/ *\([^)]*\) */g, "").replace(/\s+/g, ' ').replace(/\)/g, "").replace(/(:$|[a-zA-Z])[.,!?:;](:$|[a-zA-Z])/g, replacer).trim();
}
