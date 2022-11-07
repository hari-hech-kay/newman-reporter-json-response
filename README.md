# newman-reporter-json-response
JSON Reporter which cuts out a bunch of unnecessary items in the **Newman JSON report** and also provides **JSON response body** for responses with Content-Type as *application/json*. This can help get around issues with *JSON.stringify* running out of memory.

> This reporter is based on [newman-reporter-json-light](https://www.npmjs.com/package/newman-reporter-json-light). It is further slimmed down and provides JSON response body instead of byte array streams.


## The report object contains the following items:  
```
collection.id \
collection.name  \
collection.events[*].** \
collection.variables[*].** \
collection.itemCount \
environment.**

run.stats.** 

run.executions.** \
run.executions[*].id \
run.executions[*].request.** \

run.executions[*].response.** \
run.executions[*].response.code \
run.executions[*].response.status \
run.executions[*].response.body \
run.executions[*].response.headers \

run.executions[*].assertions.** \
run.executions[*].assertions[*].name \
run.executions[*].assertions[*].skipped \
run.executions[*].assertions[*].failed \
run.executions[*].assertions[*].errorMessage
```

## Options
Option | Value | Optional
--|--|--
--reporter-json-response-export | <path/to/generate/json/report> | Yes

*By default the report gets generated in `newman/` folder under the current working directory*