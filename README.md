# Redhill Aerodrome Minimet Weather Station Wrapper

This project is a single backend serverless function designed to wrap over Redhill Aerodrome Minimet Weather stations. The weather station is an appliance that publishes a webpage with weather information for the airport. Unfortunately, the webpage has a poor user interface and is not usable from mobile phones, which led me to develop an iOS app to address this issue.

However, the weather stations publish a JSON response over an insecure HTTP connection, streaming a significant amount of unnecessary data and using a long-lived JWT token. This creates difficulties for the app to function correctly, as iOS enforces strict security policies. To avoid modifying all iOS security settings, I decided to wrap the API call using a dedicated serverless function that can mitigate these problems.
