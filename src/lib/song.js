import * as cheerio from "cheerio";

export function AnonymousWebUrlToPlayUrl(path) {
  const reg = /song\/(.*).html/;

  const matched = path.match(reg); // song/52195.html
  if (!matched) {
    return "";
  }

  // songShortId from url, e.g. 52195
  const songShortId = matched[1];

  return `https://play.zanmei.co/song/p/${songShortId}.mp3`;
}

// 获取音乐 HTML 页面内容
export async function FetchSongWebHtmlAnonymous(songWebUrl, settings) {
  const resp = await fetch(songWebUrl, {
    headers: {
      "User-Agent": settings.ua,
    },
  });
  return await resp.text();
}

// 从 HTML 页面中解析出歌曲名称
export function ParserSongName(songWebHtml) {
  const $ = cheerio.load(songWebHtml);
  const title = $("title").text();
  const name = title.split("-")[0].trim();
  return name;
}

// 从 HTML 页面中解析出歌曲 id
export function ParserSongId(songWebHtml) {
  const $ = cheerio.load(songWebHtml);

  // 获取 id 为 btn_play 的元素
  const btnPlayElement = $("#btn_play");

  // 获取 rel 属性值
  const relValue = btnPlayElement.attr("rel");

  // 5162d1f07d4c50078848a510
  return relValue;
}

// 获取音乐下载信息
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

export function GetLowMP3UrlFromMetaJson(downMeta) {
  if (!downMeta["ok"]) {
    return "";
  }
  return downMeta["play"]["url"];
}

export function GetHighMP3UrlFromMetaJson(downMeta) {
  if (!downMeta["ok"]) {
    return "";
  }
  // 如果没有高品质降级为普通品质
  if (!downMeta["down"]["status"]) {
    return downMeta["play"]["url"];
  }
  return downMeta["down"]["url"];
}
