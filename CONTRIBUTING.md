# Setup

1. Clone the repository
1. `yarn`

# Usage

## Fix code style

    yarn fix

## Validate changes

    yarn validate

# Commit Messages

We use [semantic-release](https://github.com/semantic-release/semantic-release) to automatically generate
- version number
- changelog
- releases

This requires to write commit messages that follow the [Angular commit message format](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format),
except that we do not use `scope` and `body` is always optional.

Merge requests with a lot of intermediary commits must be cleaned up by force pushing rewritten commits.
