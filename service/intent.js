'use strict';
const uuid = require("uuid");
const debug = require('debug')('botkit:intent');

module.exports = class IntentService {
  static detectTextIntent(queries, resolve) {
    // [START dialogflow_detect_intent_text]
    // Imports the Dialogflow library
    const dialogflow = require('dialogflow');
    // Instantiates a session client
    const sessionClient = new dialogflow.SessionsClient();
    const projectId = process.env.project_id;
    const sessionId = uuid();
    const languageCode = process.env.languageCode || "ja";
  
    //projectId, sessionId, queries, languageCode
    async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
      // The path to identify the agent that owns the created intent.
      const sessionPath = sessionClient.sessionPath(
        projectId,
        sessionId
      );
  
      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: languageCode,
          },
        },
      };
  
      if (contexts && contexts.length > 0) {
        request.queryParams = {
          contexts: contexts,
        };
      }
  
      const responses = await sessionClient.detectIntent(request);
      return responses[0];
    }
  
    async function executeQueries(projectId, sessionId, queries, languageCode) {
      // Keeping the context across queries let's us simulate an ongoing conversation with the bot
      let context;
      let intentResponse;
      for (const query of queries) {
        try {
          debug(`Sending query Text: ${query}`);
          intentResponse = await detectIntent(
            projectId,
            sessionId,
            query,
            context,
            languageCode
          );
          debug('Detected intent Fulfillment Text:');
          debug(`${intentResponse.queryResult.intent.displayName}`);
          // Use the context from this response for next queries
          context = intentResponse.queryResult.outputContexts;
        } catch (error) {
          console.log(error);
        }
      }
      return intentResponse;
    }
  
    executeQueries(projectId, sessionId, queries, languageCode).then((v)=>{
      resolve(v);
    }).catch((error)=>{
      console.error(error);
    });
    // [END dialogflow_detect_intent_text]
  }

  async detectEventIntent(projectId, sessionId, eventName,languageCode) {
  const {struct} = require('pb-util');

  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      event: {
        name: eventName,
        parameters: struct.encode({foo: 'bar'}),
        languageCode: languageCode,
      },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId = contextClient.matchContextFromProjectAgentSessionContextName(
        context.name
      );
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
  }

  async detectAudioIntent(
  projectId,
  sessionId,
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_detect_intent_audio]
  const fs = require('fs');
  const util = require('util');
  const {struct} = require('pb-util');
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // Read the content of the audio file and send it as part of the request.
  const readFile = util.promisify(fs.readFile);
  const inputAudio = await readFile(filename);
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
    },
    inputAudio: inputAudio,
  };

  // Recognizes the speech in the audio and detects its intent.
  const [response] = await sessionClient.detectIntent(request);

  console.log('Detected intent:');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId = contextClient.matchContextFromProjectAgentSessionContextName(
        context.name
      );
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
  // [END dialogflow_detect_intent_audio]
  }

  async streamingDetectIntent(
  projectId,
  sessionId,
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_detect_intent_streaming]
  const fs = require('fs');
  const util = require('util');
  const {Transform, pipeline} = require('stream');
  const {struct} = require('pb-util');

  const pump = util.promisify(pipeline);
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to the local file on which to perform speech recognition, e.g.
  // /path/to/audio.raw const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'AUDIO_ENCODING_LINEAR_16'
  // const encoding = 'AUDIO_ENCODING_LINEAR_16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const initialStreamRequest = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
      singleUtterance: true,
    },
  };

  // Create a stream for the streaming request.
  const detectStream = sessionClient
    .streamingDetectIntent()
    .on('error', console.error)
    .on('data', data => {
      if (data.recognitionResult) {
        console.log(
          `Intermediate transcript: ${data.recognitionResult.transcript}`
        );
      } else {
        console.log('Detected intent:');

        const result = data.queryResult;
        // Instantiates a context client
        const contextClient = new dialogflow.ContextsClient();

        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        if (result.intent) {
          console.log(`  Intent: ${result.intent.displayName}`);
        } else {
          console.log('  No intent matched.');
        }
        const parameters = JSON.stringify(struct.decode(result.parameters));
        console.log(`  Parameters: ${parameters}`);
        if (result.outputContexts && result.outputContexts.length) {
          console.log('  Output contexts:');
          result.outputContexts.forEach(context => {
            const contextId = contextClient.matchContextFromProjectAgentSessionContextName(
              context.name
            );
            const contextParameters = JSON.stringify(
              struct.decode(context.parameters)
            );
            console.log(`    ${contextId}`);
            console.log(`      lifespan: ${context.lifespanCount}`);
            console.log(`      parameters: ${contextParameters}`);
          });
        }
      }
    });

  // Write the initial stream request to config for audio input.
  detectStream.write(initialStreamRequest);

  // Stream an audio file from disk to the Conversation API, e.g.
  // "./resources/audio.raw"
  await pump(
    fs.createReadStream(filename),
    // Format the audio stream into the request format.
    new Transform({
      objectMode: true,
      transform: (obj, _, next) => {
        next(null, {inputAudio: obj});
      },
    }),
    detectStream
  );
  // [END dialogflow_detect_intent_streaming]
  }
}
//module.exports = { detectTextIntent, detectEventIntent, detectAudioIntent, streamingDetectIntent};