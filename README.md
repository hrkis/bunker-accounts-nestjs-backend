# Bunker
This project set up by nestjs and typeorm

### nestjs
[https://docs.nestjs.com//](https://docs.nestjs.com//)

### typeorm
[https://typeorm.io/](https://typeorm.io/)

## Installation

```bash
$ npm install
```

## Typerom migration

```bash
# initial generate migration
$ npm run typeorm:migration:generate -- my_init
# run migration
$ npm run typeorm:migration:run
```

## Running the app

copy example.env to .env
update the info in .env

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Git Flow

**Branches**

master: the main branch, include all product features.
hotfix: the hotfix branch, checkout from master, to fix critical issues on live. After fixed will deploy to live, them merge it to master and develop.

release: the release branch, checkout from develop branch. Use this branch to do each deploy. After deploy should merge back to master and develop
bugfix: bugfix branch, checkout from release. After fixed, should create PR to release branch.

develop: the develop branch, firstly checkout from master branch, each feature will be checkout from this branch.

feature: feature branch, should checkout from develop to do each feature.


**Version**

Use three levels for our version. Like 1.0.0
The first number 1 represent the big version of our project.
The second number 0 represent our sprint number . EG. If the release is for sprint one, the version should 1.1.0
The third number 0 represent hotfix count. This mean if there is hotfix, it is our first hotfix for sprint 1, the version should 1.1.1. Later have others hotfix, the version will be 1.1.2,1.1.3.

## CI/CD ##

### Merge Reuest ###

After the merge request created, will run `yarn build` to test and build, only this job passed test, the merge request can be merged. So after create merge request, please check the pipeline tab in your merge request.

### Develop branch ###
After the code review and merged to develop, will build and deploy develop branch to dev automatically.

## Release branch
After the code review and merged to release branch, will build and deploy release branch to stg automatically.

