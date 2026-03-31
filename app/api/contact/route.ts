import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY!
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

export async function POST(req: Request) {
  try {
    const { name, email, message, website, "cf-turnstile-response": turnstileToken } = await req.json()

    /* ── Honeypot check ──
       Hidden field bots auto-fill. Return 200 so bot thinks it worked. */
    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    /* ── Turnstile server-side verification ── */
    if (!turnstileToken) {
      return NextResponse.json({ error: "Verification required." }, { status: 400 })
    }

    const turnstileRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    })

    const turnstileData = await turnstileRes.json()

    if (!turnstileData.success) {
      return NextResponse.json({ error: "Verification failed." }, { status: 403 })
    }

    /* ── Send email via Resend ── */
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "bereket.lemma10@gmail.com",
        replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <div style="font-family: monospace; padding: 20px;">
          <h2>New contact from bereketlemma.com</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}