# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Docs

- README: Spanish summary for discoverability, fixed intro paragraph.
- package.json: Spanish keywords and bilingual description for npm search.

## [0.2.0] - 2026-11-12

### Changed

- Node 18 is no longer supported (EOL). Minimum is now Node 20.

### Docs

- README: why this exists, and runtime requirements.

## [0.1.0] - 2026-11-12

### Added

- Festivos de Colombia for any year since 1984 (Ley Emiliani + Easter-based holidays).
- Business days: `isBusinessDay`, `addBusinessDays`, `businessDaysBetween`, with optional Saturdays.
- NIT check digit (DIAN), validation and formatting.
- COP, cédula and phone formatting/validation.
- Departamentos with DANE codes and capitals.

[Unreleased]: https://github.com/emejiac/colombia-kit/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/emejiac/colombia-kit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/emejiac/colombia-kit/releases/tag/v0.1.0
