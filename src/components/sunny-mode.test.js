import { expect, test } from 'bun:test'

import { syncSunnyAudio } from './sunny-mode'

test('loads sunny-mode audio only after activation and resets it when disabled', () => {
  let createCount = 0

  const audio = {
    currentTime: 12,
    loop: false,
    volume: 1,
    pauseCount: 0,
    playCount: 0,
    pause() {
      this.pauseCount += 1
    },
    play() {
      this.playCount += 1

      return Promise.resolve()
    }
  }

  const createAudio = () => {
    createCount += 1

    return audio
  }

  expect(syncSunnyAudio(false, null, createAudio)).toBeNull()
  expect(createCount).toBe(0)

  expect(syncSunnyAudio(true, null, createAudio)).toBe(audio)
  expect(createCount).toBe(1)
  expect(audio).toMatchObject({ loop: true, volume: 0.4, playCount: 1 })

  expect(syncSunnyAudio(false, audio, createAudio)).toBe(audio)
  expect(audio).toMatchObject({ currentTime: 0, pauseCount: 1 })
})
