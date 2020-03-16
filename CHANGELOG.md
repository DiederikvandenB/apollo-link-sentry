# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
