# Spec Delta

## Purpose

Ensures fast, responsive dashboard loading through in-memory mtime specification caching, concurrent state gathering, and seamless skeleton placeholder states during data retrieval.

## ADDED Requirements

### Requirement: Skeleton Loading Placeholders
The studio dashboard SHALL display animated skeleton placeholder cards while workspace data is loading.

#### Scenario: Loading durable specifications
- **WHEN** the dashboard is opened or refreshed and specifications are loading
- **THEN** the specs view displays pulsing skeleton placeholder cards instead of an empty state or "No Specs Found" message

#### Scenario: Loading active changes
- **WHEN** the dashboard is loading active changes
- **THEN** the active changes view displays pulsing skeleton placeholder cards with simulated progress bars

#### Scenario: Tab badge loading indicators
- **WHEN** data is actively loading in the dashboard
- **THEN** the tab badges show animated loading indicators instead of displaying zero

### Requirement: Spec Parsing Mtime Cache
The extension host SHALL cache parsed specification structures in memory and reuse them when file modification timestamps have not changed.

#### Scenario: Unchanged specification loading
- **WHEN** specifications are requested and the underlying `spec.md` file modification time has not changed
- **THEN** the specification data is returned immediately from the in-memory cache without disk re-reading or re-parsing

#### Scenario: Modified specification cache update
- **WHEN** a `spec.md` file is modified on disk
- **THEN** the outdated cache entry is refreshed with the newly parsed specification

### Requirement: Concurrent Dashboard State Loading
The studio dashboard panel SHALL gather CLI status, active changes, durable specs, and archives concurrently.

#### Scenario: Parallel state gathering
- **WHEN** state broadcasting is initiated
- **THEN** CLI resolution, active changes, durable specs, and archived items are retrieved in parallel
