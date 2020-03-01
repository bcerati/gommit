const fs = require('fs');
const { execSync } = require('child_process');
const { Command, flags } = require('@oclif/command');
const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Gommit, ask different informations so the commit message can be formatted
 */
class GommitCommand extends Command {
  async run() {
    const { argv, flags } = this.parse(GommitCommand);

    if (flags.template) {
      this.setMessageTemplate(flags.template);
      this.log(chalk.green('The new template has been saved.'));
      process.exit(0);
    }

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

    let template = this.getMessageTemplate();
    template = template.replace('[__TYPE__]', commitType.toLowerCase());
    template = template.replace(
      '[__FUNCTIONNALITY__]',
      commitFunctionality.toUpperCase()
    );
    template = template.replace('[__MESSAGE__]', commitMessage);
    template = template.replace('[__TICKET_NUMBER__]', commitTicketNumber);

    try {
      execSync(`git commit -m "${template.trim()}" ${argv.join(' ')}`, {
        stdio: 'inherit',
      });
    } catch (e) {
      this.log(
        chalk.bold.italic.red('\nUnable to commit, please check the output!')
      );
    }
  }

  /**
   * Get the template of the message if it was set.
   * Otherwise, return the default template
   *
   * @returns {string}
   */
  getMessageTemplate() {
    const homedir = require('os').homedir();
    const templatePath = `${homedir}/.gommit/template`;

    let exists = true;
    try {
      fs.accessSync(templatePath);
    } catch (e) {
      exists = false;
      this.setMessageTemplate(
        '[__TYPE__][[__FUNCTIONNALITY__]] [__MESSAGE__][__TICKET_NUMBER__]'
      );
    }

    return `${fs.readFileSync(templatePath)}`;
  }

  /**
   * Set the template of the commit message
   *
   * @returns {string}
   */
  setMessageTemplate(template) {
    const homedir = require('os').homedir();
    const templatePath = `${homedir}/.gommit/template`;

    execSync(`mkdir -p ${homedir}/.gommit`);
    fs.writeFileSync(templatePath, template);

    return template;
  }

  /**
   * Get an information that ios required by gommit.
   *
   * @param {Function} fct
   */
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
          message: 'What is the number of your ticket? (empty)',
        },
      ])
      .then(({ commitTicketNumber }) => commitTicketNumber);
  }
}

GommitCommand.description = `Write a Git commit using the convention. You can pass any of the git commit original options.`;
GommitCommand.strict = false;

GommitCommand.flags = {
  version: flags.version({ char: 'v' }),
  template: flags.string(),
  help: flags.help({ char: 'h' }),
};

module.exports = GommitCommand;
