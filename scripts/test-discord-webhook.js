/**
 * Discord Webhook テストスクリプト
 * 
 * このスクリプトでDiscord Webhookが正しく動作するかテストできます
 * 
 * 使い方:
 * 1. .env.localにDISCORD_WEBHOOK_URLを設定
 * 2. node scripts/test-discord-webhook.js
 */

require('dotenv').config({ path: '.env.local' })

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

if (!WEBHOOK_URL) {
  console.error('❌ DISCORD_WEBHOOK_URLが設定されていません')
  console.error('')
  console.error('.env.localファイルに以下を追加してください:')
  console.error('DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN')
  process.exit(1)
}

if (WEBHOOK_URL.includes('YOUR_WEBHOOK_ID') || WEBHOOK_URL.includes('YOUR_WEBHOOK_TOKEN')) {
  console.error('❌ DISCORD_WEBHOOK_URLがプレースホルダーのままです')
  console.error('')
  console.error('実際のDiscord Webhook URLを設定してください')
  console.error('')
  console.error('Discord Webhook URLの取得方法:')
  console.error('1. Discordサーバーを開く')
  console.error('2. 通知を送りたいチャンネルを開く')
  console.error('3. チャンネル設定（⚙️）→「連携サービス」→「Webhook」')
  console.error('4. 「新しいWebhook」をクリック')
  console.error('5. Webhook名を設定（例: "MXVA Application Bot"）')
  console.error('6. 「Webhook URLをコピー」をクリック')
  console.error('7. .env.localのDISCORD_WEBHOOK_URLに貼り付け')
  process.exit(1)
}

console.log('🔄 Discord Webhookをテストしています...')
console.log('')

const testPayload = {
  content: '🧪 **Discord Webhook テスト**',
  embeds: [
    {
      title: '✅ テスト成功',
      description: 'このメッセージが表示されれば、Discord Webhookは正常に動作しています！',
      color: 0x00ff00, // Green
      fields: [
        {
          name: '📝 テスト日時',
          value: new Date().toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tokyo',
          }),
          inline: false,
        },
      ],
      footer: {
        text: 'MXVA Application System - Test',
      },
      timestamp: new Date().toISOString(),
    },
  ],
}

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload),
})
  .then(async (response) => {
    const responseText = await response.text()
    
    console.log('📊 レスポンス情報:')
    console.log('  HTTPステータス:', response.status, response.statusText)
    console.log('  レスポンス長:', responseText.length, '文字')
    console.log('')
    
    if (!response.ok) {
      console.error('❌ Discord Webhook送信に失敗しました')
      console.error('')
      console.error('HTTPステータス:', response.status, response.statusText)
      console.error('レスポンス内容:', responseText || '(空)')
      console.error('')
      
      if (response.status === 404) {
        console.error('💡 考えられる原因:')
        console.error('  - Webhook URLが間違っている')
        console.error('  - Webhookが削除されている')
        console.error('  - 新しいWebhookを作成してください')
      } else if (response.status === 401) {
        console.error('💡 考えられる原因:')
        console.error('  - Webhook URLが無効')
        console.error('  - Webhookトークンが間違っている')
        console.error('  - 新しいWebhookを作成してください')
      } else {
        console.error('💡 考えられる原因:')
        console.error('  - Webhook URLが間違っている')
        console.error('  - Webhookが削除されている')
        console.error('  - Webhookの権限が不足している')
        console.error('  - Discordサーバーに問題がある')
      }
      console.error('')
      console.error('🔧 解決方法:')
      console.error('  1. Discordで新しいWebhookを作成')
      console.error('  2. 新しいWebhook URLをコピー')
      console.error('  3. .env.localのDISCORD_WEBHOOK_URLを更新')
      process.exit(1)
    }

    // Try to parse JSON response
    let data = null
    try {
      if (responseText) {
        data = JSON.parse(responseText)
      }
    } catch (parseError) {
      // If response is not JSON but status is OK, that's fine for Discord webhooks
      if (response.status === 200 || response.status === 204) {
        console.log('✅ Discord Webhookテスト成功！')
        console.log('')
        console.log('Discordチャンネルを確認してください。')
        console.log('テストメッセージが表示されていれば、設定は正しく動作しています。')
        console.log('')
        console.log('次のステップ:')
        console.log('1. ApplicationフォームからApplicationを送信')
        console.log('2. Discordチャンネルに通知が届くことを確認')
        process.exit(0)
      } else {
        throw parseError
      }
    }

    console.log('✅ Discord Webhookテスト成功！')
    console.log('')
    if (data) {
      console.log('レスポンス:', JSON.stringify(data, null, 2))
    }
    console.log('Discordチャンネルを確認してください。')
    console.log('テストメッセージが表示されていれば、設定は正しく動作しています。')
    console.log('')
    console.log('次のステップ:')
    console.log('1. ApplicationフォームからApplicationを送信')
    console.log('2. Discordチャンネルに通知が届くことを確認')
  })
  .catch((error) => {
    console.error('❌ エラーが発生しました:', error.message)
    console.error('')
    console.error('エラーの詳細:')
    console.error('  種類:', error.name)
    if (error.stack) {
      console.error('  スタック:', error.stack)
    }
    console.error('')
    console.error('💡 考えられる原因:')
    console.error('  1. インターネット接続を確認')
    console.error('  2. Webhook URLの形式を確認')
    console.error('  3. Webhook URLが正しく設定されているか確認')
    console.error('')
    console.error('🔧 確認事項:')
    console.error('  - .env.localファイルにDISCORD_WEBHOOK_URLが設定されているか')
    console.error('  - Webhook URLが https://discord.com/api/webhooks/ で始まっているか')
    console.error('  - Webhook URLにスペースや改行が含まれていないか')
    process.exit(1)
  })

