# Security Policy

## Supported versions

Security fixes are applied to the latest code on `main` and the most recent released mobile app version. Older versions are not patched; please update to the latest release.

## Reporting a vulnerability

**Please do not open a public issue, pull request or discussion for security vulnerabilities.**

Report privately through GitHub:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the issue.

If you can't use that, contact the maintainer at **hardikmalhotra150804@gmail.com**.

### What to include

- A description of the vulnerability and its impact.
- Steps to reproduce, or a proof of concept.
- The affected component (API, mobile app, `@repo/schemas`, `@repo/utils`) and version or commit.
- Any suggested fix, if you have one.

## What to expect

- Acknowledgement of your report within **72 hours**.
- An initial assessment and next steps within **7 days**.
- Updates as the fix progresses, and credit in the release notes if you'd like it, once the issue is fixed.

This is a maintainer-run project, so timelines are best effort. Please give a reasonable amount of time to fix an issue before disclosing it publicly.

## Scope

In scope:

- Authentication and authorization flaws (for example, accessing another user's collection, completions, playthroughs or lists).
- Injection, data exposure, or insecure handling of secrets and tokens.
- Weaknesses in the mobile app update/APK install flow.
- Issues in the integrations with Steam, PSN, IGDB or SteamGridDB that expose user data.

Out of scope:

- Vulnerabilities in third-party services or dependencies themselves (report those upstream; tell us if a dependency upgrade is needed).
- Denial-of-service through excessive request volume or automated scanning.
- Social engineering, or physical access to a device.
- Issues requiring a rooted or jailbroken device, or a compromised user account.

## Secrets

If you find a leaked credential, key or token in the repository or its history, report it privately in the same way. Please don't use or test it.

## Safe harbor

Good-faith security research that follows this policy is welcome. Please avoid accessing other users' data, degrading the service, or destroying data while testing.
