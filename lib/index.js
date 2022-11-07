var _ = require('lodash');

/**
 * Custom reporter that dumps a MUCH lighter JSON report out
 * Provides JSON response bodies if content-type is application/json
 *
 * @param {Object} newman - The collection run object, with event hooks for reporting run details.
 * @param {Object} options - A set of collection run options.
 * @param {String} options.export - The path to which the summary object must be written.
 * @returns {*}
 */

function createLightSummary(summary) {
  //console.log(summary.collection);
  let collection = _.pick(summary.collection, ['id', 'name', 'events', 'variables']);
  Object.assign(collection, {
    'itemCount': summary.collection.items.members.length,
  });

  var executions = [];
  summary.run.executions.forEach(function (executionReport) {
    var assertions = [];
    executionReport.assertions.forEach(function (assertionReport) {

      assertions.push({
        'name': assertionReport.assertion,
        'skipped': assertionReport.skipped,
        'failed': assertionReport.error !== undefined,
        'errorMessage': assertionReport.error ? assertionReport.error.message : undefined
      });
    });

    let responseBody = executionReport.response.stream;
    //console.log(typeof executionReport.response.headers);
    executionReport.response.headers?.members.forEach(function (header) {
      if (header.key === 'Content-Type') {
        if (header.value.includes('application/json'))
          responseBody = JSON.parse(responseBody.toString('utf8'));
      }
    });

    executions.push({
      'id': executionReport.id,
      'request': executionReport.request,
      'response': {
        'headers': executionReport.response.headers,
        'code': executionReport.response.code,
        'status': executionReport.response.status,
        'body': responseBody,
      },
      'assertions': assertions,
    });
  });

  var lightSummary = {}
  Object.assign(lightSummary, {
    'collection': collection,
    'environment': summary.environment,
    'run': {
      'stats': summary.run.stats,
      'executions': executions
    }
  });
  return lightSummary
}

module.exports = function (newman, options) {
  newman.on('beforeDone', function (err, o) {
    if(err) return;
    console.log(options);
    newman.exports.push({
      name: 'json-response-reporter',
      default: 'newman-run-report.json',
      path: options.jsonResponseExport,
      content: JSON.stringify(createLightSummary(o.summary))
    });
  });
};
