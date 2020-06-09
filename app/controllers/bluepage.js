var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
var path = require('path');
var csv = require('fast-csv');

module.exports = function (app) {
  	app.use('/bluepage', router);
};
router.post('/searchEmployee', function (req, res) {
	var employees = req.body.data;
	var promise = [];
	for (var i = 1; i < employees.length; i++){
		var employee = employees[i].split(',');
		if(employee[1].slice(0,3) == 'D23' || employee[1].slice(0,3) == 'd23' || employee[1] == ''){
			
		}else{
			var searchContent = employee[1].split('/');
    		var NotesID = 'CN=' + searchContent[0] + '/OU=' + searchContent[1] + '/%'
			var bpURL = 'https://bluepages.ibm.com/BpHttpApisv3/wsapi?allByNotesIDLite=' + encodeURIComponent(NotesID);
			promise.push(checkAvailable(bpURL));
		}
	}
	Promise.all(promise).then(function(checkResult){
		var header1 = 'Group Name';
		var header2 = 'Members';
		var header3 = 'Check Result';
		var j = 0;
		stream = fs.createWriteStream(path.normalize(__dirname + '/../../tempResult.csv'));
		var csvStream = csv.format({ headers: true });
		csvStream.pipe(stream);
		for (var i = 1; i < employees.length; i++){
			var employee = employees[i].split(',');
			if(employee[1].slice(0,3) == 'D23' || employee[1].slice(0,3) == 'd23' || employee[1] == ''){
				csvStream.write({ header1: employee[0], header2: employee[1], header3:''});
			}else{
				csvStream.write({ header1: employee[0], header2: employee[1], header3: checkResult[j]});
				j++;
			}
		}
		csvStream.end(function(){
			console.log('end');
		})
		res.send('success');
	}).catch(function(err){
		console.log(err);
	});
});

function checkAvailable(bpURL){
	return new Promise(function(resovle, reject){
		request(bpURL, function (error, response, result) {
			if (!error && response.statusCode == 200) {
				//通过返回值判断是否离职
				if(result.indexOf("CNUM") >= 0 ){
					resovle("available");
				}else if(result.indexOf("count=0") >= 0){
					resovle("unavailable");
				}
			}else{
				reject("error during checking");
			}
	  });
	})
}
