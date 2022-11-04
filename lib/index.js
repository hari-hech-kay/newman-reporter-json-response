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
    summary = _.pick(summary, ['collection', 'run']);

    var executions = [];
    summary.run.executions.forEach(function(executionReport) {
      var assertions = [];
      executionReport.assertions.forEach(function(assertionReport) {

        assertions.push({
          'name': assertionReport.assertion,
          'skipped': assertionReport.skipped,
          'failed': assertionReport.error !== undefined,
          'errorMessage': assertionReport.error ? assertionReport.error.message : undefined
        });
      });

      let responseBody = executionReport.response.stream;
      executionReport.response.header.forEach(function(header) {
        if (header.key === 'Content-Type') {
          if (header.value.includes('application/json'))
            responseBody = JSON.parse(responseBody.toString('utf8'));
        }
      });

        executions.push({
            'request': executionReport.request,
            'response': {
                'header': executionReport.response.header,
                'code': executionReport.response.code,
                'status': executionReport.response.status,
                'body': responseBody,
            },
            'assertions': assertions,
          });
    });

    var lightSummary = {}
    Object.assign(lightSummary, {
        'collection': _.omit(summary.collection, ['_', 'item', 'event']),
        'environment': summary.environment,
        'run': {
          'stats': summary.run.stats,
          'executions': executions
        }
    });
    return lightSummary
}

module.exports = function(newman, options) {
    newman.on('beforeDone', function(err, o) {
        newman.exports.push({
            name: 'newman-reporter-json-response',
            default: 'newman-run-report.json',
            path:  options.jsonExport,
            content: JSON.stringify(createLightSummary(o.summary))
        });
    });
};
