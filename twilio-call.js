const twilio = require('twilio');

class TwilioCall {
  constructor(accountSid, callSid, token) {
    this.client = twilio(accountSid, token);
    this.callSid = callSid;
  }

  async update(twiml) {
    try {
      const call = this.client.calls(this.callSid);
      const callInstance = await call.fetch();
      if (callInstance.status == 'in-progress') {
          call.update({ twiml })
      }
      else {
        console.log("Call not in progress, not updating")
      }
    }
    catch(e) {
      console.info(e)
    }
  }

  callInstance() {
    return this.client.calls(this.callSid);
  }
}

module.exports = TwilioCall;