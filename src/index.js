const { execSync } = require('child_process');
const { Command, flags } = require('@oclif/command');
const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Gommit, ask different informations so the commit message can be formatted
 */
class GommitCommand extends Command {
  async run() {
    const { argv } = this.parse(GommitCommand);

    this.log(
      chalk.green('Please enter the commit informations for your changes.\n')
    );

    const commitType = await this.getRequiredInformation(this.askForCommitType);

    let commitFunctionality = await this.getRequiredInformation(
      this.askForFunctionality
    );

    // parse the given type
    commitFunctionality = commitFunctionality
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(w => w.toUpperCase())
      .join(' ');

    let commitMessage = 'Work in Progress';
    if (commitType !== 'WIP') {
      commitMessage = await this.getRequiredInformation(
        this.askForCommitMessage
      );
    }

    let commitTicketNumber = await this.askForTicketNumber();

    if (commitTicketNumber) {
      commitTicketNumber = ` #${commitTicketNumber.replace('#', '')}`;
    }

    const finalMessage = `${commitType.toLowerCase()}[${commitFunctionality.toUpperCase()}] : ${commitMessage}${commitTicketNumber}`;

    try {
      execSync(`git commit -m "${finalMessage}" ${argv.join(' ')}`, {
        stdio: 'inherit',
      });
    } catch (e) {
      this.log(
        chalk.bold.italic.red('\nUnable to commit, please check the output!')
      );
    }
  }

  async getRequiredInformation(fct) {
    do {
      var value = await fct();
    } while (!value);

    return value;
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
          choices: ['Fix', 'Feature', 'Hotfix', 'WIP', 'Other'],
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
          message: 'What is the number of your APM ticket? (empty)',
        },
      ])
      .then(({ commitTicketNumber }) => commitTicketNumber);
  }
}

GommitCommand.description = `Write a Git commit using the convention. You can pass any of the git commit original options.`;
GommitCommand.strict = false;

GommitCommand.flags = {
  version: flags.version({ char: 'v' }),
  help: flags.help({ char: 'h' }),
};

module.exports = GommitCommand;
