> [!NOTE]
>
> This is a fork of [faga295/napi-tokei](https://github.com/faga295/napi-tokei) with an updated version of its [tokei](https://github.com/XAMPPRocky/tokei) dependency and some modernization to the repo template.
>
> The original readme is below.

---

# napi-tokei

`napi-tokei` is a node binding built with `tokei`, helping you count your code quickly.

## Install

Choose your preferred package manager.

```

# NPM
$ npm install @kitschpatrol/tokei

# YARN
$ yarn add @kitschpatrol/tokei

# PNPM
$ pnpm install @kitschpatrol/tokei

```

## Examples

```ts
import tokei from '@kitschpatrol/tokei'
import process from 'process'

const include = [process.cwd()]

const exclude = ['node_modules']

console.log(tokei({ include, exclude, languages: ['TypeScript'] }))
```
