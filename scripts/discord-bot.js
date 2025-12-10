/**
 * Discord Bot for handling application status updates via interactive buttons
 * 
 * This bot listens for button interactions and updates application statuses
 * 
 * Setup:
 * 1. Create a Discord Bot at https://discord.com/developers/applications
 * 2. Get the Bot Token
 * 3. Invite the bot to your server with "applications.commands" and "bot" scopes
 * 4. Set DISCORD_BOT_TOKEN in your .env.local file
 * 5. Set NEXT_PUBLIC_API_URL to your API base URL (e.g., http://localhost:3000 or https://yourdomain.com)
 * 6. Run: node scripts/discord-bot.js
 */

const fs = require('fs')
const path = require('path')

// Try to load .env.local file
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath })
} else {
  // Try .env file as fallback
  const envPathFallback = path.join(__dirname, '..', '.env')
  if (fs.existsSync(envPathFallback)) {
    require('dotenv').config({ path: envPathFallback })
  } else {
    // Try default dotenv behavior
    require('dotenv').config()
  }
}

const { Client, GatewayIntentBits, Events, InteractionType, ButtonStyle, ComponentType } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
})

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

// Better error handling for missing token
if (!BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set!')
  console.error('')
  console.error('Please follow these steps:')
  console.error('1. Create a Discord Bot at https://discord.com/developers/applications')
  console.error('2. Go to "Bot" tab and copy the token')
  console.error('3. Create or edit .env.local file in the project root')
  console.error('4. Add the following line:')
  console.error('   DISCORD_BOT_TOKEN=your_bot_token_here')
  console.error('')
  console.error('Example .env.local file:')
  console.error('   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...')
  console.error('   DISCORD_BOT_TOKEN=your_bot_token_here')
  console.error('   NEXT_PUBLIC_API_URL=http://localhost:3000')
  console.error('')
  process.exit(1)
}

// Validate token format (Discord bot tokens start with specific patterns)
if (!BOT_TOKEN.match(/^[MN][A-Za-z\d]{23}\.[A-Za-z\d-_]{6}\.[A-Za-z\d-_]{27}$/)) {
  console.error('⚠️  WARNING: Discord Bot Token format looks invalid!')
  console.error('Bot tokens should look like: MTAx...')
  console.error('Please verify your token is correct.')
  console.error('')
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Discord Bot is ready! Logged in as ${readyClient.user.tag}`)
})

// Handle button interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.type !== InteractionType.MessageComponent) {
    return
  }

  if (interaction.componentType !== ComponentType.Button) {
    return
  }

  // Check if this is an application status button
  const customId = interaction.customId
  if (!customId.startsWith('app_status_')) {
    return
  }

  // Parse the custom_id: app_status_{applicationId}_{status}
  const parts = customId.split('_')
  if (parts.length !== 4) {
    return
  }

  const applicationId = parts[2]
  const newStatus = parts[3] // pending, approved, or rejected

  // Defer the reply (Discord requires a response within 3 seconds)
  await interaction.deferReply({ ephemeral: true })

  try {
    // Call the API to update the application status
    const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        messageId: interaction.message.id,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update application status')
    }

    const data = await response.json()

    // Update the message to reflect the new status
    // The API should handle updating the Discord message via webhook
    await interaction.editReply({
      content: `✅ Application status updated to **${newStatus}**`,
      ephemeral: true,
    })

    // Also acknowledge the interaction on the original message
    // This will disable the button that was clicked
    try {
      await interaction.message.edit({
        components: interaction.message.components.map((row) => ({
          ...row,
          components: row.components.map((component) => {
            if (component.customId === customId) {
              return {
                ...component,
                disabled: true,
              }
            }
            // Disable other buttons if status is approved or rejected
            if ((newStatus === 'approved' || newStatus === 'rejected') && 
                component.customId !== customId) {
              return {
                ...component,
                disabled: true,
              }
            }
            return component
          }),
        })),
      })
    } catch (error) {
      console.error('Failed to update message components:', error)
    }
  } catch (error) {
    console.error('Error updating application status:', error)
    await interaction.editReply({
      content: `❌ Failed to update application status: ${error.message}`,
      ephemeral: true,
    })
  }
})

// Login to Discord
console.log('🔄 Attempting to login to Discord...')
client.login(BOT_TOKEN).catch((error) => {
  console.error('')
  console.error('❌ Failed to login to Discord!')
  console.error('')
  if (error.code === 'TokenInvalid') {
    console.error('The Discord Bot Token is invalid.')
    console.error('')
    console.error('Possible reasons:')
    console.error('1. The token is incorrect or has been reset')
    console.error('2. The token has extra spaces or newlines')
    console.error('3. The token was copied incorrectly')
    console.error('')
    console.error('How to fix:')
    console.error('1. Go to https://discord.com/developers/applications')
    console.error('2. Select your application')
    console.error('3. Go to "Bot" tab')
    console.error('4. Click "Reset Token" and copy the new token')
    console.error('5. Update .env.local with the new token (no spaces, no quotes)')
    console.error('')
  } else {
    console.error('Error details:', error.message)
    console.error('')
  }
  process.exit(1)
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Discord Bot...')
  client.destroy()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Discord Bot...')
  client.destroy()
  process.exit(0)
})

