// Support URL Examples:
// 如果 https://www.zanmei.ai/song/52195.html 标准品质试听
// 脚步 https://www.zanmei.ai/song/11322.html 高品质 & 标准品质
// 幸福 https://www.zanmei.ai/album/blessed.html

import * as libsong from "./lib/song.js";
import * as libalbum from "./lib/album.js";

const MediaType = {
  SONG: "song",
  ALBUM: "album",
};

function judgeMediaTypeFromUrl(url) {
  const songRegex = /\/song\//i;
  const albumRegex = /\/album\//i;

  if (songRegex.test(url)) {
    return MediaType.SONG;
  } else if (albumRegex.test(url)) {
    return MediaType.ALBUM;
  } else {
    return "unknown";
  }
}

gopeed.events.onResolve(async function (ctx) {
  const mediaType = judgeMediaTypeFromUrl(ctx.req.url);

  let files = [];

  // 媒体类型：歌曲
  if (mediaType === MediaType.SONG) {
    files = await handleSong(ctx);

    // 媒体类型：专辑
  } else if (mediaType === MediaType.ALBUM) {
    files = await handleAlbum(ctx);

    // 媒体类型：未知
  } else {
    throw new MessageError("未知的媒体类型");
  }

  ctx.res = {
    name: "爱赞美诗歌下载",
    files: files,
  };
});

// 音乐
async function handleSong(ctx) {
  const songWebUrl = ctx.req.url;
  let file = await parserDownloadFile(songWebUrl, gopeed.settings);
  return [file];
}

// 专辑
async function handleAlbum(ctx) {
  const albumWebUrl = ctx.req.url;

  const albumWebHtml = await libalbum.FetchAlbumWebHtmlAnonymous(
    albumWebUrl,
    gopeed.settings
  );

  const albumList = libalbum.ParserSongWebUrlList(albumWebHtml);

  let files = [];
  for (var i = 0; i < albumList.length; i++) {
    let songItem = albumList[i];

    let name = songItem["name"] + ".mp3";
    let url = await parserDownloadUrl(songItem["path"], gopeed.settings);

    let file = {
      name: name,
      req: {
        url: url,
      },
    };
    files.push(file);
  }
  return files;
}

// ------ 下载音乐 ------

async function parserDownloadFile(songWebUrl, settings) {
  // Anonymous
  let file = {};
  if (settings.cookie == "") {
    file = await parserAnonymousDownloadFile(songWebUrl, settings);

    // Authorized with Cookie
  } else {
    file = await parserAuthorizedDownloadFile(songWebUrl, settings);
  }
  return file;
}

async function parserAnonymousDownloadFile(songWebUrl, settings) {
  const palyUrl = libsong.AnonymousWebUrlToPlayUrl(songWebUrl);

  const html = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, settings);

  const songName = libsong.ParserSongName(html);
  const downName = `${songName}.mp3`;

  return {
    name: downName,
    req: {
      url: palyUrl,
    },
  };
}

async function parserAuthorizedDownloadFile(songWebUrl, settings) {
  const html = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, settings);

  const songId = libsong.ParserSongId(html);

  const downMeta = await libsong.FetchSongDownMetaJson(songId, settings);

  // 当歌曲不提供下载时下载试听版本
  if (!downMeta["ok"]) {
    return parserAnonymousDownloadFile(ctx);
  }

  const downName = `${downMeta["song"]}.mp3`;

  let downUrl = libsong.GetLowMP3UrlFromMetaJson(downMeta);
  if (settings.quality == "songhigh") {
    downUrl = libsong.GetHighMP3UrlFromMetaJson(downMeta);
  }

  return {
    name: downName,
    req: {
      url: downUrl,
    },
  };
}

async function parserDownloadUrl(songWebUrl, settings) {
  // Anonymous
  let url = "";
  if (settings.cookie == "") {
    url = await parserAnonymousDownloadUrl(songWebUrl);

    // Authorized with Cookie
  } else {
    url = await parserAuthorizedDownloadUrl(songWebUrl, settings);
  }
  return url;
}

async function parserAnonymousDownloadUrl(songWebUrl) {
  return libsong.AnonymousWebUrlToPlayUrl(songWebUrl);
}

async function parserAuthorizedDownloadUrl(songWebUrl, settings) {
  const html = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, settings);

  const songId = libsong.ParserSongId(html);

  const downMeta = await libsong.FetchSongDownMetaJson(songId, settings);

  // 当歌曲不提供下载时下载试听版本
  if (!downMeta["ok"]) {
    return parserAnonymousDownloadUrl(ctx);
  }

  let downUrl = libsong.GetLowMP3UrlFromMetaJson(downMeta);
  if (gopeed.settings.quality == "songhigh") {
    downUrl = libsong.GetHighMP3UrlFromMetaJson(downMeta);
  }
  return downUrl;
}
