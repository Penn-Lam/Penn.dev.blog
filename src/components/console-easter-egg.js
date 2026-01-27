'use client'

import { useEffect } from 'react'

/**
 * [OUTPUT]: 在控制台输出彩蛋信息（无渲染）
 * [POS]: 组件挂载时执行的副作用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==========================================================================
// 控制台彩蛋策略:
// 1. 首次访问显示欢迎信息
// 2. 开发者工具检测
// 3. 隐藏的彩蛋命令
// ==========================================================================

// ASCII Art 标题
const ASCII_TITLE = `
  ██████╗  ███████╗ ███╗   ██╗ ███╗   ██╗
  ██╔══██╗ ██╔════╝ ████╗  ██║ ████╗  ██║
  ██████╔╝ █████╗   ██╔██╗ ██║ ██╔██╗ ██║
  ██╔═══╝  ██╔══╝   ██║╚██╗██║ ██║╚██╗██║
  ██║      ███████╗ ██║ ╚████║ ██║ ╚████║
  ╚═╝      ╚══════╝ ╚═╝  ╚═══╝ ╚═╝  ╚═══╝
`

// 随机技术冷笑话
const techJokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  "There are only 10 types of people: those who understand binary and those who don't.",
  'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?"',
  'Why did the developer go broke? Because they used up all their cache.',
  "I told my computer I needed a break, now it won't stop sending me vacation ads.",
  "What's a programmer's favorite hangout place? Foo Bar.",
  "Why do Java developers wear glasses? Because they can't C#.",
  "The code is working. I don't know why. — Every developer ever",
  '99 little bugs in the code, take one down, patch it around... 127 little bugs in the code.',
  'It works on my machine. — Famous last words'
]

// 隐藏命令映射
const hiddenCommands = {
  help: `Available commands:
  help     - Show this message
  coffee   - Buy me a coffee ☕
  hire     - Check if we're hiring
  source   - View source code`,
  coffee: '☕ Thanks for the virtual coffee! Send real one to linpengpeng@gmail.com',
  hire: "We're always looking for talented developers. Email us at hiring@ penn.dev",
  source: 'This site is open source! Check the GitHub repo for all the code.',
  secret: '🎉 You found the secret! Try the Konami Code: ↑↑↓↓←→←→BA',
  whois: 'Penn Lam - AI Agent Developer, Technical Founder, Popping Dancer 🤠',
  ping: 'Pong! 🏓',
  clear: "Console cleared (just kidding, that's on you)",
  ls: 'assets/  components/  lib/  pages/  styles/',
  cat: 'Meow? 🐱',
  sudo: 'nice try 😅',
  rm: "rm -rf /? I can't let you do that, Dave.",
  date: new Date().toString()
}

function getRandomJoke() {
  return techJokes[Math.floor(Math.random() * techJokes.length)]
}

export function ConsoleEasterEgg() {
  useEffect(() => {
    // 防止重复执行
    if (window.__CONSOLE_EASTER_EGG_LOADED__) return
    window.__CONSOLE_EASTER_EGG_LOADED__ = true

    // 检测是否是开发者
    const isDevToolsOpen =
      /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) === false

    // 欢迎信息
    console.info('%c' + ASCII_TITLE, 'font-family: monospace; font-size: 10px; line-height: 1.2; color: #6366f1;')
    console.info('%c✨ Welcome to Penn.dev!', 'font-size: 14px; font-weight: bold; color: #6366f1;')
    console.info('%c📝 A technical blog by Penn Lam - AI Agent Developer', 'font-size: 12px; color: #64748b;')
    console.info('')

    if (isDevToolsOpen) {
      console.info('%c👀 Developer tools detected! You must be a developer too.', 'font-size: 12px; color: #22c55e;')
      console.info('%c💡 Try typing these commands in the console:', 'font-size: 12px; color: #64748b;')
      console.info('  • help    • coffee  • whois  • source')
      console.info('  • secret  • ping    • ls     • date')
      console.info('')
    }

    // 每日笑话
    console.info('%c😄 Developer joke of the moment:', 'font-size: 12px; color: #f59e0b;')
    console.info('%c' + getRandomJoke(), 'font-size: 11px; font-style: italic; color: #64748b;')
    console.info('')

    // 隐藏命令监听
    const originalInfo = console.info

    // 拦截命令
    const handleCommand = (command) => {
      const cmd = command.toLowerCase().trim()
      if (hiddenCommands[cmd]) {
        originalInfo(`%c${hiddenCommands[cmd]}`, 'font-size: 12px; color: #22c55e; font-family: monospace;')
        return true
      }
      return false
    }

    // 监听全局输入
    window.executeCommand = (cmd) => handleCommand(cmd)

    console.info('%c🔒 Type a command above or use executeCommand("command")', 'font-size: 11px; color: #94a3b8;')
  }, [])

  return null
}

/**
 * 增强的成功提示消息
 */
export const DELIGHTFUL_MESSAGES = {
  // 提交书签成功
  bookmarkSubmit: [
    'Bookmark saved! Your knowledge graph grows.',
    "Nice catch! That's a great find.",
    'Added to your collection. Well done!',
    'Saved for later. Your future self will thank you.',
    'Indexed and ready for retrieval.',
    'Another gem for your digital garden.'
  ],

  // 发布 musing 成功
  musingPublish: [
    'Your musing is now live!',
    'Voice heard! Your thoughts are now public.',
    'Another great idea shared with the world.',
    'Fresh content just dropped.',
    'Your musing has been published!',
    'Added to the stream of consciousness.'
  ],

  // 加载成功
  loadSuccess: [
    'All systems go!',
    "Data loaded. What's next?",
    'Ready when you are.',
    'Target acquired.',
    'Content unpacked successfully.'
  ],

  // 随机获取一条消息
  getRandom: (category) => {
    const messages = DELIGHTFUL_MESSAGES[category]
    return messages ? messages[Math.floor(Math.random() * messages.length)] : ''
  }
}

/**
 * 获取随机消息的辅助函数
 */
export function getDelightfulMessage(category) {
  return DELIGHTFUL_MESSAGES.getRandom(category)
}
