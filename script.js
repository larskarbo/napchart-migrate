var Ajv = require('ajv')

const schema = require('./NapChartData.json')


const ajv = new Ajv()


var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('here.json');

lr.on('error', function (err) {
	console.log('err: ', err);
	// 'err' contains error object
});

lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
	var valid = ajv.validate(schema, JSON.parse(line))
	if (!valid) {
		reject(ajv.errors)
		return
	}
});

lr.on('end', function () {
	// All lines are read, file is closed now.
	console.log('done')
});
