#!/usr/bin/env node

// 密钥从环境变量读取：bunx varlock run -- node <本脚本>
const SECRET = process.env.NEXT_REVALIDATE_SECRET
if (!SECRET) {
  console.error('缺少 NEXT_REVALIDATE_SECRET。用 bunx varlock run -- node <本脚本> 从 Infisical 注入')
  process.exit(1)
}

// 模拟Contentful webhook payload
const contentfulPayload = {
  metadata: {
    tags: []
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'your-space-id'
      }
    },
    id: 'test-entry-id',
    type: 'Entry',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    revision: 1,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'post' // 这里是内容类型ID
      }
    }
  },
  fields: {
    title: {
      'en-US': 'Test Blog Post'
    },
    slug: {
      'en-US': 'test-blog-post' // 这里是slug
    },
    date: {
      'en-US': '2024-01-01T00:00:00.000Z'
    }
  }
}

// 测试函数
async function testWebhook(baseUrl) {
  console.info(`🧪 Testing Contentful Webhook simulation`)
  console.info(`📤 URL: ${baseUrl}/api/revalidate`)
  console.info(`📋 Payload (Contentful format):`)
  console.info(JSON.stringify(contentfulPayload, null, 2))

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': SECRET
      },
      body: JSON.stringify(contentfulPayload)
    })

    const result = await response.json()

    console.info(`\n📥 Response Status: ${response.status}`)
    console.info(`📥 Response Body: ${JSON.stringify(result, null, 2)}`)

    if (response.status === 200) {
      console.info(`✅ Webhook test PASSED - API correctly handled Contentful payload!`)
    } else {
      console.info(`❌ Webhook test FAILED`)
    }
  } catch (error) {
    console.info(`❌ Test FAILED with error: ${error.message}`)
  }
}

// 运行测试
const baseUrl = process.argv[2] || 'https://pennlam.com'

testWebhook(baseUrl).catch(console.error)
