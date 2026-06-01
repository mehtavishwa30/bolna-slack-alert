import express from "express";

const app = express();
app.use(express.json({ type: "*/*" })); // parse incoming JSON bodies

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

// slack alert function
async function sendSlackAlert(callId, agentId, duration, transcript) {
  // truncate transcript due to Slack's 3000-char text limit
  const MAX = 2000;
  const body = transcript.length > MAX
    ? transcript.slice(0, MAX) + "\n... [transcript truncated]"
    : transcript;

  // alert payload sent by Bolna to Slack channel
  const payload = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "☎️ Bolna Call Ended" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Call ID:*\n\`${callId}\`` },
          { type: "mrkdwn", text: `*Agent ID:*\n\`${agentId}\`` },
          { type: "mrkdwn", text: `*Duration:*\n${duration} seconds` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: `*Transcript:*\n\`\`\`${body}\`\`\`` },
      },
      { type: "divider" },
    ],
  };

  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Slack error ${res.status}: ${text}`);
  } else {
    console.log("Slack alert sent successfully.");
  }
}

// webhook route
app.post("/webhook", async (req, res) => {
  const payload = req.body;

  res.status(200).json({ status: "received" });

  console.log("Received Bolna webhook:", JSON.stringify(payload, null, 2));

  // send alert only for completed calls
  if (payload.status !== "completed") return;

  const callId    = payload.id        ?? "N/A";
  const agentId   = payload.agent_id  ?? "N/A";
  const transcript = payload.transcript ?? "No transcript available.";

  // duration lives inside telephony_data (string of seconds)
  // fall back to conversation_duration (float) if telephony_data is absent
  const duration =
    payload.telephony_data?.duration
    ?? String(payload.conversation_duration ?? "N/A");

  try {
    await sendSlackAlert(callId, agentId, duration, transcript);
  } catch (err) {
    console.error("Failed to send Slack alert:", err);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});