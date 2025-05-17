import { verifyWebhook } from '@clerk/nextjs/webhooks'

import { NextRequest } from 'next/server'

import { db } from '@/db'
import { Users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    if (eventType === 'user.created') {
      const { id, first_name, last_name, email_addresses, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;

      const existingUser = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email));

      if (existingUser.length === 0) {
        try {
          await db.insert(Users).values({
            clerk_user_id: id.toString(),
            name: `${first_name} ${last_name}`,
            avatar_url: image_url,
            bio: "",
            email
          });

          console.log("✅ Usuario guardado correctamente.");
        } catch (error) {
          console.error("🚨 Error al guardar el usuario:", error);
        }
      } else {
        try {
          await db
            .update(Users)
            .set({
              clerk_user_id: id.toString(),
              name: `${first_name} ${last_name}`,
              avatar_url: image_url,
              bio: ""
            })
            .where(eq(Users.email, email));

          console.log("🔄 Usuario existente actualizado correctamente.");
        } catch (error) {
          console.error("🚨 Error al actualizar el usuario existente:", error);
        }
      }
    }


    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}