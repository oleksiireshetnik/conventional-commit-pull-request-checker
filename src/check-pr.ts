const titleRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .{1,50}/

export const InvalidTitleError = 'Pull request title does not follow conventional commits format.'

/**
 * Function that checks the pull request title with accordance to conventional commit rules.
 * @returns {void} Successfully returns without error if title is correct.
 */
export function checkTitle(title: string, maxLen: number): void {
  if (title.length > maxLen && maxLen !== -1) {
    throw new Error('Pull request title is too long.')
  }

  if (!titleRegex.test(title)) {
    throw new Error(InvalidTitleError)
  }
}

/**
 * Checks if the commit message's description and footer follow the Conventional Commits standard.
 * Throws an error if the validation fails.
 * @param description The full commit message.
 * @param descriptionRequired Whether a description is required.
 * @param maxLen Maximum length allowed for the commit message.
 */
export function checkDescription(description: string, descriptionRequired: boolean, maxLen: number): void {
  if (description.length > maxLen && maxLen !== -1) {
    throw new Error('Pull request description is too long.')
  }

  if (description === '' && descriptionRequired) {
    throw new Error('Pull request description should not be empty')
  }

  // Split the commit message into lines
  const lines = description.split('\n')

  // Check if the message is a single line and validate accordingly
  if (lines.length === 1) {
    if (descriptionRequired && lines[0].trim() === '') {
      throw new Error('Description is required but not found in the commit message.')
    }
    return // Single line messages are valid if description is not empty
  }

  // Find the index of the blank line separating header from body/footer
  const blankLineIndex = lines.findIndex(line => line === '')

  if (descriptionRequired && blankLineIndex === -1) {
    throw new Error('Description is required but not found in the commit message.')
  }

  // Extract the body and footer parts
  const bodyAndFooter = lines.slice(blankLineIndex + 1)

  // Define footer patterns
  const footerPattern = /^[\w-]+: .+$/
  const breakingChangePattern = /^BREAKING CHANGE: .+$/

  // Validate each line in the body and footer
  for (const line of bodyAndFooter) {
    if (line !== '' && !footerPattern.test(line) && !breakingChangePattern.test(line)) {
      // Line is not a valid footer and not an empty line (which would be part of the body)
      throw new Error('Footer in PR description does not match conventional commits standard.')
    }
  }
}
