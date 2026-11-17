import { expect, test } from 'bun:test'

import { mapPlaylistToAudios, mapPlaylistToRecords } from './netease-records'

const track = (id, title, author = 'Someone') => ({
  title,
  author,
  url: `https://api.example.com/meting/api?server=netease&type=url&id=${id}&auth=x`,
  pic: `https://api.example.com/meting/api?server=netease&type=pic&id=9${id}&auth=y`
})

test('turns the first tracks of the playlist into records that remember their playlist position', () => {
  const records = mapPlaylistToRecords([track(11, 'First', 'A'), track(22, 'Second', 'B'), track(33, 'Third')], 2)

  expect(records).toEqual([
    {
      id: 'netease-11',
      title: 'First',
      subtitle: 'A',
      cover: 'https://api.example.com/meting/api?server=netease&type=pic&id=911&auth=y',
      fallbackCover: null,
      href: 'https://music.163.com/#/song?id=11',
      audio: { playlistIndex: 0 }
    },
    expect.objectContaining({ id: 'netease-22', audio: { playlistIndex: 1 } })
  ])
})

test('keeps the playlist position of later tracks when an earlier one is unusable', () => {
  const records = mapPlaylistToRecords([{ title: 'No url', url: 'not a url' }, track(5, 'Kept')], 10)

  expect(records.map((record) => [record.id, record.audio.playlistIndex])).toEqual([['netease-5', 1]])
})

test('returns an empty list for a payload that is not a track list', () => {
  expect(mapPlaylistToRecords(null, 10)).toEqual([])
  expect(mapPlaylistToRecords({ error: 'blocked' }, 10)).toEqual([])
})

test('points every track at the NetEase outer link and keeps the playlist order and length', () => {
  const audios = mapPlaylistToAudios([
    track(11, 'First', 'A'),
    { title: 'No url', url: 'not a url' },
    track(33, 'Third')
  ])

  expect(audios.map((audio) => audio.url)).toEqual([
    'https://music.163.com/song/media/outer/url?id=11.mp3',
    'not a url',
    'https://music.163.com/song/media/outer/url?id=33.mp3'
  ])
  expect(audios[0]).toEqual(expect.objectContaining({ name: 'First', artist: 'A' }))
})
