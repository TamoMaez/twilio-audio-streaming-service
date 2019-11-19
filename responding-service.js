const axios = require('axios');
const EventEmitter = require('events');
const { VoiceResponse } = require('twilio').twiml;

const chatbot_api_url = 'http://localhost:3000/message';

class RespondingService extends EventEmitter {
  constructor() {
    super()
  }

  async send(message) {
    const { data: answer } = await axios.post(chatbot_api_url, { message });

    if (answer && answer.text) {
      const voiceResponse = new VoiceResponse();
      voiceResponse.say({ voice: 'alice' }, answer.text);

      switch(answer.action) {
        case 'hangup':
            voiceResponse.hangup();
            break;
        default:
            voiceResponse.pause({ length: 40 });
            break;
      }
      
      this.emit('update', voiceResponse.toString());
    }
  }
}

module.exports = RespondingService;