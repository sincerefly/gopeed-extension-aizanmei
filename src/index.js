// Support URL Examples: 
// 如果 https://www.zanmei.ai/song/52195.html 高品质 & 标准品质
// 脚步 https://www.zanmei.ai/song/11322.html 标准品质试听

import * as cheerio from 'cheerio';

gopeed.events.onResolve(async function(ctx) {
  console.log(ctx.req)

  // Anonymous
  var files = []
  if (gopeed.settings.cookie == "") {
    files = await parserAnonymousDownloadUrl(ctx)
  
  // Authorized with Cookie
  } else {
    files = await parserAuthorizedDownloadUrl(ctx)
  }

  ctx.res = {
    name: "爱赞美诗歌下载",
    files: files,
  };
});

async function parserAnonymousDownloadUrl(ctx) {

  let path = new URL(ctx.req.url).pathname.substring(1);
  // const reg = /^(.*)\/contributors$/;
  const reg = /song\/(.*).html/;

  const matched = path.match(reg); // song/52195.html
  if (!matched) {
    throw new MessageError('Not a valid www.zanmei.ai song url');
  }

  // parse songId from url, e.g. 52195
  const songId = matched[1];
  gopeed.logger.debug('path', path);

  const downUrl = `https://play.zanmei.co/song/p/${songId}.mp3`;

  // const url = 'https://www.zanmei.ai/song/52195.html';
  const resp = await fetch(ctx.req.url, {
    headers: {
      'User-Agent': gopeed.settings.ua,
    },
  });
  const html = await resp.text();
  const $ = cheerio.load(html);
  const title = $('title').text();
  const name = title.split('-')[0].trim();
  
  const downName = `${name}.mp3`;

  return [
    {
      name: downName,
      req: {
        url: downUrl,
      }
    }
  ]
}

async function getSongId(ctx) {
  const resp = await fetch(ctx.req.url, {
    headers: {
      'User-Agent': gopeed.settings.ua,
    },
  });
  const html = await resp.text();
  const $ = cheerio.load(html);

  // 获取 id 为 btn_play 的元素
  const btnPlayElement = $('#btn_play');

  // 获取 rel 属性值
  const relValue = btnPlayElement.attr('rel');
  
  // 5162d1f07d4c50078848a510
  return relValue
}

async function parserAuthorizedDownloadUrl(ctx) {

  var songId = await getSongId(ctx)
  
  var metaUrl = `https://www.zanmei.ai/ajax/down/${songId}`

  const resp = await fetch(metaUrl, {
    headers: {
      'User-Agent': gopeed.settings.ua,
      'Accept': "application/json, text/javascript, */*; q=0.01",
      'Accept-Language': "zh,en-US;q=0.7,en;q=0.3",
      'Cookie': gopeed.settings.cookie,
    },
  });
  const json = await resp.json();

  // 当歌曲不提供下载时下载试听版本
  if (!json["ok"]) {
    return parserAnonymousDownloadUrl(ctx);
  }  

  const downName = `${json["song"]}.mp3`;

  var downUrl = json["play"]["url"];
  if (gopeed.settings.quality == "songhigh") {
    downUrl = json["down"]["url"];
  }

  return [
    {
      name: downName,
      req: {
        url: downUrl,
      },
    }
  ]
}
