// Support URL Examples: 
// 如果 https://www.zanmei.ai/song/52195.html 标准品质试听
// 脚步 https://www.zanmei.ai/song/11322.html 高品质 & 标准品质

import * as libsong from './lib/song.js';

gopeed.events.onResolve(async function(ctx) {

  // Anonymous
  let files = []
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

  // songWebUrl 'https://www.zanmei.ai/song/52195.html';
  const songWebUrl = ctx.req.url;

  const palyUrl = libsong.AnonymousWebUrlToPlayUrl(songWebUrl)

  const html = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, gopeed.settings);

  const songName = libsong.ParserSongName(html);
  const downName = `${songName}.mp3`;
  
  return [
    {
      name: downName,
      req: {
        url: palyUrl,
      }
    }
  ]
}

async function parserAuthorizedDownloadUrl(ctx) {

  const songWebUrl = ctx.req.url;

  const html = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, gopeed.settings);

  const songId = libsong.ParserSongId(html)

  const downMeta = await libsong.FetchSongDownMetaJson(songId, gopeed.settings)

  // 当歌曲不提供下载时下载试听版本
  if (!downMeta["ok"]) {
    return parserAnonymousDownloadUrl(ctx);
  }

  const downName = `${downMeta["song"]}.mp3`;

  let downUrl = libsong.GetLowMP3UrlFromMetaJson(downMeta)
  if (gopeed.settings.quality == "songhigh") {
    downUrl = libsong.GetHighMP3UrlFromMetaJson(downMeta)
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