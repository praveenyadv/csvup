const express = require('express')
const csv = require('fast-csv');
const fs = require('fs');
const bodyParser = require('body-parser')
const app = express()
const multer = require('multer');
const db = require('./queries')
const port = 3000
const upload = multer({ dest: 'uploads/' });
const validation = require('./validation')

app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)

app.get('/', (request, response) => {
	response.json({ status: 'ok' })
})

app.post("/upload", upload.single("file"), function (request, response) {
    const file = request.file
    if(!file) {
    	return response.json({status: 'error', message: 'Please provide a file'})
    }

    // open uploaded file
    csv.parseFile(request.file.path, {headers: true})
        .on("data", function (data) {
        	let names = Object.keys(data).join(',').toLowerCase().replace(/ /g, '_');
        	let values = Object.values(data).map(s => s.trim());
        	let validate = validation.validateRow(values);
        	if(validate === true) {
        		db.addSales(names, values);
        	} else {
        		console.log(validate);
        	}
        })
        .on("end", function () {
            return response.json({status: 'ok'})
        });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})