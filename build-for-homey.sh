#! /bin/bash

set -xe

rm -rf build persist

npx tsc --build tsconfig.prod.json

rm -rf build/@types build/test

cp package-lock.json build/
cp -R resources/. build/

jq 'del(.scripts) | del(.devDependencies)' package.json > build/package.json

cd build
npm ci --omit=dev

echo "n" | npx homey app publish
