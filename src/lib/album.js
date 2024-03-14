import * as cheerio from "cheerio";

// 获取音乐 HTML 页面内容
export async function FetchAlbumWebHtmlAnonymous(albumWebUrl, settings) {
  const resp = await fetch(albumWebUrl, {
    headers: {
      "User-Agent": settings.ua,
    },
  });
  return await resp.text();
}

// 从 HTML 页面中解析出歌曲列表
export function ParserSongWebUrlList(albumWebHtml) {
  // 使用 cheerio 加载网页内容
  const $ = cheerio.load(albumWebHtml);

  // 获取 <div class="songs mt5"> 内的 <table> 下所有 <tr> 元素
  const trElements = $(".songs.mt5 table tr");

  // 遍历并输出每个<tr>元素
  let list = [];
  trElements.each((i, element) => {
    let name = $(element).find("td.name").text().trim();
    // console.log(`TD.name 元素 ${i}:`, name);

    let href = $(element).find("td.name a").attr("href").trim();
    //   console.log(`TD.name href 元素 ${i}:`, href);

    let item = {
      name: name,
      path: "https://www.zanmei.ai" + href,
    };
    list.push(item);
  });
  return list;
}
