const TranscriptionService = require('./transcription-service');
const sharedQueue = require('./queue');

class MediaStreamHandler {
  constructor(connection) {
    connection.on('message', this.processMessage.bind(this));
    connection.on('close', this.close.bind(this));
  }

  processMessage(message){
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data);
      if (data.event === "start") {
        this.transcriptionService = new TranscriptionService();
        this.transcriptionService.on('transcription', (transcription) => {
          console.log(`Transcription: ${transcription}`);
          sharedQueue.post(transcription);
        });
      }
      if (data.event !== "media") {
        return;
      }
      this.transcriptionService.send(data.media.payload);
    } else if (message.type === 'binary') {
      console.log('Media WS: binary message received (not supported)');
    }
  }

  close(){
    console.log('Media WS: closed');
    if (this.transcriptionService) {
      this.transcriptionService.close();
    }
  }
}

module.exports = MediaStreamHandler;