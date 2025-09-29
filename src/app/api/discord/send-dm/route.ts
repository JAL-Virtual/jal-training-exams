import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, trainerId, message } = body;
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }
    
    // Get Discord webhook URL from environment variables
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!discordWebhookUrl) {
      logger.warn('Discord webhook URL not configured');
      return NextResponse.json({
        success: false,
        error: 'Discord integration not configured'
      }, { status: 503 });
    }
    
    // Prepare Discord message payload
    const discordPayload = {
      content: `🎓 **Training System Notification**\n\n${message}\n\n*This is an automated message from the JAL Training System.*`,
      embeds: [
        {
          color: 0x0099FF, // Blue color
          timestamp: new Date().toISOString(),
          footer: {
            text: 'JAL Virtual Training System'
          }
        }
      ]
    };
    
    // Send message to Discord webhook
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });
    
    if (!discordResponse.ok) {
      throw new Error(`Discord API error: ${discordResponse.status}`);
    }
    
    logger.info('Discord message sent successfully', { 
      studentId, 
      trainerId, 
      message: message.substring(0, 50) + '...'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Discord notification sent successfully'
    });
  } catch (error) {
    logger.error('Error sending Discord message', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send Discord notification'
    }, { status: 500 });
  }
}
