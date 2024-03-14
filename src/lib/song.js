import * as cheerio from "cheerio";
import * as libbase from "./base.js";

// 将歌曲网页 URL 转换为播放 URL（试听 URL）
export function songWebUrlToPlayUrl(path) {
  const reg = /song\/(.*).html/;

  const matched = path.match(reg); // song/52195.html
  if (!matched) {
    return "";
  }

  // songShortId from url, e.g. 52195
  const songShortId = matched[1];

  return `https://play.zanmei.co/song/p/${songShortId}.mp3`;
}

// 从 HTML 页面中解析出歌曲名称
export function parserSongName(songWebHtml) {
  const $ = cheerio.load(songWebHtml);
  const title = $("title").text();
  const name = title.split("-")[0].trim();
  return name;
}

// 从 HTML 页面中解析出歌曲 Ref
export function parserSongRel(songWebHtml) {
  const $ = cheerio.load(songWebHtml);

  // 获取 id 为 btn_play 的元素
  const btnPlayElement = $("#btn_play");

  // 获取 rel 属性值
  const relValue = btnPlayElement.attr("rel");

  // 5162d1f07d4c50078848a510
  return relValue;
}

// 获取音乐的 DownMeta 信息
export async function FetchSongDownMetaJson(songId, settings) {
  const metaUrl = `https://www.zanmei.ai/ajax/down/${songId}`;
  const resp = await fetch(metaUrl, {
    headers: {
      "User-Agent": settings.ua,
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "zh,en-US;q=0.7,en;q=0.3",
      Cookie: settings.cookie,
    },
  });
  return await resp.json();
}

// 从 DownMeta 中获取标准品质的 MP3 URL
export function lowMp3Url(downMeta) {
  if (!downMeta["ok"]) {
    return "";
  }
  return downMeta["play"]["url"];
}

// 从 DownMeta 中获取高品质的 MP3 URL
export function highMp3Url(downMeta) {
  if (!downMeta["ok"]) {
    return "";
  }
  // 如果没有高品质降级为标准品质
  if (!downMeta["down"]["status"]) {
    return downMeta["play"]["url"];
  }
  return downMeta["down"]["url"];
}

/*
 * GetSongFile 获取音乐文件完整下载信息
 */
export async function GetSongFile(songWebUrl, settings) {
  // Anonymous or Authorized with Cookie
  if (settings.cookie == "") {
    return await getSongFileAnonymous(songWebUrl, settings);
  }
  return await getSongFileAuthorized(songWebUrl, settings);
}

async function getSongFileAnonymous(songWebUrl, settings) {
  const palyUrl = songWebUrlToPlayUrl(songWebUrl);

  const html = await libbase.FetchWebHtml(songWebUrl, settings);

  const songName = parserSongName(html);
  const downName = `${songName}.mp3`;

  return {
    name: downName,
    req: {
      url: palyUrl,
    },
  };
}

async function getSongFileAuthorized(songWebUrl, settings) {
  const html = await libbase.FetchWebHtml(songWebUrl, settings);

  const songId = parserSongRel(html);

  const downMeta = await FetchSongDownMetaJson(songId, settings);

  // 当歌曲不提供下载时下载试听版本
  if (!downMeta["ok"]) {
    return getSongFileAnonymous(ctx);
  }

  const downName = `${downMeta["song"]}.mp3`;

  let downUrl = lowMp3Url(downMeta);
  if (settings.quality == "songhigh") {
    downUrl = highMp3Url(downMeta);
  }

  return {
    name: downName,
    req: {
      url: downUrl,
    },
  };
}

/*
 * GetSongFileUrl 获取音乐文件下载地址
 */
export async function GetSongFileUrl(songWebUrl, settings, songRel) {
  // Anonymous or Authorized with Cookie
  if (settings.cookie == "") {
    return await getSongFileUrlAnonymous(songWebUrl);
  }
  return await getSongFileUrlAuthorized(songWebUrl, settings, songRel);
}

async function getSongFileUrlAnonymous(songWebUrl) {
  return songWebUrlToPlayUrl(songWebUrl);
}

async function getSongFileUrlAuthorized(songWebUrl, settings, songRel) {
  // 获取 rel 属性值
  if (songRel == "") {
    const html = await libbase.FetchWebHtml(songWebUrl, settings);
    songRel = parserSongRel(html);
  }

  const downMeta = await FetchSongDownMetaJson(songRel, settings);

  // 当歌曲不提供下载时下载试听版本
  if (!downMeta["ok"]) {
    return getSongFileUrlAnonymous(songWebUrl);
  }

  let downUrl = lowMp3Url(downMeta);
  if (settings.quality == "songhigh") {
    downUrl = highMp3Url(downMeta);
  }
  return downUrl;
}
