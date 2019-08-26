/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import * as OfficeHelpers from '@microsoft/office-js-helpers';

//import * as events from './eventHandlers';

// The initialize function must be run each time a new page is loaded
Office.initialize = (reason) => {
    if (!Office.context.requirements.isSetSupported('ExcelApi', '1.7')) {
        console.log("Sorry, this add-in only works with newer versions of Excel.");
    }
    $('#sideload-msg').hide();
    $('#app-body').show();

    $(document).ready(() => {
        switch (reason) {
            case 'inserted': console.log('The add-in was just inserted.');
            case 'documentOpened': console.log('The add-in is already part of the document.');
        }
        // OfficeHelpers.UI.notify(`The document was loaded`);
        $('#run').click(changeColor);

		
        // Event Listeners
        Excel.run(function (context) {
			var sheets = context.workbook.worksheets;
			sheets.onActivated.add(handleSheetActivation);
            sheets.onAdded.add(handleSheetAddition);
		
            var worksheet = context.workbook.worksheets.getActiveWorksheet();
            worksheet.onChanged.add(handleChange);
            worksheet.onSelectionChanged.add(handleSelectionChange);
            //worksheet.onFiltered.add(handleFilter); currently available only in preview
			//worksheet.onColumnSorted.add(handleSort);
			
            context.workbook.worksheets.onActivated.add(({ worksheetId}) => {
                Excel.run(function (context) {
                worksheet = context.workbook.worksheets.getActiveWorksheet();
                console.log(worksheetId);
                worksheet.onChanged.add(handleChange);
                worksheet.onSelectionChanged.add(handleSelectionChange);  
				//worksheet.onFiltered.add(handleFilter); currently available only in preview
                //worksheet.onColumnSorted.add(handleSort);
				//OfficeHelpers.UI.notify("Selected worksheet" + worksheetId);
                return context.sync()
                .then(function () {
                    console.log("Sheet changed.");
                    // OfficeHelpers.UI.notify("Event Handlers Registered");
                });
                }).catch(errorHandle);
            })
            return context.sync()
                .then(function () {
                    console.log("Event handler successfully registered for onChanged event in the worksheet.");
                    console.log("Event handler successfully registered for onSelectionChanged event in the worksheet.");
                    // OfficeHelpers.UI.notify("Event Handlers Registered");
                });
        
            }).catch(errorHandle);
    });
};


//change colour function
async function changeColor() {
    try {
        await Excel.run(async context => {
            var workbook_name = context.workbook.load('name');
            const range = context.workbook.getSelectedRange();

            // Read the range address
            range.load('address');
            range.load('values');
            // Update the fill color
            range.format.fill.color = 'yellow';
            await context.sync();           
            var req = {targetApp:"Excel", eventType:"ColorChange",target:{workbookName: workbook_name._N ,sheetName: name.name, id: range.address, value:range.values}};
            console.log(req);
            postRest(req);
            
        });
    } catch (error) {
        OfficeHelpers.UI.notify(error);
        OfficeHelpers.Utilities.log(error);
    };

}

// Event Handlers

function handleSheetActivation(event){
	return Excel.run(function (context) {
		var name = context.workbook.worksheets.getActiveWorksheet();
		var workbook_name = context.workbook.load('name');
		name.load("name");
		var timeStamp = new Date(Date.now());
		return context.sync()
			.then(function () {
				var eventType = "selectWorksheet";
				var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N, sheetName: name.name}}
				postRest(eventObj);
			});
	}).catch(errorHandle)
}

function handleSheetAddition(event){
	return Excel.run(function (context) {
		var name = context.workbook.worksheets.getActiveWorksheet();
		var workbook_name = context.workbook.load('name');
		name.load("name");
		var timeStamp = new Date(Date.now());
		return context.sync()
			.then(function () {
				var eventType = "addWorksheet";
				var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N, sheetName: name.name}}
				postRest(eventObj);
			});
	}).catch(errorHandle)
}

