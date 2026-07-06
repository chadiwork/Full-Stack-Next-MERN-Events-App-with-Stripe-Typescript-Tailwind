import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import type { WebhookEvent } from '@clerk/nextjs/server'

import { createUser, updateUser, deleteUser } from '@/lib/actions/user.actions'

export async function POST(req: Request) {
  const payload = await req.text()
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Missing Svix headers', { status: 400 })
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new NextResponse('Webhook secret is not configured', { status: 500 })
  }

  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (error) {
    console.error('Webhook verification failed', error)
    return new NextResponse('Error verifying webhook', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data

    await createUser({
      clerkId: id,
      email: email_addresses[0]?.email_address || '',
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      photo: image_url || '',
    })
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, username, image_url } = evt.data

    await updateUser(id, {
      firstName: first_name || '',
      lastName: last_name || '',
      username: username || '',
      photo: image_url || '',
    })
  }

  if (eventType === 'user.deleted') {
    const clerkId = evt.data.id

    if (clerkId) {
      await deleteUser(clerkId)
    }
  }

  return NextResponse.json({ success: true, type: eventType })
}