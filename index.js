const fetch = require('node-fetch');
const Alexa = require('ask-sdk');
// use 'ask-sdk' if standard SDK module is installed

let participants = [];
let data = {
  caller: null,
  getCalled: null,
  innocent: [],
  callerWins: false,
};

// Code for the handlers here
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to the Brisk Score, you can update your brisk score!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const NameIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log(JSON.stringify(request, null, 2));
    return request.type === 'IntentRequest'
            && request.intent.name === 'NameIntent';
  },
  handle(handlerInput) {
    let intent = handlerInput.requestEnvelope.request.intent;
    console.log(intent);

    const sorrySpeech = 'Sorry, cannot find participants. Please say who was the caller and who got called again.';
    const ask_win = 'Did the guilty team win?';
    const ask_caller = 'Who was the caller and who got called?';

    if(intent.confirmationStatus === 'DENIED') {
      intent.confirmationStatus = 'NONE';
      Object.keys(intent.slots).forEach(
        (slotName) => {
          var slot = intent.slots[slotName];
          delete slot.value;
          slot.confirmationStatus = 'NONE';
        }
      )
      return handlerInput.responseBuilder
            .speak(ask_caller)
            .reprompt(ask_caller)
            .getResponse();
    } else if (intent.confirmationStatus === 'CONFIRMED') {
      let caller = intent.slots.name.value.toLowerCase();
      let getCalled = intent.slots.name_called.value.toLowerCase();

      if (participants.indexOf(caller) === -1 || participants.indexOf(getCalled) === -1) {
        console.log('names are not correct');
        intent.confirmationStatus = 'NONE';
        return handlerInput.responseBuilder
            .speak(sorrySpeech)
            .reprompt(sorrySpeech)
            .getResponse();
      }

      data.caller = caller;
      data.getCalled = getCalled;
      data.innocent = participants.filter(participant => participant !== caller && participant !== getCalled);
      console.log(JSON.stringify(data));

      return handlerInput.responseBuilder
        .speak(ask_win)
        .reprompt(ask_win)
        .getResponse();
    }

    return handlerInput.responseBuilder
      .addDelegateDirective(intent)
      .getResponse();
  }
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.YesIntent';
  },
  async handle(handlerInput) {
    let intent = handlerInput.requestEnvelope.request.intent;
    let speechTxt = '';
    console.log(JSON.stringify(intent, null, 2));
    data.callerWins = true;
    console.log(data);
    try {
      const response = await postData(data);
      console.log(response);
      speechTxt += 'Ok, update scores. Right now. '
      for (var j in response) {
        speechTxt += response[j]['name'] + ' ' + response[j]['score'] + '. ';
      } 
    } catch (error) {
      speechTxt = 'Sorry, there is some error happened.'
    }
    return handlerInput.responseBuilder
      .speak(speechTxt)
      .getResponse();
  }
};

const NoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.NoIntent';
  },
  async handle(handlerInput) {
    let intent = handlerInput.requestEnvelope.request.intent;
    let speechTxt = '';
    console.log(JSON.stringify(intent, null, 2));
    data.callerWins = true;
    console.log(data);
    try {
      const response = await postData(data);
      console.log(response);
      speechTxt += 'Ok, update scores. Right now. '
      for (var j in response) {
        speechTxt += response[j]['name'] + ' ' + response[j]['score'] + '. ';
      } 
    } catch (error) {
      speechTxt = 'Sorry, there is some error happened.'
    }
    return handlerInput.responseBuilder
      .speak(speechTxt)
      .getResponse();
  }
};

const UpdateIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
            && request.intent.name === 'UpdateIntent';
  },
  handle(handlerInput) {
    data = {
      caller: null,
      getCalled: null,
      innocent: [],
      callerWins: false,
    };
    const intent = handlerInput.requestEnvelope.request.intent;
    console.log(JSON.stringify(intent, null, 2));

    // for (const slotName in intent.slots) {
    //   if (Object.prototype.hasOwnProperty.call(intent.slots, slotName)) {
    //     const currentSlot = intent.slots[slotName];
    //     if (currentSlot.value) {
    //       participants.push(currentSlot.value);
    //       return handleInput.responseBuilder
    //         .speak('test')
    //         .addElicitSlotDirective(currentSlot.name)
    //         .getResponse();
    //     }
    //   }
    // }

    if(intent.confirmationStatus === 'DENIED') {
      intent.confirmationStatus = 'NONE';
      Object.keys(intent.slots).forEach(
        (slotName) => {
          var slot = intent.slots[slotName];
          delete slot.value;
          slot.confirmationStatus = 'NONE';
        }
      )
    } else if (intent.confirmationStatus === 'CONFIRMED') {
      let speech = 'Who was the caller and who got called?';
      let player_one = intent.slots.player_one.value.toLowerCase();
      let player_two = intent.slots.player_two.value.toLowerCase();
      let player_three = intent.slots.player_three.value.toLowerCase();
      let player_four = intent.slots.player_four.value.toLowerCase();
      let player_five = intent.slots.player_five.value.toLowerCase();
      participants.push(player_one);
      participants.push(player_two);
      participants.push(player_three);
      participants.push(player_four);
      participants.push(player_five);
      return handlerInput.responseBuilder
        .speak(speech)
        .reprompt(speech)
        .getResponse();
    }
    return handlerInput.responseBuilder
      .addDelegateDirective(intent)
      .getResponse();
  }
};

const ReportScoresIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ReportScoresIntent';
  },
  async handle(handlerInput) {
    let speech = '';
    try {
      const response = await fetchAll();
      console.log(response);
      speech = 'Report the scores. ';
      for (var i in response) {
        speech += response[i].name + ' ' + response[i].score + '. ';
      }
    } catch (error) {
      speech = 'sorry, failed to fetch the data';
    }
    return handlerInput.responseBuilder
      .speak(speech)
      .getResponse();
  }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        data = {
          caller: null,
          getCalled: null,
          innocent: [],
          callerWins: false,
        };
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);

      return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
};

function fetchAll() {
  return new Promise((resolve, reject) => {
    fetch('http://node-express-env.pywpf2e7me.us-east-2.elasticbeanstalk.com/')
      .then(res => {
        console.log('response:' + JSON.stringify(res));
        if (res.status !== 200) {
          return reject(new Error(res.message));
        }
        return res.json();
      })
      .then(data => resolve(data))
      .catch(err => {
        return reject(new Error(err));
      })
  })
};

function postData(data) {
  return new Promise((resolve, reject) => {
    fetch('http://node-express-env.pywpf2e7me.us-east-2.elasticbeanstalk.com/update', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'},
    })
      .then(res => {
        console.log('response from post:' + JSON.stringify(res));
        if (res.status !== 200) {
          return reject(new Error(res.message));
        }
        return res.json();
      })
      .then(data => resolve(data))
      .catch(err => {
        return reject(new Error(err));
      })
  })
};

exports.handler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         HelloWorldIntentHandler,
                         UpdateIntentHandler,
                         NameIntentHandler,
                         YesIntentHandler,
                         NoIntentHandler,
                         ReportScoresIntentHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();