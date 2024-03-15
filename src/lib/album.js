import * as cheerio from "cheerio";

// 从 HTML 页面中解析出歌曲列表
export function ParserSongWebUrlList(albumWebHtml) {
  // 使用 cheerio 加载网页内容
  const $ = cheerio.load(albumWebHtml);

  const title = $("title").text().trim();

  const albumName = title.split("-")[0].trim();

  // throw new MessageError(albumName);

  // 获取 <div class="songs mt5"> 内的 <table> 下所有 <tr> 元素
  const trElements = $(".songs.mt5 table tr");

  // 遍历并输出每个<tr>元素
  let list = [];
  trElements.each((i, element) => {
    /*
    <tr class="on">
      <td class="chk">
        <input type="checkbox" name="songs_273067" value="63be850ecfcd05da5600a775" checked="checked"></td>
      <td class="i">10</td>
      <td class="name">
        <a href="/song/50692.html" title="查看歌曲资料">同负一轭</a>
        <span class="feat"></span>-
        <a href="/album/i-surrender.html" class="gray_link" title="查看该专辑">《我愿降服》</a>&nbsp;&nbsp;-&nbsp;&nbsp;
        <a href="/artist/joshua-band.html" class="gray_link" title="查看该音乐人主页">约书亚乐团</a></td>
      <td class="btn">
        <a class="btn_play" href="javascript:;" rel="63be850ecfcd05da5600a775" title="播放同负一轭"></a>
        <a class="btn_list" href="javascript:;" rel="63be850ecfcd05da5600a775" title="将同负一轭添加至当前播放列表"></a>
        <a class="btn_nodown" title="本歌曲暂不提供下载"></a>
        <a class="btn_send" href="javascript:zms.send('同负一轭', '63be850ecfcd05da5600a775');" title="将同负一轭送给朋友"></a>
        <a class="btn_box" href="javascript:zms.box('同负一轭', '63be850ecfcd05da5600a775');" title="将同负一轭添加至歌单"></a>
        <a class="btn_fav" href="javascript:zms.fav(13, '同负一轭', '63be850ecfcd05da5600a775');" title="收藏同负一轭"></a>
        <a class="btn_show" href="javascript:zms.show(13, '同负一轭', '63be850ecfcd05da5600a775');" title="推荐同负一轭"></a>
        <!--<span id="pb_@(info.Id)"><em></em> <a href="javascript:;" onclick="playmore('63be850ecfcd05da5600a775');" title="">添加标签</a> <a class="toplayer" href="/widget/isingle?sid=1769927189" title="">转贴到其它网站</a>  </span>-->
      </td>
    </tr>
    */
    let name = $(element).find("td.name a").first().text().trim();
    let href = $(element).find("td.name a").attr("href").trim();
    let rel = $(element).find("td.btn a.btn_play").attr("rel").trim();

    let item = {
      name: name,
      rel: rel,
      path: "https://www.zanmei.ai" + href,
    };
    list.push(item);
  });
  return [albumName, list];
}
