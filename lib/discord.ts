/**
 * Discord Webhook utility functions
 */

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  timestamp?: string
  footer?: {
    text: string
  }
}

interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
  components?: Array<{
    type: number
    components: Array<{
      type: number
      style: number
      label: string
      custom_id: string
      emoji?: {
        name: string
      }
    }>
  }>
}

interface DiscordMessageUpdatePayload {
  content?: string
  embeds?: DiscordEmbed[]
  components?: Array<{
    type: number
    components: Array<{
      type: number
      style: number
      label: string
      custom_id: string
      emoji?: {
        name: string
      }
      disabled?: boolean
    }>
  }>
}

/**
 * Send a message to Discord via webhook
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Discord webhook error:', response.status, errorText)
      return { success: false }
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('Failed to send Discord webhook:', error)
    return { success: false }
  }
}

/**
 * Update a Discord message via webhook
 */
export async function updateDiscordWebhookMessage(
  webhookUrl: string,
  messageId: string,
  payload: DiscordMessageUpdatePayload
): Promise<boolean> {
  try {
    // Discord webhook message update endpoint
    const updateUrl = `${webhookUrl}/messages/${messageId}`
    
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Discord webhook update error:', response.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to update Discord webhook message:', error)
    return false
  }
}

/**
 * Get status color for Discord embed
 */
function getStatusColor(status: string): number {
  switch (status.toLowerCase()) {
    case 'approved':
      return 0x00ff00 // Green
    case 'rejected':
      return 0xff0000 // Red
    case 'pending':
    default:
      return 0x00bfff // Cyan
  }
}

/**
 * Get status emoji
 */
function getStatusEmoji(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return '✅'
    case 'rejected':
      return '❌'
    case 'pending':
    default:
      return '⏳'
  }
}

/**
 * Send an application notification to Discord
 */
export async function notifyNewApplication(application: {
  id: string
  infiniteFlightUsername: string
  email: string
  discordUsername: string
  ifcUsername: string
  grade: number
  status: string
  motivation: string
  createdAt: Date
}): Promise<{ success: boolean; messageId?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification.')
    return { success: false }
  }

  // Format date
  const date = new Date(application.createdAt)
  const formattedDate = date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  // IFC Username as link
  const ifcUsernameLink = `[${application.ifcUsername}](https://community.infiniteflight.com/u/${encodeURIComponent(application.ifcUsername)})`

  const embed: DiscordEmbed = {
    title: '🆕 New Application Received',
    description: `A new application has been submitted to MexicoVirtual.`,
    color: getStatusColor(application.status),
    fields: [
      {
        name: '📝 Application ID',
        value: application.id,
        inline: false,
      },
      {
        name: '👤 Infinite Flight Username',
        value: application.infiniteFlightUsername,
        inline: true,
      },
      {
        name: '📧 Email',
        value: application.email,
        inline: true,
      },
      {
        name: '💬 Discord Username',
        value: application.discordUsername,
        inline: true,
      },
      {
        name: '🎮 IFC Username',
        value: ifcUsernameLink,
        inline: true,
      },
      {
        name: '⭐ Grade',
        value: `Grade ${application.grade}`,
        inline: true,
      },
      {
        name: '💭 Motivation',
        value: application.motivation.length > 1024
          ? application.motivation.substring(0, 1021) + '...'
          : application.motivation,
        inline: false,
      },
      {
        name: '🕐 Submitted At',
        value: formattedDate,
        inline: false,
      },
      {
        name: '📊 Status',
        value: `${getStatusEmoji(application.status)} ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`,
        inline: false,
      },
    ],
    footer: {
      text: 'MexicoVirtual Application System',
    },
    timestamp: application.createdAt.toISOString(),
  }

  // Add interactive buttons (requires Discord Bot for actual interactivity)
  // For now, we'll add buttons that can be used with a Discord Bot
  const components = [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 2, // Secondary (gray)
          label: 'In Progress',
          custom_id: `app_status_${application.id}_pending`,
          emoji: {
            name: '⏳',
          },
        },
        {
          type: 2, // Button
          style: 3, // Success (green)
          label: 'Approve',
          custom_id: `app_status_${application.id}_approved`,
          emoji: {
            name: '✅',
          },
        },
        {
          type: 2, // Button
          style: 4, // Danger (red)
          label: 'Reject',
          custom_id: `app_status_${application.id}_rejected`,
          emoji: {
            name: '❌',
          },
        },
      ],
    },
  ]

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
    username: 'MexicoVirtual Application Bot',
    components,
  }

  return await sendDiscordWebhook(webhookUrl, payload)
}

/**
 * Update an application notification in Discord
 */
export async function updateApplicationNotification(
  application: {
    id: string
    infiniteFlightUsername: string
    email: string
    discordUsername: string
    ifcUsername: string
    grade: number
    status: string
    motivation: string
    createdAt: Date
  },
  messageId: string
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set. Skipping Discord notification update.')
    return false
  }

  // Format date
  const date = new Date(application.createdAt)
  const formattedDate = date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  // IFC Username as link
  const ifcUsernameLink = `[${application.ifcUsername}](https://community.infiniteflight.com/u/${encodeURIComponent(application.ifcUsername)})`

  const embed: DiscordEmbed = {
    title: '🆕 New Application Received',
    description: `A new application has been submitted to MexicoVirtual.`,
    color: getStatusColor(application.status),
    fields: [
      {
        name: '📝 Application ID',
        value: application.id,
        inline: false,
      },
      {
        name: '👤 Infinite Flight Username',
        value: application.infiniteFlightUsername,
        inline: true,
      },
      {
        name: '📧 Email',
        value: application.email,
        inline: true,
      },
      {
        name: '💬 Discord Username',
        value: application.discordUsername,
        inline: true,
      },
      {
        name: '🎮 IFC Username',
        value: ifcUsernameLink,
        inline: true,
      },
      {
        name: '⭐ Grade',
        value: `Grade ${application.grade}`,
        inline: true,
      },
      {
        name: '💭 Motivation',
        value: application.motivation.length > 1024
          ? application.motivation.substring(0, 1021) + '...'
          : application.motivation,
        inline: false,
      },
      {
        name: '🕐 Submitted At',
        value: formattedDate,
        inline: false,
      },
      {
        name: '📊 Status',
        value: `${getStatusEmoji(application.status)} ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`,
        inline: false,
      },
    ],
    footer: {
      text: 'MexicoVirtual Application System',
    },
    timestamp: application.createdAt.toISOString(),
  }

  // Update button states based on current status
  const components = [
    {
      type: 1, // Action Row
      components: [
        {
          type: 2, // Button
          style: 2, // Secondary (gray)
          label: 'In Progress',
          custom_id: `app_status_${application.id}_pending`,
          emoji: {
            name: '⏳',
          },
          disabled: application.status === 'pending',
        },
        {
          type: 2, // Button
          style: 3, // Success (green)
          label: 'Approve',
          custom_id: `app_status_${application.id}_approved`,
          emoji: {
            name: '✅',
          },
          disabled: application.status === 'approved',
        },
        {
          type: 2, // Button
          style: 4, // Danger (red)
          label: 'Reject',
          custom_id: `app_status_${application.id}_rejected`,
          emoji: {
            name: '❌',
          },
          disabled: application.status === 'rejected',
        },
      ],
    },
  ]

  const payload: DiscordMessageUpdatePayload = {
    embeds: [embed],
    components,
  }

  return await updateDiscordWebhookMessage(webhookUrl, messageId, payload)
}

