/**
 * [INPUT]: 无外部依赖；接收 Meting 接口返回的歌单曲目数组（每条有 title、author、url、pic）
 * [OUTPUT]: 对外提供 mapPlaylistToRecords（唱片架条目）、mapPlaylistToAudios（唱机播放器的曲目）
 * [POS]: lib/ 的网易云歌单整形，纯函数，单独成文件以便不经网络做单元测试。lib/netease.js 调用它。
 *        一首歌变成唱片架上的一张唱片。唱片记下自己在歌单里的位置（playlistIndex），拖到唱机上时唱机就跳到歌单的那一首。
 *        两个函数都不删、不重排曲目：playlistIndex 是两边共用的下标，任何一边漏掉一首都会让唱片对不上歌。
 *        音频地址不用 Meting 接口给的那个：它由 Meting 的服务器在海外匿名代取，只在中国大陆有版权的歌全部 404。
 *        改成网易云的外链地址，由访客自己的浏览器去取，能不能播取决于访客所在地区。会员专享和已下架的歌两种地址都取不到。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// 曲目的网易云 id 藏在播放地址的 id 参数里
function trackIdOf(track) {
  try {
    return new URL(track.url).searchParams.get('id')
  } catch {
    return null
  }
}

/**
 * @param {Array<object>} tracks Meting 接口的歌单回包，顺序即歌单顺序
 * @param {number} limit 取前多少首
 * @returns {Array<object>} 陈列条目，形状见 components/shelves/CLAUDE.md
 */
export function mapPlaylistToRecords(tracks, limit) {
  if (!Array.isArray(tracks)) return []

  return tracks
    .slice(0, limit)
    .map((track, playlistIndex) => ({ track, playlistIndex, trackId: trackIdOf(track) }))
    .filter(({ track, trackId }) => trackId && track.title)
    .map(({ track, playlistIndex, trackId }) => ({
      id: `netease-${trackId}`,
      title: track.title,
      subtitle: track.author ?? '',
      cover: track.pic || null,
      fallbackCover: null,
      href: `https://music.163.com/#/song?id=${trackId}`,
      audio: { playlistIndex }
    }))
}

const outerAudioUrl = (trackId) => `https://music.163.com/song/media/outer/url?id=${trackId}.mp3`

/**
 * @param {Array<object>} tracks Meting 接口的歌单回包
 * @returns {Array<object>} APlayer 认的曲目，长度和顺序与入参一致
 */
export function mapPlaylistToAudios(tracks) {
  if (!Array.isArray(tracks)) return []

  return tracks.map((track) => {
    const trackId = trackIdOf(track)

    return {
      name: track.title ?? '',
      artist: track.author ?? '',
      url: trackId ? outerAudioUrl(trackId) : track.url,
      cover: track.pic || null
    }
  })
}
