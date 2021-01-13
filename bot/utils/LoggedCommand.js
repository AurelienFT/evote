const { SlashCommand } = require('slash-create');

module.exports = class LoggedCommand extends SlashCommand {
  constructor(creator, opts) {
    super(creator, opts);
  }

  async run(ctx) {
    return `Hello, ${ctx.member.displayName}!`;
  }
}