// Placeholder for filter handler
function handleFilter(event){
	return Excel.run(function (context) {
		var range = context.workbook.worksheets.getActiveWorksheet().getRange(event.address);
        var name = context.workbook.worksheets.getActiveWorksheet();
        var workbook_name = context.workbook.load('name');
        name.load("name");
        range.load(['address', 'values', 'name']);
        var timeStamp = new Date(Date.now());
		return context.sync()
			.then(function () {
				var eventType = "applyFilter";
				var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N, sheetName: name.name, id: event.address}};
				postRest(eventObj);
			});
	}).catch(errorHandle)
}

function handleSort(event){
	return Excel.run(function (context) {
		//var range = context.workbook.worksheets.getActiveWorksheet().getRange(event.address);
        var name = context.workbook.worksheets.getActiveWorksheet();
        var workbook_name = context.workbook.load('name');
        name.load("name");
        //range.load(['address', 'values', 'name']);
        var timeStamp = new Date(Date.now());
		return context.sync()
			.then(function () {
				var eventType = "sortColumn";
				var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N, sheetName: name.name}};
				postRest(eventObj);
			});
	}).catch(errorHandle)
}

function handleChange(event) {
    return Excel.run(function (context) {
        var range = context.workbook.worksheets.getActiveWorksheet().getRange(event.address);
        var name = context.workbook.worksheets.getActiveWorksheet();
        var workbook_name = context.workbook.load('name');
        name.load("name");
        range.load(['address', 'values', 'name']);
        var timeStamp = new Date(Date.now());
        return context.sync()
            .then(function () {
                console.log("Change type of event: " + event.changeType);
                console.log("Address of event: " + event.address);
                console.log("Content of range: " + range.values);
				
                var tmp = range.values;
                if (!event.address.includes(":")) {
                    var eventType = "editCell";
					var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N ,sheetName: name.name, id: event.address, value: tmp[0].toString() } };
					postRest(eventObj);
                } else {
                    var eventType = "editRange";
			var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N ,sheetName: name.name, id: event.address, value: JSON.stringify(tmp).replace(new RegExp(',', 'g'),';')} };
			postRest(eventObj);
                }
                //OfficeHelpers.UI.notify("Change type of event: " + event.changeType + " Address of event: " + event.address + " Value: " + range.values);
            });
    }).catch(errorHandle)
}

function handleSelectionChange(event) {
    return Excel.run(function (context) {
        var range = context.workbook.worksheets.getActiveWorksheet().getRange(event.address);
        var name = context.workbook.worksheets.getActiveWorksheet();
        var workbook_name = context.workbook.load('name');
        name.load("name");
        range.load(['address', 'values']);
        var timeStamp = new Date(Date.now());
        return context.sync()
            .then(function () {
                
                var tmp = range.values;
				if (!event.address.includes(":")) {
                    var eventType = "getCell";
					var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N ,sheetName: name.name, id: event.address, value: tmp[0].toString() } };
					postRest(eventObj);
                } else {
                    var eventType = "getRange";
					var eventObj = { timeStamp: timeStamp, targetApp: "Excel", eventType: eventType, target: { workbookName: workbook_name._N ,sheetName: name.name, id: event.address, value: JSON.stringify(tmp).replace(new RegExp(',', 'g'),';') } };
					postRest(eventObj);
                }
            });
    }).catch(errorHandle)
}

async function postRest(req) {
    if ($('#onoff').prop('checked')) {
        console.log("Recording Enabled")
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:8080",
            crossDomain: true,
            contentType: 'application/json',
            data: JSON.stringify(req),
            success: function (responseData, status, xhr) {
                console.log("Request Successful!" + responseData);
            },
            error: function (request, status, error) {
                console.log("Request Failed! " + JSON.stringify(request) + 'Status ' + status + "Error msg: " + error);
            }
        });
    } else { console.log("Recording Disabled") }
}

function errorHandle(error) {
    console.log("An error has occured" + error)
    OfficeHelpers.UI.notify("An error has occurred")
}