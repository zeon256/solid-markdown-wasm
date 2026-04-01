# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

This project implements multiple layers of security:

### 1. Supply Chain Security

#### GitHub Actions SHA Pinning
All GitHub Actions in our CI/CD workflows are pinned to specific commit SHAs rather than floating version tags. This prevents supply chain attacks where a compromised action tag could execute malicious code in our build pipeline.

| Workflow | Actions Pinned |
|----------|----------------|
| `build-release.yml` | 10 actions pinned |
| `github-pages.yml` | 4 actions pinned |
| `biome-check.yaml` | 4 actions pinned |

**Verification:** Run `bun verify-actions.ts` to verify all actions are correctly pinned.

#### NPM Trusted Publishing (OIDC)
We use GitHub's OIDC (OpenID Connect) integration with NPM for trusted publishing:
- **No long-lived NPM tokens** stored in GitHub secrets
- **Short-lived OIDC tokens** used for authentication
- **Provenance attestations** generated for each publish

This means:
- Package publishes can only happen from our specific GitHub workflow
- NPM tokens cannot be leaked or reused
- Every publish has cryptographic proof of its origin

### 2. Runtime Security

#### Safe-by-Default Markdown Rendering
- Raw HTML is **sanitized** using the [ammonia](https://github.com/rust-ammonia/ammonia) library
- Dangerous links are **stripped** automatically
- No "unsafe" comrak options are exposed

#### WebAssembly Sandbox
The Markdown renderer runs in a WebAssembly sandbox, providing:
- Memory isolation from the host JavaScript
- No direct filesystem access
- Controlled execution environment

### 3. Development Security

#### Dependency Management
- `package-lock.json` / `bun.lockb` committed for reproducible installs
- Biome.js used for linting and formatting (security-focused rules)
- Regular dependency audits via `npm audit` / `bun audit`

#### Code Quality
- All code formatted with Biome.js
- TypeScript strict mode enabled
- No `any` types in public APIs

## Reporting Security Vulnerabilities

> [!CAUTION]
> **Do not open a public GitHub issue for security vulnerabilities.**

Instead, please report privately:

| Method | Contact |
|--------|---------|
| **Email** | me+security@inve.rs |
| **Response Time** | Within 48 hours |
| **Bounty** | Considered on a case-by-case basis |

Please include:
1. Detailed description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Suggested fix (if any)

## Security Checklist for Users

When using this library in your project:

- [ ] Keep the library updated to the latest version
- [ ] Review the [Sanitization behavior](#sanitization) for your use case
- [ ] Validate that `vite-plugin-wasm` is configured correctly
- [ ] Report any unexpected HTML in rendered output

## Sanitization Behavior

By default, `solid-markdown-wasm` sanitizes the following:

| Element | Behavior |
|---------|----------|
| Raw HTML tags | Stripped (replaced with escaped text) |
| `javascript:` URLs | Removed from links |
| `data:` URLs | Removed from links (potential XSS) |
| Unknown protocols | Stripped from href/src attributes |
| `<script>` tags | Never rendered |
| Event handlers (`onclick`, etc.) | Never rendered |

To customize sanitization (not recommended), you would need to fork the underlying [comrak](https://github.com/DoublePrecision/comrak) library.

## Security Audit Log

| Date | Action | Details |
|------|--------|---------|
| 2026-04-01 | Implemented SHA pinning | All 14 GitHub Actions pinned to immutable SHAs |
| 2026-04-01 | Enabled NPM Trusted Publishing | Removed NPM_TOKEN, using OIDC with provenance |

## Acknowledgments

We thank the following for responsible disclosure:

*None yet - be the first!*

## Resources

- [GitHub Security Lab](https://securitylab.github.com/)
- [SLSA Framework](https://slsa.dev/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NPM Security Best Practices](https://docs.npmjs.com/security)
