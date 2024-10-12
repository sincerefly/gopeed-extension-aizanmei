import * as cheerio from "cheerio";

// 从 HTML 页面中解析出歌曲列表
export function ParserVideoWebUrlList(videoWebHtml) {

  // 使用 cheerio 加载网页内容
  const $ = cheerio.load(videoWebHtml);

  const title = $("title").text().trim();

  let videoName = title.split("-")[0].trim();
//   throw new MessageError(videoName);

  let downUrl = getHighestQualitySource(videoWebHtml);
  let downName = getFileNameFromUrl(downUrl);

  // 遍历并输出每个<tr>元素
  let list = [];
  let item = {
    name: downName,
    req: {
      url: downUrl,
    },
  };
  list.push(item);

  return [videoName, list];
}


// 封装解析函数
function getHighestQualitySource(html) {
    const $ = cheerio.load(html);

    // 查找 id="plyrplayer" 元素下的所有 source 标签
    const sources = $('#plyrplayer source');

    // 初始化最高质量的 source 和 size
    let highestQualitySource = null;
    let highestQualitySize = 0;

    // 遍历所有的 source 标签
    sources.each((index, element) => {
        const src = $(element).attr('src');
        const size = parseInt($(element).attr('size'), 10);

        // 如果当前 size 大于最高质量的 size，则更新最高质量的 source 和 size
        if (size > highestQualitySize) {
            highestQualitySource = src;
            highestQualitySize = size;
        }
    });

    // 返回最高质量的 source 链接
    return highestQualitySource;
}

// 从下载链接中获取文件名
function getFileNameFromUrl(url) {
    // 使用 URL 对象来解析 URL
    const urlObj = new URL(url);
    // 获取路径部分
    const pathname = urlObj.pathname;
    // 使用 split 方法将路径按斜杠分割成数组
    const pathParts = pathname.split('/');
    // 取数组的最后一个元素，即文件名
    let fileName = pathParts[pathParts.length - 1];

    // 检查文件名是否包含有效的 URI 编码字符
    // fileName = decodeURIComponent(fileName);
    if (/%[0-9A-Fa-f]{2}/.test(fileName)) {
        try {
            // 解码文件名
            fileName = decodeURIComponent(fileName);
        } catch (error) {
            console.error('Error decoding file name:', error);
        }
    }
    return fileName;
}