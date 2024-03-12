// Support URL: https://www.zanmei.ai/song/52195.html

import * as cheerio from 'cheerio';

gopeed.events.onResolve(async function(ctx) {
  console.log(ctx.req)

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

  // fetch song html
  const resp = await fetch(ctx.req.url, {
    headers: {
      'User-Agent': gopeed.settings.ua,
    },
  });
  const html = await resp.text();
  const $ = cheerio.load(html);
  const title = $('title').text();
  const downname = title.split('-')[0].trim();
  
  const downfile = `${downname}.mp3`;

  ctx.res = {
    name: "爱赞美诗歌下载",
    files: [
      {
        name: downfile,
        req: {
          url: downUrl,
        },
      },
    ],
  };
});