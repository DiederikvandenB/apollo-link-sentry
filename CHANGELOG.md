## [3.1.3](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.1.2...v3.1.3) (2022-06-24)


### Bug Fixes

* move tslib and zen-observable to dependencies ([#439](https://github.com/DiederikvandenB/apollo-link-sentry/issues/439)) ([4a622b7](https://github.com/DiederikvandenB/apollo-link-sentry/commit/4a622b70e9fbc325a2f9c54eb883aa98916e682f))

## [3.1.2](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.1.1...v3.1.2) (2022-06-07)


### Bug Fixes

* remove source and declaration maps from build output ([db5f8a0](https://github.com/DiederikvandenB/apollo-link-sentry/commit/db5f8a0a4e0d551b47398e79e1616cd5e2d0134d))

## [3.1.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.1.0...v3.1.1) (2022-02-27)


### Bug Fixes

* import only from @sentry/browser ([23886b1](https://github.com/DiederikvandenB/apollo-link-sentry/commit/23886b1e26b211ecdffebaa24e051e3eeb0e7939))

# [3.1.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.0.3...v3.1.0) (2022-02-27)


### Features

* support graphql 16 ([#424](https://github.com/DiederikvandenB/apollo-link-sentry/issues/424)) ([1523e5f](https://github.com/DiederikvandenB/apollo-link-sentry/commit/1523e5f4862bf2ce27535e23ed4ee1af9c4c590c))

## [3.0.3](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.0.2...v3.0.3) (2022-02-27)


### Bug Fixes

* display correct name for operations with fragments ([#411](https://github.com/DiederikvandenB/apollo-link-sentry/issues/411)) ([6b759b9](https://github.com/DiederikvandenB/apollo-link-sentry/commit/6b759b9d61e24776592d09df89efbec72105572e))
* include errors in breadcrumbs starting with the first ([0d272ce](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0d272cef0e729bc1ff3317d361c515d0ab78f028))
* include partial GraphQL errors in breadcrumbs ([#410](https://github.com/DiederikvandenB/apollo-link-sentry/issues/410)) ([a3d929d](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a3d929dc19dae5b8b20f3a90177fe496b76bfd8f))


### Performance Improvements

* avoid repeated property accesses in SentryLink.ts ([#422](https://github.com/DiederikvandenB/apollo-link-sentry/issues/422)) ([b32e4f5](https://github.com/DiederikvandenB/apollo-link-sentry/commit/b32e4f5f143392f174c35881014523c8210d7204))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.2](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.0.1...v3.0.2) (2021-02-18)


### Features

* Only include `result` from `ServerError` if `includeFetchResult` is set ([0f0a919](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0f0a919da5d5c214a5bbce8524668e3f2f564534))
* Stringify objects in breadcrumb data ([bd5ceda](https://github.com/DiederikvandenB/apollo-link-sentry/commit/bd5cedad760920f3c7ef06f6b501cb34cf7a19b4))


### Chores

* Update tooling to support new functionality and test cases ([3582fa6](https://github.com/DiederikvandenB/apollo-link-sentry/commit/3582fa6b93cac1dcba861844718e83eb159aa703))

### [3.0.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v3.0.0...v3.0.1) (2021-02-15)


### Chores

* release with correct artifacts ([965483d](https://github.com/DiederikvandenB/apollo-link-sentry/commit/965483d6f9b2d59fd5174d6fda183b90564b40d6))

## [3.0.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v2.1.0...v3.0.0) (2021-02-11)

Check [UPGRADE.md](UPGRADE.md#v2-to-v3) for more information on how to upgrade.

### ⚠ BREAKING CHANGES

* Restructure options and describe upgrade process ([e1db20e](https://github.com/DiederikvandenB/apollo-link-sentry/commit/e1db20ea6aaef73062e5f497055026c3fc514e92))
* Use native `ApolloOperation` instead of our own `Operation` type ([370b9b5](https://github.com/DiederikvandenB/apollo-link-sentry/commit/370b9b56974d4dc6935e1e0fba97dbb7d4257156))
* Replace `OperationBreadcrumb` class with plain `GraphQLBreadcrumb` object ([036b746](https://github.com/DiederikvandenB/apollo-link-sentry/commit/036b746e8b0800bfa3243612cccb9c6cc19412d9))
* Rename `response` key in breadcrumbs to `fetchResult`

### Features

* Change breadcrumb type to `http`
* Add `operationName` key to breadcrumbs
* Allow specifying `uri` to add `url` key to breadcrumbs

### Fix

* Handle queries without operation name gracefully
* Indicate if errors occurred by setting the breadcrumb level

### Chores

* Clarify peer dependencies ([c8b43c3](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c8b43c3237072b124d0c2e2f9ed7f59c80814b58))
* Update tooling and dev dependencies ([79b6be6](https://github.com/DiederikvandenB/apollo-link-sentry/commit/79b6be6c01c587392751215f859a567fcaf89bd4))
* Increase type, line and branch coverage

## [2.1.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v2.0.2...v2.1.0) (2021-02-04)


### Features

* add helpers to exclude GraphQL fetch breadcrumbs ([#264](https://github.com/DiederikvandenB/apollo-link-sentry/issues/264)) ([a8fa792](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a8fa792c7050c57f4cb552ebd91e6375b7213b8a))


### Chores

* **deps-dev:** bump @sentry/browser and @sentry/minimal to v6 ([a223504](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a2235046b73ee15a232289a39d429aec642e8d05))

### [2.0.2](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v2.0.1...v2.0.2) (2021-01-15)

* Updated dependencies, specifically two minor security updates

### [2.0.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v2.0.0...v2.0.1) (2020-10-12)


### Chores

* moves most dependencies to peer-dependencies ([94372ef](https://github.com/DiederikvandenB/apollo-link-sentry/commit/94372ef04d08437d07239b95efb82214fab338bf))

## [2.0.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.3.1...v2.0.0) (2020-10-12)


### ⚠ BREAKING CHANGES

* move to apollo client v3

### Features

* move to apollo client v3 ([0afc327](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0afc3279888df2ab0ffee8ad1f3cdfdcf7205b29))

### [1.3.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.3.0...v1.3.1) (2020-10-12)


### Chores

* update dependencies ([a4f2239](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a4f2239325ec1ce6e2685fed8d7bf3919ea5c57e))
* update dependencies ([c28ce43](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c28ce433bbb16cfe8adac77a2c62b5fd57c7ce07))
* update dev dependencies ([18243d4](https://github.com/DiederikvandenB/apollo-link-sentry/commit/18243d41e212f2ac87e90a16b05e30b219b0d4a1))
* update readme badges ([b45e606](https://github.com/DiederikvandenB/apollo-link-sentry/commit/b45e606baf77ffc740bc4e71f1c2b530f3f3da65))
* **deps:** bump tslib from 1.11.1 to 2.0.0 ([#91](https://github.com/DiederikvandenB/apollo-link-sentry/issues/91)) ([c31c6b1](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c31c6b1e9e3fb66cd0a3315f3a377665e6a3681c))


### Bug fixes

* update setTransaction to setTransactionName ([9bf26db](https://github.com/DiederikvandenB/apollo-link-sentry/commit/9bf26dbd380884a104b807cddea4634207b8d7c0))

## [1.3.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.2.1...v1.3.0) (2020-05-02)


### Features

* use sentry minimal ([#74](https://github.com/DiederikvandenB/apollo-link-sentry/issues/74)) ([85d976f](https://github.com/DiederikvandenB/apollo-link-sentry/commit/85d976fe48682a7195719b70722f86347f3f40d5))


### Chores

* **deps:** bump @sentry/browser from 5.15.4 to 5.15.5 ([#69](https://github.com/DiederikvandenB/apollo-link-sentry/issues/69)) ([c738091](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c738091363badcc964ce9782eb119b9e1dd6b249))
* **deps:** bump apollo-link from 1.2.13 to 1.2.14 ([#60](https://github.com/DiederikvandenB/apollo-link-sentry/issues/60)) ([c62f973](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c62f97364266f0df967078037d509fdc97e476fe))
* **deps-dev:** bump @typescript-eslint/parser from 2.26.0 to 2.29.0 ([#67](https://github.com/DiederikvandenB/apollo-link-sentry/issues/67)) ([b60e94b](https://github.com/DiederikvandenB/apollo-link-sentry/commit/b60e94be5e9f68ae030abfe4463c2a41f06f48b2))
* **deps-dev:** bump eslint-config-airbnb-typescript ([#61](https://github.com/DiederikvandenB/apollo-link-sentry/issues/61)) ([8f09087](https://github.com/DiederikvandenB/apollo-link-sentry/commit/8f09087e383857461d0a746621ec657d5e2217f8))
* **deps-dev:** bump jest from 25.2.6 to 25.4.0 ([#65](https://github.com/DiederikvandenB/apollo-link-sentry/issues/65)) ([ad4e01e](https://github.com/DiederikvandenB/apollo-link-sentry/commit/ad4e01e90fd780bf77150e45697c1fbca25d9f25))
* **deps-dev:** bump ts-jest from 25.3.0 to 25.4.0 ([#64](https://github.com/DiederikvandenB/apollo-link-sentry/issues/64)) ([f736b0e](https://github.com/DiederikvandenB/apollo-link-sentry/commit/f736b0e3c9f285b1cce2d538f51fbfd0717757b7))

### [1.2.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.2.0...v1.2.1) (2020-04-02)


### Chores

* **deps:** bump @sentry/browser from 5.14.2 to 5.15.4 ([#47](https://github.com/DiederikvandenB/apollo-link-sentry/issues/47)) ([2f09386](https://github.com/DiederikvandenB/apollo-link-sentry/commit/2f0938658682c3d92c96777737b209ee8b4ee556))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#33](https://github.com/DiederikvandenB/apollo-link-sentry/issues/33)) ([6a6d2da](https://github.com/DiederikvandenB/apollo-link-sentry/commit/6a6d2da98595396b4d0c6579386fab980945487c))
* added more data to package.json ([d14b89a](https://github.com/DiederikvandenB/apollo-link-sentry/commit/d14b89acf0d0b7ac0280fc48f9154180f6267b23))
* **deps-dev:** bump @typescript-eslint/parser from 2.24.0 to 2.26.0 ([#51](https://github.com/DiederikvandenB/apollo-link-sentry/issues/51)) ([69e854a](https://github.com/DiederikvandenB/apollo-link-sentry/commit/69e854a0d12812ebbc11cc05d12e060120510aca))
* update dependencies ([6384f61](https://github.com/DiederikvandenB/apollo-link-sentry/commit/6384f61c72cb2c8537d3c9c7c7d4ad91c0fb236f))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#40](https://github.com/DiederikvandenB/apollo-link-sentry/issues/40)) ([2483697](https://github.com/DiederikvandenB/apollo-link-sentry/commit/2483697ef1b3763527e358c1bdc114c4d61b9113))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#49](https://github.com/DiederikvandenB/apollo-link-sentry/issues/49)) ([7875ca0](https://github.com/DiederikvandenB/apollo-link-sentry/commit/7875ca0c1ccf5fd2a501d214de4bcff5739de729))
* **deps-dev:** bump @typescript-eslint/parser from 2.23.0 to 2.24.0 ([#34](https://github.com/DiederikvandenB/apollo-link-sentry/issues/34)) ([e019eb3](https://github.com/DiederikvandenB/apollo-link-sentry/commit/e019eb34c559553bbbbc8bb65c729c697481f8ca))
* **deps-dev:** bump eslint-config-airbnb-typescript ([#36](https://github.com/DiederikvandenB/apollo-link-sentry/issues/36)) ([59d0503](https://github.com/DiederikvandenB/apollo-link-sentry/commit/59d05038fa499b9a9bc5e52122c25db8cee955d3))
* **deps-dev:** bump eslint-plugin-import from 2.20.1 to 2.20.2 ([#46](https://github.com/DiederikvandenB/apollo-link-sentry/issues/46)) ([766fcf2](https://github.com/DiederikvandenB/apollo-link-sentry/commit/766fcf261bd1fefe6497808e8420e2707d13142e))
* **deps-dev:** bump jest from 25.1.0 to 25.2.0 ([#41](https://github.com/DiederikvandenB/apollo-link-sentry/issues/41)) ([46fc002](https://github.com/DiederikvandenB/apollo-link-sentry/commit/46fc00224d086eeb5cac415cb2417f798c3b0b14))
* **deps-dev:** bump jest from 25.2.0 to 25.2.4 ([#45](https://github.com/DiederikvandenB/apollo-link-sentry/issues/45)) ([d1dcf96](https://github.com/DiederikvandenB/apollo-link-sentry/commit/d1dcf964b243a3f4a6f4998eb1488cf7f22b0247))
* **deps-dev:** bump ts-jest from 25.2.1 to 25.3.0 ([#50](https://github.com/DiederikvandenB/apollo-link-sentry/issues/50)) ([14bf523](https://github.com/DiederikvandenB/apollo-link-sentry/commit/14bf523bf38babdeb567a2bd78c94b2de8f8af48))

## [1.2.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.1.1...v1.2.0) (2020-03-16)


### Chores

* **deps:** [security] bump acorn from 6.4.0 to 6.4.1 ([#29](https://github.com/DiederikvandenB/apollo-link-sentry/issues/29)) ([463218c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/463218c26188b3712ca6ed37a6eb2c98cacba68e))
* drops release-it dependency ([4e69a4e](https://github.com/DiederikvandenB/apollo-link-sentry/commit/4e69a4e1a0a25dfedf1d7ec0a69127d4c1f7119d))
* **deps:** bump @sentry/browser from 5.12.5 to 5.13.0 ([#14](https://github.com/DiederikvandenB/apollo-link-sentry/issues/14)) ([44fbaf7](https://github.com/DiederikvandenB/apollo-link-sentry/commit/44fbaf715947319f0c04debde7ad9126d6e3b631))
* **deps:** bump @sentry/browser from 5.13.0 to 5.13.2 ([#20](https://github.com/DiederikvandenB/apollo-link-sentry/issues/20)) ([a776f76](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a776f76bee581a50c56f60ca3490ee51c5418a32))
* **deps:** bump @sentry/browser from 5.13.2 to 5.14.1 ([#27](https://github.com/DiederikvandenB/apollo-link-sentry/issues/27)) ([f675a5f](https://github.com/DiederikvandenB/apollo-link-sentry/commit/f675a5fe05eb7b0445c94f5e1b66675b8495aa4c))
* **deps:** bump @sentry/browser from 5.14.1 to 5.14.2 ([#32](https://github.com/DiederikvandenB/apollo-link-sentry/issues/32)) ([f119f67](https://github.com/DiederikvandenB/apollo-link-sentry/commit/f119f672f62ceb12d45d11d1fa5ebd257d14dd21))
* **deps:** bump @sentry/types from 5.14.1 to 5.14.2 ([#30](https://github.com/DiederikvandenB/apollo-link-sentry/issues/30)) ([2ebfed8](https://github.com/DiederikvandenB/apollo-link-sentry/commit/2ebfed86fa9d43b5775f777fb802d81e8191bebd))
* **deps-dev:** bump @types/jest from 25.1.3 to 25.1.4 ([#22](https://github.com/DiederikvandenB/apollo-link-sentry/issues/22)) ([e69dd65](https://github.com/DiederikvandenB/apollo-link-sentry/commit/e69dd65c2125e2f0b8ef2e7d20e2917f1b3eb187))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#18](https://github.com/DiederikvandenB/apollo-link-sentry/issues/18)) ([00bccbc](https://github.com/DiederikvandenB/apollo-link-sentry/commit/00bccbcde6992641c1cbc65c737209d525bf5257))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#24](https://github.com/DiederikvandenB/apollo-link-sentry/issues/24)) ([086329c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/086329c7dc67512d6543b42143d57cb618994965))
* **deps-dev:** bump @typescript-eslint/parser from 2.21.0 to 2.22.0 ([#19](https://github.com/DiederikvandenB/apollo-link-sentry/issues/19)) ([5d6a4b9](https://github.com/DiederikvandenB/apollo-link-sentry/commit/5d6a4b9940436bac99c50340ba8300860c91b96c))
* **deps-dev:** bump @typescript-eslint/parser from 2.22.0 to 2.23.0 ([#23](https://github.com/DiederikvandenB/apollo-link-sentry/issues/23)) ([4fe15b2](https://github.com/DiederikvandenB/apollo-link-sentry/commit/4fe15b2da7b50a3e2d40ec36a4a17b0e0d2b4fb9))
* **deps-dev:** bump eslint-config-airbnb-base from 14.0.0 to 14.1.0 ([#31](https://github.com/DiederikvandenB/apollo-link-sentry/issues/31)) ([74d6b84](https://github.com/DiederikvandenB/apollo-link-sentry/commit/74d6b84ad47a6a234e08af2c12d35e7b30f5b320))
* **deps-dev:** bump tsc-watch from 4.1.0 to 4.2.3 ([#15](https://github.com/DiederikvandenB/apollo-link-sentry/issues/15)) ([abf2a97](https://github.com/DiederikvandenB/apollo-link-sentry/commit/abf2a974a72a3967febc36af0f8c26e322de04b5))
* **deps-dev:** bump typescript from 3.8.2 to 3.8.3 ([#16](https://github.com/DiederikvandenB/apollo-link-sentry/issues/16)) ([e74be6b](https://github.com/DiederikvandenB/apollo-link-sentry/commit/e74be6bcc57e82ac933af805a6ad4d7c5276cb70))

### [1.1.1](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.1.0...v1.1.1) (2020-03-01)


### Bug fixes

* allows reading data from `OperationBreadcrumb` ([#13](https://github.com/DiederikvandenB/apollo-link-sentry/issues/13)) ([253d74b](https://github.com/DiederikvandenB/apollo-link-sentry/commit/253d74b370041a99d3524e5f963dbb122a082268))


### Chores

* **deps:** bump @sentry/browser from 5.12.4 to 5.12.5 ([#12](https://github.com/DiederikvandenB/apollo-link-sentry/issues/12)) ([776d21c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/776d21cbfece4a380640f43e7bd32ef5ac988ee5))

## [1.1.0](https://github.com/DiederikvandenB/apollo-link-sentry/compare/v1.0.0...v1.1.0) (2020-02-26)


### ⚠ BREAKING CHANGES

* rename class and methods in OperationBreadcrumb.ts (#11)

### Features

* allow adding keys from the context to the breadcrumb ([#7](https://github.com/DiederikvandenB/apollo-link-sentry/issues/7)) ([15ea217](https://github.com/DiederikvandenB/apollo-link-sentry/commit/15ea21727abd19932d487e0001ca0b70ad2ef876))
* allows altering breadcrumb with beforeBreadcrumb ([8b101e9](https://github.com/DiederikvandenB/apollo-link-sentry/commit/8b101e968eb0859bb2c14d3a7c54766384ca97e1))
* provides callback for filtering operations ([a330abd](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a330abdcb671267590e379bdbdbd5e4a4bea0a4f))


### Documentation

* adds section on beforeBreadcrumb ([1923195](https://github.com/DiederikvandenB/apollo-link-sentry/commit/1923195ba11b6a2ec9149f03358ea42424871714))
* adds section on filter option ([0a0e6ce](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0a0e6ceb31bfb9321212fefe7b3c711bd34f7d2a))


* rename class and methods in OperationBreadcrumb.ts ([#11](https://github.com/DiederikvandenB/apollo-link-sentry/issues/11)) ([72b6b67](https://github.com/DiederikvandenB/apollo-link-sentry/commit/72b6b67c10f25d56554375ef0d9692e8beb27865))

## 1.0.0 (2020-02-25)


### Features

* add setFingerprint and setTransaction methods ([be8535d](https://github.com/DiederikvandenB/apollo-link-sentry/commit/be8535d4c2f5b7c2f23d5ad3dad7ba4988ed22ac))
* allow disabling attaching a breadcrumb ([2ba8188](https://github.com/DiederikvandenB/apollo-link-sentry/commit/2ba8188222a4065f00ad5cd09b32a8229f9564c1))
* show console message when a breadcrumb is flushed multiple times ([5b06a99](https://github.com/DiederikvandenB/apollo-link-sentry/commit/5b06a99af291284d68503815919aac6f3713c209))


### Chores

* add LICENSE ([54ceadf](https://github.com/DiederikvandenB/apollo-link-sentry/commit/54ceadfd285ebdbeae7cb639835c17344d605c6a))
* creates github CI/CD action ([9a49e22](https://github.com/DiederikvandenB/apollo-link-sentry/commit/9a49e2263ffc73aa9eea85f0e8a248b6cfab05b8))
* fix failing action ([2eb812c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/2eb812c1bfb996dd39b58941522bd7ad737bdad6))
* improves jest reporter ([dd56299](https://github.com/DiederikvandenB/apollo-link-sentry/commit/dd56299edae0a20f06a570a7e9e34619356f7e5e))
* **deps-dev:** bump @types/react from 16.9.19 to 16.9.22 ([91931b0](https://github.com/DiederikvandenB/apollo-link-sentry/commit/91931b0d441348d5050771ae98355de0ba6e605b))
* initial commit ([68e12b8](https://github.com/DiederikvandenB/apollo-link-sentry/commit/68e12b8e1bdc23195cdb6c1f7d57866fe944291b))
* prepares for release ([ffd4e37](https://github.com/DiederikvandenB/apollo-link-sentry/commit/ffd4e3738c861329f7e555cb0720db12d06e4dee))
* **deps:** bump @sentry/browser from 5.12.1 to 5.12.4 ([457cefc](https://github.com/DiederikvandenB/apollo-link-sentry/commit/457cefc91ab7e0bd9dd55b5506e8a84cc27935b1))
* **deps:** bump @sentry/browser from 5.12.1 to 5.12.4 ([d7a0d6c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/d7a0d6cc3ee25e18b3ff068ec1a51cf49f9ab994))
* preparing package for release ([fde947e](https://github.com/DiederikvandenB/apollo-link-sentry/commit/fde947e8759de5d498a95284be799d6f0fe2d620))
* small & insignificant improvements ([1090710](https://github.com/DiederikvandenB/apollo-link-sentry/commit/10907102307abdf693a03286aab8e3f45e9e5bbf))
* updates yarn lock file ([315673a](https://github.com/DiederikvandenB/apollo-link-sentry/commit/315673a8636c34c7a4be4c2e09ea4d784e58c133))
* **deps-dev:** bump @types/node from 13.7.1 to 13.7.4 ([#1](https://github.com/DiederikvandenB/apollo-link-sentry/issues/1)) ([e80fbd5](https://github.com/DiederikvandenB/apollo-link-sentry/commit/e80fbd5a9c1c1d9e9cc2cfaf70a9687ea3dbb9ab))
* **deps-dev:** bump @typescript-eslint/eslint-plugin ([#3](https://github.com/DiederikvandenB/apollo-link-sentry/issues/3)) ([9b949a3](https://github.com/DiederikvandenB/apollo-link-sentry/commit/9b949a3456e85aa9119a49254ba6cd609b1f753b))
* **deps-dev:** bump @typescript-eslint/parser from 2.19.2 to 2.20.0 ([#4](https://github.com/DiederikvandenB/apollo-link-sentry/issues/4)) ([0985a65](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0985a65e0dbd0b49addd1dadafb89de4212486c5))
* **deps-dev:** bump typescript from 3.7.5 to 3.8.2 ([#5](https://github.com/DiederikvandenB/apollo-link-sentry/issues/5)) ([5e1b210](https://github.com/DiederikvandenB/apollo-link-sentry/commit/5e1b210dc11a32a5193c1c5e0b9ab14d15924932))


### Documentation

* add return types for Operation.ts ([5868bc1](https://github.com/DiederikvandenB/apollo-link-sentry/commit/5868bc1213cc7e0ec62ab8362e2e5defd51c1d17))
* add screenshots ([119f068](https://github.com/DiederikvandenB/apollo-link-sentry/commit/119f0680c6edd410f9d9397533950a91481b8792))
* add screenshots to Readme ([0403f00](https://github.com/DiederikvandenB/apollo-link-sentry/commit/0403f00e16c135d441140919654be9e81c08b2f9))
* add types to doc blocks ([5be4628](https://github.com/DiederikvandenB/apollo-link-sentry/commit/5be46284da0504d074320192dc0a86145391a15e))
* adds section on compatibility ([a8d6272](https://github.com/DiederikvandenB/apollo-link-sentry/commit/a8d6272e39fc9731281dc8dad6d569d233877af2))
* adds section on size limits & GDPR ([f0985dd](https://github.com/DiederikvandenB/apollo-link-sentry/commit/f0985dd4458c7e03e2f3d714d9c6d847d1386362))
* update README ([c8d51b2](https://github.com/DiederikvandenB/apollo-link-sentry/commit/c8d51b2192702638ed349def6a99bbde80ce7012))
* update README ([d7d61b7](https://github.com/DiederikvandenB/apollo-link-sentry/commit/d7d61b77bfe491ddeb1f730a19bde99cda134d24))
* update README ([1e759aa](https://github.com/DiederikvandenB/apollo-link-sentry/commit/1e759aa4260a451f1a3715c58fdc32ef54fd5d34))
* updates defaultOptions ([8dcf68c](https://github.com/DiederikvandenB/apollo-link-sentry/commit/8dcf68c0555eae7fcf38e0780e40123892870aad))
