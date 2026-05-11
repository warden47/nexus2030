import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: process.env.FIREBASE_ADMIN_SDK
      ? cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
      : undefined,
  });
}
const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { getAuth } = await import('firebase-admin/auth');
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const { contentId } = await request.json();
    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
    }

    const partyRef = await db.collection('watchParties').add({
      contentId,
      hostId: userId,
      members: [userId],
      currentTimestamp: 0,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ partyId: partyRef.id });
  } catch (error: any) {
    console.error('Watch party create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}