import * as github from '@actions/github'
import * as core from '@actions/core'
import { checkTitle, checkDescription, InvalidTitleError } from './check-pr'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const title: string = (github.context.payload.pull_request?.title as string) ?? ''
    const body: string = (github.context.payload.pull_request?.body as string) ?? ''
    const titleCheckEnabled: boolean = stringToBool(core.getInput('title-check-enabled'))
    const titleMaxLen: number = parseInt(core.getInput('title-max-len'))

    const descriptionCheckEnabled: boolean = stringToBool(core.getInput('description-check-enabled'))
    const descriptionRequired: boolean = stringToBool(core.getInput('description-required'))
    const descriptionMaxLen: number = parseInt(core.getInput('description-max-len'))

    const ignoredContributors: string[] = (core.getInput('ignored-contributors') || '').split(',').map(s => s.trim())

    if (core.isDebug()) {
      core.debug(`Title: ${title}`)
      core.debug(`Body: ${body}`)
    }

    if (title === '') {
      core.debug('Title of pull request is empty. External change broke the action')
    }

    // if ignoredContributors param was provided and is not empty
    if (ignoredContributors.length !== 1 && ignoredContributors[0] !== '') {
      core.debug(`Ignored Contributors: ${ignoredContributors.length}`)
    }

    if (ignoredContributors.includes(github.context.actor)) {
      core.debug('Ignoring actor')
      return
    }

    if (titleCheckEnabled) {
      if (core.isDebug()) {
        core.debug(`Checking the pull request title`)
      }

      checkTitle(title, titleMaxLen)
    }

    if (descriptionCheckEnabled) {
      if (core.isDebug()) {
        core.debug(`Checking the pull request description`)
      }

      checkDescription(body, descriptionRequired, descriptionMaxLen)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      let message: string = error.message

      if (core.isDebug()) {
        core.debug(`Got error message during execution: ${message}`)
      }

      // overriding internal error to more user-friendly error. Possible to pass an error message as a param in the future
      if (message === InvalidTitleError) {
        message = extendedErrorMessage
      }

      core.setFailed(message)
    }
  }
}

export const extendedErrorMessage = `Pull request title does not follow conventional commits format, e.g.
\nfeat(api): send an email to the customer when a product is shipped.
\nHere is the link to the conventional commits doc for your convenience:\nhttps://www.conventionalcommits.org/en/v1.0.0/\n`

/**
 * Util function that converts string boolean value to boolean.
 * @returns {boolean} Boolean equivalent of the string value.
 */
function stringToBool(value: string): boolean {
  return value.toLowerCase() === 'true'
}
