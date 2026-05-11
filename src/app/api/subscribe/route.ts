import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import Stripe from 'stripe';

if (!getApps().length) {
  initializeApp({
    credential: process.env.FIREBASE_ADMIN_SDK
      ? cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
      : undefined,
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any, // compatible
});

const planMap: Record<string, string> = {
  plus: process.env.STRIPE_PLUS_PRICE_ID!,
  ultimate: process.env.STRIPE_ULTIMATE_PRICE_ID!,
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { getAuth } = await import('firebase-admin/auth');
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const { plan } = await request.json();
    if (!plan || !['plus', 'ultimate'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = planMap[plan];
    if (!priceId) throw new Error('Price ID not configured');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
      client_reference_id: userId,
      metadata: { userId },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}