interface Env {
  whatflix_waitlist: D1Database;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: { email?: unknown };

  try {
    payload = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";

  if (!emailPattern.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    await context.env.whatflix_waitlist.prepare(
      `INSERT INTO waitlist_emails (email)
       VALUES (?)
       ON CONFLICT(email) DO NOTHING`
    )
      .bind(email)
      .run();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to save email", error);
    return Response.json({ error: "Unable to save email right now." }, { status: 500 });
  }
};
