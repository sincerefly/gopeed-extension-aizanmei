// test/calculator.test.js
import { expect } from 'chai';
import * as libsong from '../src/lib/song.js';

// 运行测试用例前先修改为自己的 Cookie
const cookie = "PHPSESSID=xxx; azm-user[id]=xxx; azm-user[name]=xxx; azm-user[hash]=xxx"

// 以下无需修改
const songWebUrl = "https://www.zanmei.ai/song/52195.html";
const songId = "65f0090e3c3f0b45810b53d3"
const songName = "如果"
const songWebPath = "/song/52195.html";
const songPlayUrl = "https://play.zanmei.co/song/p/52195.mp3"

const song2Id = "5162d1f07d4c50078848a510"
const song2Name = "脚步"
const song2LowUrl = "https://down.zanmei.ai/songlow/5162d1f07d4c50078848a510/4f6fd8967f01ef94.mp3"
const song2HighUrl = "https://down.zanmei.ai/songhigh/5162d1f07d4c50078848a510/f634948e364de292.mp3"

const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537"

describe('Song', function() {
  // 转换播放地址
  describe('generate paly url', function() {
    it('should return play url when web url', function() {
        const result = libsong.AnonymousWebUrlToPlayUrl(songWebUrl);
        expect(result).to.equal(songPlayUrl);
    });
    it('should return play url when web path', function() {
      const result =  libsong.AnonymousWebUrlToPlayUrl(songWebPath);
      expect(result).to.equal(songPlayUrl);
    });
  });

  // 获取网页内容
  let songWebHtml = ""
  describe('fetch web html content', function() {
    it('should return web html content', async function() {
        var settings = {"ua": ua}
        const result = await libsong.FetchSongWebHtmlAnonymous(songWebUrl, settings);
        expect(result).to.have.lengthOf.above(0);
        songWebHtml = result;
    });
  });

  // 解析歌曲名称
  describe('parser song name', function() {
    it('should return song name', async function() {
        const result = libsong.ParserSongName(songWebHtml);
        expect(result).to.equal(songName);
    });
  });

  // 解析歌曲id
  describe('parser song id', function() {
    it('should return song id', function() {
        const result = libsong.ParserSongId(songWebHtml);
        expect(result).to.equal(songId);
    });
  });

  // 获取网页内容
  let songDownMetaJson = {}
  describe('fetch down meta json', function() {

    // 获取 Meta 内容
    it('should return down meta json', async function() {
        var settings = {"ua": ua, "cookie": cookie}
        let result = await libsong.FetchSongDownMetaJson(songId, settings);
        expect(result["ok"]).equal(false);
        // console.log(JSON.stringify(result));
        // {"ok":false,"msg":"非常抱歉，本专辑歌曲仅提供低音质试听，不提供下载！"}

        result = await libsong.FetchSongDownMetaJson(song2Id, settings);
        expect(result["ok"]).equal(true);
        expect(result["song"]).equal(song2Name);
        expect(result["play"]["url"]).equal(song2LowUrl);
        expect(result["down"]["status"]).equal(true);
        expect(result["down"]["url"]).equal(song2HighUrl);
        // console.log(JSON.stringify(result));
        // {"ok":true,"msg":"","song":"脚步","album":"脚步","artist":"盛晓玫","play":{"rate":64,"length":"0 B","url":"https://down.zanmei.ai/songlow/5162d1f07d4c50078848a510/4f6fd8967f01ef94.mp3"},"down":{"status":true,"checked":"checked=\"checked\"","length":"0 B","url":"https://down.zanmei.ai/songhigh/5162d1f07d4c50078848a510/f634948e364de292.mp3"},"lossless":{"status":false}}

        songDownMetaJson = result;
    });

    // 解析普通品质下载地址
    it('should get down low url', async function() {
      let result = await libsong.GetLowMP3UrlFromMetaJson(songDownMetaJson);
      expect(result).equal(song2LowUrl);
    });

    // 解析高品质下载地址
    it('should get down high url', async function() {
      let result = await libsong.GetHighMP3UrlFromMetaJson(songDownMetaJson);
      expect(result).equal(song2HighUrl);
    });
  });
});
