import * as cheerio from "cheerio";

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
    let href = $(element).find("td.name a").attr("href").trim();
    let rel = $(element).find("td.btn a.btn_play").attr("rel").trim();

    let item = {
      name: name,
      rel: rel,
      path: "https://www.zanmei.ai" + href,
    };
    list.push(item);
  });
  return list;
}
