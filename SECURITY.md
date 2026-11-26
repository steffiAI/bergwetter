# Security

## Reporting a problem

Please do not open a public issue for a security problem. Use GitHub's private report instead:
https://github.com/steffiAI/bergwetter/security/advisories/new

You will get an answer within a few days.

## What is in place

- The app has no accounts and stores favourites and settings only in the visitor's browser.
- A content security policy limits the app to its known data sources.
- Supporter codes are single-use and bound to one device. The code server stores only fingerprints of the codes and limits attempts.
- No keys or passwords are kept in this repository.
