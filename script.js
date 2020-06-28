var Ajv = require("ajv");

const schema = require("./ServerChart.json");

const ajv = new Ajv();

var LineByLineReader = require("line-by-line"),
  lr = new LineByLineReader("here.json");

lr.on("error", function (err) {
  console.log("err: ", err);
  // 'err' contains error object
});

let i = 0;
lr.on("line", function (line) {
  // 'line' contains the current line without the trailing newline character.
  // console.log("line: ", ++i);
  const chart = JSON.parse(line);
  // delete chart._id
  if (!chart.chartData) {
    console.log("skipping");
    return;
	}

  if (chart.chartData.elements == 0) {
    console.log("skipping e");
    return;
  }


	const chartid = chart.chartid
  const dataForServer = {
    title: chart.title || "",
    description: chart.description || "",
    elements: chart.chartData.elements.map((e) => ({
      start: e.start * 1,
      end: e.end * 1,
      color: e.color,
      text: e.text,
      lane: e.lane,
    })),
    colorTags: chart.chartData.colorTags || [],
    shape: chart.chartData.shape,
    lanes: chart.chartData.lanes,
    lanesConfig: chart.chartData.lanesConfig,
  };

  var valid = ajv.validate(schema, dataForServer);
  if (!valid) {
		console.log("error")
		return
    console.log(dataForServer);
    console.log(ajv.errors);
    throw new Error();
    return;
  }

  // upload to firebase here
});

lr.on("end", function () {
  // All lines are read, file is closed now.
  console.log("done");
});
