/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 79.89296636085626, "KoPercent": 20.10703363914373};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7973805855161787, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9880597014925373, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9270516717325228, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.926605504587156, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9425981873111783, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.2823920265780731, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9422492401215805, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9879154078549849, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.2871287128712871, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [1.0, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1308, 263, 20.10703363914373, 229.9923547400613, 0, 1584, 181.0, 427.0, 435.0, 445.82000000000016, 4.379782015436388, 21.95174637738787, 1.7327873604111907], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 335, 4, 1.1940298507462686, 359.7432835820894, 0, 1584, 420.0, 438.0, 442.0, 469.7599999999999, 1.1171731184803777, 11.787052448151496, 0.2179112864498573], "isController": true}, {"data": ["TC_03_Login", 329, 24, 7.2948328267477205, 184.29179331306975, 0, 453, 181.0, 192.0, 415.0, 440.4, 1.1201029541438703, 1.9599840081045747, 0.3112885854614722], "isController": true}, {"data": ["POST Login", 327, 24, 7.339449541284404, 185.41896024464816, 1, 453, 181.0, 192.2, 415.7999999999997, 440.43999999999994, 1.123738371713409, 1.9783719292646216, 0.3142089919259226], "isController": false}, {"data": ["TC_02_Search_Product", 331, 19, 5.740181268882175, 196.03927492447121, 0, 442, 180.0, 302.8, 308.4, 402.2400000000008, 1.1192604089527307, 5.663128638230352, 0.2379068995556773], "isController": true}, {"data": ["POST Add to Basket", 301, 216, 71.76079734219269, 173.7408637873754, 11, 408, 178.0, 190.0, 207.89999999999998, 338.4600000000005, 1.0462832612058328, 2.6351419792915864, 0.9963154144289761], "isController": false}, {"data": ["GET Search Product", 329, 19, 5.775075987841945, 197.23100303951358, 5, 442, 180.0, 303.0, 308.5, 404.59999999999866, 1.1149065376221652, 5.675391726351443, 0.23842206943088937], "isController": false}, {"data": ["GET Home Page", 331, 4, 1.2084592145015105, 364.0906344410875, 11, 1584, 420.0, 438.0, 442.0, 470.12000000000006, 1.1132898556086601, 11.888027577678034, 0.21977804834570508], "isController": false}, {"data": ["TC_04_Add_To_Basket", 303, 216, 71.2871287128713, 172.59405940594058, 0, 408, 178.0, 190.0, 207.8, 337.91999999999945, 1.0496269147896935, 2.626113956617153, 0.9929020278930559], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 249.89999999999998, 184, 451, 199.5, 450.2, 451.0, 451.0, 0.3573598256084051, 0.4545868250366294, 0.13331196619376048], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 69, 26.23574144486692, 5.275229357798165], "isController": false}, {"data": ["The operation lasted too long: It took 1,584 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 0.38022813688212925, 0.0764525993883792], "isController": false}, {"data": ["500/Internal Server Error", 193, 73.38403041825094, 14.755351681957187], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1308, 263, "500/Internal Server Error", 193, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 69, "The operation lasted too long: It took 1,584 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 327, 24, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 301, 216, "500/Internal Server Error", 193, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 23, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 329, 19, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 19, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 331, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 3, "The operation lasted too long: It took 1,584 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
