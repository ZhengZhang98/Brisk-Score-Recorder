# Brisk-Score-Recorder
The Alexa App that records the brisk score.
This is a hackathone project that Ross and I finished in one days. We use the Alexa-Skills-Kit sdk for NodeJs to build the voice assistant
 that help users to update and track their scores when they play Brisk(an Italian poker game).
 ## Code Structure and Description
 ### AVS
 The code under AVS folder is for the user to interact with Alexa.
 1. Run npm install, zip the AVS folder and uploaded to the AWS Lambda function for the new skill.
 2. Set certain wake up words and Intent based on the code in the developer console
 3. Run the simulation
 ### Server
 The code under Server folder is for the backend that contains the API calls to manipulate the data in Dynamodb
 1. Set the database
 2. Run npm install, npm start
 ## Demo
 [demo video](https://youtu.be/Dpg6oDQdcKg)
