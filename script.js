var Ajv = require('ajv')

const schema = require('./Structure.json')


const ajv = new Ajv()


var LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader('here.json');

lr.on('error', function (err) {
	console.log('err: ', err);
	// 'err' contains error object
});

let i = 0
lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
	console.log('line: ', ++i);
	const chart = JSON.parse(line)
	// delete chart._id
	if(!chart.chartData){
		console.log('skipping')
		return
	}
	chart.chartData.elements = chart.chartData.elements.map(e => ({
		start: e.start * 1,
		end: e.end * 1,
		color: e.color,
		text: e.text,
		lane: e.lane,
		color: e.color,
	}))
	chart.data = chart.chartData
	delete chart.chartData
	delete chart._id
	delete chart.chartid
	delete chart._updated_at
	delete chart._created_at
	delete chart.data.id
	delete chart.data.metaInfo
	delete chart.metaInfo
	var valid = ajv.validate(schema, chart)
	if (!valid) {
		console.log( chart)
		console.log(ajv.errors)
		throw new Error()
		return
	}
});

lr.on('end', function () {
	// All lines are read, file is closed now.
	console.log('done')
});
