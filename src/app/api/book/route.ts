import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    
    if (WEBHOOK_URL) {
      // Send data to the Google Apps Script Webhook
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to forward to Google Sheets');
      }
    } else {
      console.warn("GOOGLE_SHEETS_WEBHOOK_URL is not set. Lead captured locally for testing:");
      console.log(JSON.stringify(data, null, 2));
    }

    return NextResponse.json({ success: true, message: 'Booking confirmed' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
