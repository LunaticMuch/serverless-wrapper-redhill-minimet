# Redhill Aerodrome Minimet Weather Station Wrapper

This project is a single backend serverless function designed to wrap over Redhill Aerodrome Minimet Weather stations. The weather station is an appliance that publishes a webpage with weather information for the airport. Unfortunately, the webpage has a poor user interface and is not usable from mobile phones, which led me to develop an iOS app to address this issue.

However, the weather stations publish a JSON response over an insecure HTTP connection, streaming a significant amount of unnecessary data and using a long-lived JWT token. This creates difficulties for the app to function correctly, as iOS enforces strict security policies. To avoid modifying all iOS security settings, I decided to wrap the API call using a dedicated serverless function that can mitigate these problems.

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/examples/tree/main/solutions/node-hello-world&project-name=node-hello-world&repository-name=node-hello-world)

### Clone and Deploy

```bash
git clone https://github.com/vercel/examples/tree/main/solutions/node-hello-world
```

Install the Vercel CLI:

```bash
npm i -g vercel
```

Then run the app at the root of the repository:

```bash
vercel dev
```

## API Endpoint

The serverless function is located in [api/hello.ts](api/hello.ts). It handles incoming requests and returns a JSON response with the weather information.

## Example Request

To get the weather information, send a GET request to the deployed endpoint:

```bash
curl https://your-deployment-url.vercel.app/api/hello?name=YourName
```

## Example Response

```json
{
  "message": "Hello YourName!"
}
```