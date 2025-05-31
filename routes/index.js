var express = require('express');
var router = express.Router();
const process = require("../process");
const draw  = require('../drawCard');
const matter = require("gray-matter");
const md = require("markdown-it")({ html: true });
const path = require('path');
const fs = require('fs');
var url = require('url');
const axios = require('axios');

/**
 * Generate card
 * Params: {
 *  username: string
 *  color: string HEX color
 *  foreground: string HEX color
 *  badges: boolean
 *  header: boolean
 *  avatar: boolean
 * }
 */
router.get('/card', async (req, res, next) => {
  let username      = req.query.username;
  let displayBadges = (undefined === req.query.badges) ? 'true' : req.query.badges;
  let displayHeader = (undefined === req.query.header) ? 'true' : req.query.header;
  let refresh       = (undefined === req.query.refresh) ? 'false' : req.query.refresh;
  let color         = (undefined === req.query.color) ? '000000' : req.query.color; // TODO
  let foreground    = (undefined === req.query.foreground) ? 'ffffff' : req.query.foreground; // TODO
  let displayAvatar = (undefined === req.query.avatar) ? 'true' : req.query.avatar; // TODO
  
  let appURL        = req.protocol + '://' + req.get('host');
  let userData      = [];
  let avatarPath    = "public/images/avatar/";

  try {
    const wpURL   = 'https://profiles.wordpress.org/' + username;

    userData = await process.processCard(wpURL, username);

    const name          = userData["name"];
    const initials      = name.charAt(0) + name.substring(name.lastIndexOf(" ") + 1 ).charAt(0);
    const membersince   = userData["memberSince"];
    let avatar          = userData["avatar"];

    const badges        = await draw.renderBadgesSVG(userData["badges"], displayBadges);
    const badgesCount   = userData["badges"].length;
    const defaultHeight = ('true' === displayHeader) ? 145 : 50; // Reduced height when header is hidden
    const dynHeight     = ('true' === displayBadges) ? (defaultHeight + (32 * Math.floor((badgesCount > 4) ? badgesCount / 2 : badgesCount)) + ((badgesCount % 2 === 0) ? 0 : 30)) : defaultHeight;


    try {

      if (!fs.existsSync(avatarPath)) {
        fs.mkdirSync(avatarPath);
      }

      if (!fs.existsSync(avatarPath + username + '/card.svg') || ('true' === refresh)) {

        if (!fs.existsSync(avatarPath + username)) {
          fs.mkdirSync(avatarPath + username);
        }

        const response = await axios.get(avatar, {
          responseType: 'arraybuffer',
        });

        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        const contentType = response.headers['content-type'];
        const base64Image = `data:${contentType};base64,${base64}`;

        let htmlResult = await draw.renderCard(username, name, initials, membersince, base64Image, badges, dynHeight, displayHeader);

        fs.writeFileSync(avatarPath + username + '/card.svg', htmlResult);
        console.log('✅ SVG created with embedded image.');
      }

      res.setHeader(
        'Content-Security-Policy',
        "img-src * 'self' data: https:;",
      );
      res.setHeader('Content-Type', "image/svg+xml");
      res.sendFile(path.join(__dirname, '../' + avatarPath, username + '/card.svg'));

      } catch (err) {
        console.error('❌ Error creating SVG:', err);
      }

  } catch (err) {
    res.render('user-not-found', { title: 'User Not Found', userName: username, appURL: appURL, error: err });
  }
});

/**
 * Render index page
 */
router.get('/', async (req, res, next) => {
  try {
    const readme  = matter.read(__basedir + "/readme.md");
    const content = readme.content;
    const html    = md.render(content);

    res.render('index', { title: 'Welcome to CardPress - WordPress Profile Card', postContent: html });
  } catch (err) {
    next(err);
  }
});

/**
 * List all users
 */
router.get('/users', async (req, res, next) => {

  try {
    const directoryPath = path.join(__dirname, '../public/images/avatar');
    const directories = process.getDirectories(directoryPath);
    var users = ''; 
    users += directories.length + " users found<br><br><section class='users-list'>";

    directories.forEach(dir => users 
      += "<div><span>User: " + dir + "</span> - "
      + "<a href='https://profiles.wordpress.org/" + dir + "' target='_blank'>WordPress</a> - "
      + "<a href='https://cardpress.us/card?username=" + dir + "' target='_blank'>CardPress</a> - "
      + "<span>" + process.getDirectoryDateTime(directoryPath + "/" + dir).date + "</span> - " 
      + "<span>" + process.getDirectoryDateTime(directoryPath + "/" + dir).time + "</span></div>"
      );
    
    users += "</section>";
    res.render('users', { title: 'CardPress - Users', postContent: users });
  } catch (err) {
    next(err);
  }

});


module.exports = router;