These files have been extracted from the `@bitauth/libauth` v3 package to 
provide cash address encoding from locking bytecode.

https://github.com/bitauth/libauth

The reason for this is that our `package.json` ovverrides `@bitauth/libauth` to
v1 in order to avoid top-level await which breaks Next.js hot module reloading
(HMR) for fast refresh.

However v1 does not support P2SH32 address encoding, so we are pulling those 
functions in from v3 here in an isolated manner that does not trigger any
top-level await.

The files are under `vendor/` so that they are ingored by eslint.

