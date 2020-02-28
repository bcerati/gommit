const { execSync } = require('child_process');
const { Command, flags } = require('@oclif/command');
const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Gommit, ask different informations so the commit message can be formatted
 */
class GommitCommand extends Command {
  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  };

  static strict = false;

  async run() {
    const { argv } = this.parse(GommitCommand);

    this.log(
      chalk.green('Please enter the commit informations for your changes.\n')
    );

    const commitType = await this.askForCommitType();
    const askForFunctionality = await this.askForFunctionality();
    const commitMessage = await this.askForCommitMessage();
    let commitTicketNumber = await this.askForTicketNumber();

    if (commitTicketNumber) {
      commitTicketNumber = ` #${commitTicketNumber.replace('#', '')}`;
    }

    const finalMessage = `[${askForFunctionality.toUpperCase()}] ${commitType.toLowerCase()} : ${commitMessage}${commitTicketNumber}`;

    execSync(`git commit -m "${finalMessage}" ${argv.join(' ')}`);
  }

  /**
   * Ask the type of commit (Hotfix, Feature...)
   *
   * @returns {Promise}
   */
  async askForCommitType() {
    return inquirer
      .prompt([
        {
          type: 'list',
          name: 'commitType',
          message: 'What is the type of commit?',
          choices: ['Hotfix', 'Fix', 'Feature'],
        },
      ])
      .then(({ commitType }) => commitType);
  }

  /**
   * Ask the functionnality of commit
   *
   * @returns {Promise}
   */
  async askForFunctionality() {
    return inquirer
      .prompt([
        {
          type: 'string',
          name: 'commitFunctionality',
          message: 'What is the functionality impacted?',
        },
      ])
      .then(({ commitFunctionality }) => commitFunctionality);
  }

  /**
   * Ask the message of commit
   *
   * @returns {Promise}
   */
  async askForCommitMessage() {
    return inquirer
      .prompt([
        {
          type: 'string',
          name: 'commitMessage',
          message: 'What is the message of your commit?',
        },
      ])
      .then(({ commitMessage }) => commitMessage);
  }

  /**
   * Ask for the ticket associated with the modification
   *
   * @returns {Promise}
   */
  async askForTicketNumber() {
    return inquirer
      .prompt([
        {
          type: 'string',
          name: 'commitTicketNumber',
          message: 'What is the number of your APM ticket?',
        },
      ])
      .then(({ commitTicketNumber }) => commitTicketNumber);
  }
}

GommitCommand.description = `Write a Git commit using the convention`;

module.exports = GommitCommand;
