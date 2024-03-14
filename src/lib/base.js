import * as cheerio from "cheerio";

// 获取 HTML 页面内容
export async function FetchWebHtml(webUrl, settings) {
  const resp = await fetch(webUrl, {
    headers: {
      "User-Agent": settings.ua,
    },
  });
  return await resp.text();
}
