# Conventional Commits Guide

## Background

We decided as a team that we will use conventional commits to identify whether commits/PRs are fixes, features, and most importantly to track breaking changes.

## Assumptions

1. BFF is always deployed first. Hence BFF should always be backward compatible.
2. UI is only deployed after the BFF. Hence UI need not be backward compatible.

## Definitions - With respect to Calypso

### 1. Backward compatibility

For the purpose of this document, backward compatibility is:

**Any change on the service is said to be backward compatible if the change also works with the current version of the dependent services without making any changes on the dependent services.**

i.e., In Calypso, a new BFF version is backward compatible if it works with the current version of the UI. 

### 2. Commit Types

In the increasing order of impact:

1. **docs:** - Eg. Updates to README, dev documentation.
2. **test:** - Eg. CDC tests
3. **fix:** a commit of the *type* fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).
   
   In Calypso, these could be:
   * Any bug fix
   * Small refactoring without changes in contracts

4. **feat:** a commit of the *type* feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
   
   In Calypso, these could be:
   * New UI elements
   * New queries, mutations etc.

### BREAKING CHANGE

A commit that has a footer BREAKING CHANGE:, **and** appends a ! after the type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any *type*.

In Calypso, these could be:

  * Schema change in GraphQL
  * name of a field/query/mutation is altered
  * the name of a GraphQL input is changed, or one of the fields is updated to be mandatory (!)

> [!NOTE]  
> If and when a commit contains more than one type, go with the type with the most impact.

## Commit Structure

### Examples:

```shell
fix(LOB-3170): improved default mock for queries
fix(LOB-3170): APK | improved default mock for queries
feat(LOB-3174): KK | Add aml blockade modal
```

### Breaking Change Example:

```shell
feat(LOB-3174)!: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Git Command Example:

```bash
git commit -m "feat(LOB-3174)!: allow provided config object to extend other configs" -m "BREAKING CHANGE: `extends` key in config file is now used for extending other config files"
```

## PR Title Format

Take the commit type with the highest impact.

Example:

```bash
[BREAKING CHANGE] fix(LOB-3170)!: APK | improved default mock for queries
```