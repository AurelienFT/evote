const { SlashCreator, ExpressServer } = require('slash-create');
const path = require('path');

const creator = new SlashCreator({
  applicationID: '793781694673977385',
  publicKey: 'bd62781454fb894f2f21a5e05e9eff99b418e5d198f524d88fa6ec47f46c2222',
  token: 'NzkzNzgxNjk0NjczOTc3Mzg1.X-xQzw.IIbJbOdwkzV3U4IKu_nY2bgxVDo',
  serverPort: 5555,
});

creator
  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'))
  // This will sync commands to Discord, it must be called after commands are loaded.
  // This also returns itself for more chaining capabilities.
  .syncCommands();

creator
  .withServer(new ExpressServer())
  // Depending on what server is used, this may not be needed.
  .startServer()
  .then(d => console.log("server started", d));
