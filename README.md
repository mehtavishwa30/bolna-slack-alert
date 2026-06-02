# Bolna Slack Alert Demo

This is a simple demo project that integrates a custom Bolna AI call agent with Slack to trigger Slack alerts as soon as a Bolna call ends.

I've been playing around with Bolna, a voice AI built with the focus on the vernacular languages of India. It provides developer APIs as well as a no-code platform that powers voice agents.

What does this mean for you? It allows developers to build conversational voice AI experiences for end-users. Whether you come from a no/low-code background or are a hard-core programmer, Bolna allows you to spin up multilingual voice agents within minutes. I've built this simple demo to walk you through how to achieve exactly that.

Let's build a mock AI interviewer and integrate to Slack for post-call alerts!

## Pre-requisites

- Node.js 18+
- A bolna account: https://platform.bolna.ai/
- A Slack workspace with permissions to create apps
- ngrok for testing the webhook

## Setting up your Bolna Agent

### 1.1 Building your Bolna Agent

On Bolna, you can use a pre-built template agent by importing it in the Bolna agent dashboard via agent ID. Alternatively, you can build your own agent either using the platform's auto-build agent feature or build yours from scratch.

For this demo, we'll be setting one up using the auto-build feature. Navigate to `` Bolna Dashboard > Agent Setup > Auto Build Agent `` and configure the agent by adding details like name, what you want it to achieve, sample transcript, etc.

Once you hit `Generate Agent`, you'll see your newly generated voice AI agent on the dashboard. You will see a lot of tabs that you can use to configure the agent further. At this stage, you don't need to dive deeper into any of these except the Agent ID at the top that you will need to access later in this guide.

### 1.2 Generating your Bolna API key

From the menu on the left, navigate to `Developers`, click on `Create a new API key`, and copy the API key.

You can store this key as a secret by running the bash command in your terminal as follows:

```bash
export BOLNA_API_KEY="your_bolna_api_key_here"
```

or saving it inside a `.env` file. Remember to add this file to your `.gitignore` file before you push any of your local code to GitHub.
 
## Setting up Slack

### 2.1 Create a Slack App

To create a new Slack app, go to `api.slack.com/apps` > `Create New App` > `From Scratch`.

Give your app an appropriate name such as Bolna Demo. To finish up, choose the Slack workspace you want to create the app in and hit `Create App`.

### 2.2 Set up your Slack Webhook URL

Once your app is created, navigate to `Features` > `Incoming Webhooks` in your app's left menu and turn the `Activate Incoming Webhooks` option "ON".

Go to your Slack workspace (the one that you picked to create your app) and create a new private channel for the alerts. You can call it `Bolna Alerts` or something similar.

Now, scroll down and click `Add New Webhook to Workspace`, pick your newly created channel for the alerts from the dropdown, and click `Allow`.

This should generate a new Webhook URL which you will need to connect your server to the Slack channel to send alerts. It should look something like:

```
https://hooks.slack.com/services/Sxxxxxxxx/Vxxxxxxxx/XXXXXXXXXXXXXXXXXXXXXXXX
```

This is another secret so let's add it as an environment variable just like we did with the Bolna API key.

Run the following in your current terminal:
```
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/S.../V.../..."
```
 
## 3 Building your Server

### 3.1 Initialise your project

Create a new folder for your project and name it appropriately, such as `bolna-demo`.

```bash
cd bolna-demo
git init
npm install express
```

Installing the express server for your project will generate the following:
- node-modules
- -ackage.json
- package-lock.json

### 3.2 Write your `server.js` file

Create a new file in your project directory and name it `server.js`

Edit the file such that the contents of the file are as follows:

```js
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
```

Finish up by running the server as follows:

`node server.js`

The terminal should respond with:

```
Server listening on http://localhost:3000
```

## 4 Configuring the Webhook on Bolna

### 4.1 Install and run ngrok

```bash
#macos
brew install ngrok

#linux
snap install ngrok
```

If this is your first time setting up ngrok for your project, you will have to sign up on ngrok and set up an authtoken inside your terminal to allow ngrok to run inside your project's directory.

Run ngrok using:

```
ngrok http 3000
```

The terminal should display the ngrok URL such as:

```
ngrok                                                                             (Ctrl+C to quit)
                                                                                                  
Request early access to new features: https://dashboard.ngrok.com/early-access                    
                                                                                                  
Session Status                online                                                              
Account                       abc (Plan: Free)                                           
Update                        update available (version 3.39.6, Ctrl-U to update)                 
Version                       3.39.5                                                              
Region                        xyz                                                          
Latency                       36ms                                                                
Web Interface                 http://XXX.0.0.X:X0X0     
Forwarding                    https://colourful-domestic-blob.ngrok-free.dev -> http://localhost:3000
```

### 4.2 Add the Webhook URL in agent analytics

Copy the ngrok URL and append a trailing `/webhook` to it. This becomes your Bolna webhook URL.

Go ahead and paste this URL under `Push all execution data to webhook` inside your Agent Analytics tab on your Bolna dashboard.

Remember to click on `Save Agent` on the right to save the changes.

## 5 Testing your Bolna<>Slack integration

### 5.1 Trigger a test call using the Bolna API

Awesome. We're pretty close to the finish line.

Let's test out our integration by triggering a Bolna API call. Run the following in a new terminal:

```bash
curl -X POST https://api.bolna.ai/call \
  -H "Authorization: Bearer $BOLNA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": $BOLNA_AGENT_ID,
    "recipient_phone_number": "+91XXXXXXXXXX"
  }'
```

Note that the above command will require a few key details to make a test call to your phone:
- Your Bolna API key
- Your Bolna agent ID
- And the phone number you choose to receive the test call from the Bolna voice AI agent

Note: You will need to first verify the phone number on the Bolna dashboard.

Once you run the above curl test, you should see a similar response on your terminal as follows:

```json
{"status":"queued","message":"done","execution_id":"0ca2767b-e8d0-4c08-a662-64093e4fea80","run_id":"0ca2767b-e8d0-4c08-a662-64093e4fea80"}%
```
Awesome! Now keep an eye on your phone for the test call. Once you receive the call, interact with the agent and hang up after a few minutes.

### 5.2 Check the webhook payload and the Slack alert

Wait for a few seconds after hanging up and quickly check whether the server and ngrok terminals are still running without any errors. If all looks good, you should recieve an alert on your Slack channel with the desired payload through the webhook. 

Voila! If you followed along till this point successfully, you just built a Slack integration using the Bolna voice AI API.

## Additional resources

- Bolna Platform: https://platform.bolna.ai
- Bolna API Docs: https://www.bolna.ai/docs
- Slack API Docs: https://docs.slack.dev

## To-dos

Currently, the demo only allows us to send alerts to Slack. It's a one-way integration. It would be awesome if we can upgrade our server code to listen to Slack messages such as "Call me!" to trigger a Bolna call. We can also deploy the code to Railway in order to avoid running the server manually every time we want to run the dmeo. For this we can add the following:
- Slack bot and Event Subscriptions
- Deploy to Railway

If you found this explainer useful, I'd appreciate it if you could star this repo. To keep an eye out for more, you can give me a follow on [X](https://x.com/VishwaMehta30).
