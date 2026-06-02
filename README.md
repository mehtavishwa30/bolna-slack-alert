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

```
export BOLNA_API_KEY="your_bolna_api_key_here"
```

or saving it inside a `.env` file. Remember to add this file to your `.gitignore` file before you push any of your local code to GitHub.
 
## Setting up Slack

### 2.1 Create a Slack App

To create a new Slack app, go to `api.slack.com/apps` > `Create New App` > `From Scratch`.

Give your app an appropriate name such as Bolna Demo. To finish up, choose the Slack workspace you want to create the app in and hit `Create App`.

### 2.2 Set up your Slack Webhook URL

Once your app is created, navigate to `Features` > `Incoming Webhooks` in your app's left menu and turn the `Activate Incoming Webhooks` option "ON".

Now, scroll down and click "Add New Webhook to Workspace".
 
## 3 Building your Server

### 3.1 Initialise your project

### 3.2 Write your `server.js` file

## 4 Configuring the Webhook on Bolna

### 4.1 Installand run ngrok

### 4.2 Add the Webhook URL in agent analytics

## 5 Testing your Bolna<>Slack integration

### 5.1 Trigger a test call using the Bolna API

### 5.2 Check the webhook payload and the Slack alert

Voila! If you followed along till this point successfully, you just built a Slack integration using the Bolna voice AI API.

## Next steps:

- Preparing your GitHub project

## Additional resources


