// Support URL Examples:
// 如果 https://www.zanmei.ai/song/52195.html 标准品质试听
// 脚步 https://www.zanmei.ai/song/11322.html 高品质 & 标准品质
// 幸福 https://www.zanmei.ai/album/blessed.html 标准品质试听
// 帐幕 https://www.zanmei.ai/album/1717.html 高品质 & 标准品质
// 歌单 https://www.zanmei.ai/box/874891.html

import * as libbase from "./lib/base.js";
import * as libsong from "./lib/song.js";
import * as libalbum from "./lib/album.js";

const MediaType = {
  SONG: "song",
  ALBUM: "album",
  BOX: "box",
};

function judgeMediaTypeFromUrl(url) {
  const songRegex = /\/song\//i;
  const albumRegex = /\/album\//i;
  const boxRegex = /\/box\//i;

  if (songRegex.test(url)) {
    return MediaType.SONG;
  } else if (albumRegex.test(url)) {
    return MediaType.ALBUM;
  } else if (boxRegex.test(url)) {
    return MediaType.BOX;
  } else {
    return "unknown";
  }
}

gopeed.events.onResolve(async function (ctx) {
  const mediaType = judgeMediaTypeFromUrl(ctx.req.url);

  let resHubName = "爱赞美诗歌下载";
  let resFiles = [];

  gopeed.logger.info("media_type", mediaType);
  // throw new MessageError(mediaType);

  // 媒体类型：歌曲
  if (mediaType === MediaType.SONG) {
    resFiles = await handleSong(ctx);

    // 媒体类型：专辑
  } else if (mediaType === MediaType.ALBUM) {
    let [hubName, files] = await handleAlbum(ctx);
    resHubName = hubName;
    resFiles = files;
    // throw new MessageError(resFiles[0]["name"]);

    // 媒体类型：歌单
  } else if (mediaType === MediaType.BOX) {
    let [hubName, files] = await handleAlbum(ctx); // 能够复用专辑的处理逻辑
    resHubName = hubName;
    resFiles = files;

    // 媒体类型：未知
  } else {
    throw new MessageError("未知的媒体类型");
  }

  ctx.res = {
    name: resHubName,
    files: resFiles,
  };
});

// 音乐
async function handleSong(ctx) {
  const songWebUrl = ctx.req.url;
  let file = await libsong.GetSongFile(songWebUrl, gopeed.settings);
  return [file];
}

// 专辑
async function handleAlbum(ctx) {
  const albumWebUrl = ctx.req.url;

  const albumWebHtml = await libbase.FetchWebHtml(albumWebUrl, gopeed.settings);

  const [albumName, albumList] = libalbum.ParserSongWebUrlList(albumWebHtml);

  let files = [];
  for (var i = 0; i < albumList.length; i++) {
    let songItem = albumList[i];

    let name = songItem["name"] + ".mp3";
    let songRel = songItem["rel"];
    let url = await libsong.GetSongFileUrl(
      songItem["path"],
      gopeed.settings,
      songRel
    );

    let file = {
      name: name,
      req: {
        url: url,
      },
    };
    files.push(file);
  }
  return [albumName, files];
}
