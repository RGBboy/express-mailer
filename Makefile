UNITS = $(shell find test -name "*.test.js")
SPECS = $(shell find test -name "*.spec.js")

unit:
	NODE_ENV=test ./node_modules/.bin/mocha $(UNITS)

spec:
	NODE_ENV=test ./node_modules/.bin/mocha $(SPECS)

test:
	NODE_ENV=test ./node_modules/.bin/mocha $(UNITS) $(SPECS)

.PHONY: test unit spec