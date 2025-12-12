import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // If no webhook secret, skip verification in development
  let evt: WebhookEvent;

  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400,
      });
    }
  } else {
    // Development mode - skip verification
    evt = payload as WebhookEvent;
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return new Response('No email found', { status: 400 });
    }

    try {
      // Create user in database
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
          role: 'CUSTOMER', // Default role
        },
      });

      console.log(`[Clerk Webhook] User created: ${email}`);
    } catch (error) {
      console.error('[Clerk Webhook] Error creating user:', error);
      // User might already exist
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses?.[0]?.email_address;

    try {
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email,
          firstName: first_name || null,
          lastName: last_name || null,
          imageUrl: image_url || null,
        },
      });

      console.log(`[Clerk Webhook] User updated: ${email}`);
    } catch (error) {
      console.error('[Clerk Webhook] Error updating user:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`[Clerk Webhook] User deleted: ${id}`);
    } catch (error) {
      console.error('[Clerk Webhook] Error deleting user:', error);
    }
  }

  return new Response('', { status: 200 });
}
