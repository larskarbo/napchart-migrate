var Ajv = require("ajv");
const fs = require("fs-extra")
const schema = require("./ServerChart.json");

const ajv = new Ajv();

var firebase = require("firebase/app");
require("firebase/firestore");

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE_URL,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
	measurementId: process.env.REACT_APP_MEASUREMENT_ID,
}
firebase.initializeApp(firebaseConfig);
FirebaseServer.instance.db.settings({
	ssl: false,
	host: 'localhost:8080',
})

var LineByLineReader = require("line-by-line"),
	lr = new LineByLineReader("here2.json");

lr.on("error", function (err) {
	console.log("err: ", err);
	// 'err' contains error object
});

let i = 0;
let errors = 0
var db = firebase.firestore();
const already = fs.readFileSync("./already.txt", { encoding: "utf8" }).split("\n")
console.log('already: ', already);
let added = already.length

lr.on("line", async function (line) {
	lr.pause();
	// 'line' contains the current line without the trailing newline character.
	// console.log("line: ", ++i);
	const chart = JSON.parse(line);
	// delete chart._id
	if (!chart.chartData) {
		lr.resume();
		console.log("skipping");
		return;
	}

	if (chart.chartData.elements == 0) {
		// console.log("skipping e");
		// return;
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
		lanesConfig: chart.chartData.lanesConfig || {},
	};

	var valid = ajv.validate(schema, dataForServer);
	if (!valid) {
		errors++
		console.log("some error")
		// console.log(ajv.errors);
		// console.log(dataForServer);
		lr.resume();
		return
	}

	// const idAlreadyAdded = async (id) => {
	// 	return db
	// 		.collection('charts')
	// 		.doc(id)
	// 		.get()
	// 		.then((doc) => {
	// 			return doc.exists
	// 		})
	// }

	const idAlreadyAdded = async (id) => {
		return already.includes(id)
	}

	if (await idAlreadyAdded(chartid)) {
		console.log('already added ', chartid)
		lr.resume();
		return
	}
	console.log(chartid)
	await db
		.collection('charts')
		.doc(chartid)
		.set(dataForServer)
		.then((docRef) => {

			added++
			console.log('added chartid: ', chartid, "number: ", added, "errors: ", errors);
			fs.appendFile("./already.txt", "\n" + chartid)
			lr.resume();
			return chartid
		})

	return
});

lr.on("end", function () {
	// All lines are read, file is closed now.
	console.log("done", errors, "errors");
});
