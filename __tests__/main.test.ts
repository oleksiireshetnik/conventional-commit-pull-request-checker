/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as github from '@actions/github'
import * as main from '../src/main'
import { extendedErrorMessage } from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('should succeed for correct title, description and footer values', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'title-check-enabled':
          return 'true'
        case 'title-max-len':
          return '-1'
        case 'description-check-enabled':
          return 'true'
        case 'description-required':
          return 'false'
        case 'description-max-len':
          return '-1'
        default:
          return ''
      }
    })

    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'feat(scope): add new feature',
        body: 'This is a valid PR description.\n\nFooter: Some footer info'
      }
    }

    await main.run()
    expect(runMock).toHaveReturned()

    expect(debugMock).not.toHaveBeenCalled()
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'title-check-enabled':
          return 'true'
        case 'title-max-len':
          return '-1'
        case 'description-check-enabled':
          return 'true'
        case 'description-required':
          return 'false'
        case 'description-max-len':
          return '-1'
        default:
          return ''
      }
    })

    github.context.payload = {
      pull_request: {
        number: 1,
        title: 'add new feature',
        body: ''
      }
    }

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(1, extendedErrorMessage)
    expect(errorMock).not.toHaveBeenCalled()
  })
})
