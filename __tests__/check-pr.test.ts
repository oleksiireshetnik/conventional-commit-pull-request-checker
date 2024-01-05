/**
 * Unit tests for src/check-pr.ts
 */

import { checkTitle, checkDescription, InvalidTitleError } from '../src/check-pr'
import { expect } from '@jest/globals'

describe('checkTitle', () => {
  const defaultMaxTitleLen = 50

  it('should succeed for a valid title with "feat" type', () => {
    const title = 'feat(scope): add new feature'
    expect(() => checkTitle(title, defaultMaxTitleLen)).not.toThrow()
  })

  it('should succeed for a valid title with "fix" type', () => {
    const title = 'fix(scope): fix bug'
    expect(() => checkTitle(title, defaultMaxTitleLen)).not.toThrow()
  })

  it('should succeed for a title without a scope (it is optional in cc standard)', () => {
    const title = 'feat: add new feature'
    expect(() => checkTitle(title, defaultMaxTitleLen)).not.toThrow()
  })

  it('should throw an error for a title that is too long', () => {
    const tooLongTitle = 'feat(scope): '.padEnd(51, 'a')
    expect(() => checkTitle(tooLongTitle, defaultMaxTitleLen)).toThrow('Pull request title is too long.')
  })

  it('should throw an error for a title without a type', () => {
    const titleWithoutType = '(scope): add new feature'
    expect(() => checkTitle(titleWithoutType, defaultMaxTitleLen)).toThrow(InvalidTitleError)
  })

  it('should throw an error if the semicolon is missing', () => {
    const titleWithoutSemicolon = 'feat(scope) add new feature'
    expect(() => checkTitle(titleWithoutSemicolon, defaultMaxTitleLen)).toThrow(InvalidTitleError)
  })

  it('should throw an error if whitespace is missing after the semicolon', () => {
    const titleWithoutWhitespace = 'feat(scope):add new feature'
    expect(() => checkTitle(titleWithoutWhitespace, defaultMaxTitleLen)).toThrow(InvalidTitleError)
  })

  it('should throw an error if the operation name is incorrect', () => {
    const titleWithIncorrectOperationName = 'update(scope): add new feature'
    expect(() => checkTitle(titleWithIncorrectOperationName, defaultMaxTitleLen)).toThrow(InvalidTitleError)
  })

  it('should throw an error if braces are specified but the scope is missing', () => {
    const title = 'feat(): add new feature'
    expect(() => checkTitle(title, defaultMaxTitleLen)).toThrow(InvalidTitleError)
  })
})

describe('checkDescription', () => {
  const defaultDescriptionMaxLen = 140
  const incorrectDescriptionError = 'Footer in PR description does not match conventional commits standard.'
  const descriptionRequired = true

  it('should succeed for a valid description within the length limit', () => {
    const validDescription = 'This is a valid PR description following the conventional commits format.'
    expect(() => checkDescription(validDescription, descriptionRequired, defaultDescriptionMaxLen)).not.toThrow()
  })

  it('should succeed for a valid description with a valid footer', () => {
    const validDescriptionWithFooter = 'This is a valid PR description.\n\nFooter: Some footer info'
    expect(() =>
      checkDescription(validDescriptionWithFooter, descriptionRequired, defaultDescriptionMaxLen)
    ).not.toThrow()
  })

  it('should succeed for empty description if description is not required', () => {
    const invalidDescription = 'This description does not follow the required format.'
    expect(() => checkDescription(invalidDescription, false, defaultDescriptionMaxLen)).not.toThrow()
  })

  it('should throw an error if the description is too long', () => {
    const longDescription = 'a'.repeat(defaultDescriptionMaxLen + 1)
    expect(() => checkDescription(longDescription, descriptionRequired, defaultDescriptionMaxLen)).toThrow(
      'Pull request description is too long.'
    )
  })

  it('should throw an error for a description with an invalid footer formatting', () => {
    const invalidDescriptionWithFooter =
      'This is a valid PR description but has an invalid footer.\n\nInvalidFooterInfo'
    expect(() => checkDescription(invalidDescriptionWithFooter, descriptionRequired, defaultDescriptionMaxLen)).toThrow(
      incorrectDescriptionError
    )
  })
})
