import { NextResponse } from 'next/server';
import { LoopsClient } from 'loops';

// Initialise le client si la clé existe
const loops = process.env.LOOPS_API_KEY ? new LoopsClient(process.env.LOOPS_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!loops) {
      // Mock result if API key is missing
      return NextResponse.json({ success: true, mocked: true });
    }

    const res = await loops.createContact(email, {
      source: 'Website Newsletter',
    });

    return NextResponse.json({ success: true, data: res });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
