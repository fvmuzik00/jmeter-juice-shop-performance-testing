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

    var data = {"OkPercent": 80.06182380216383, "KoPercent": 19.938176197836167};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7985975847292559, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9879154078549849, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9230769230769231, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9228395061728395, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9435975609756098, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.2895622895622896, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.943076923076923, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9878048780487805, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.29431438127090304, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [1.0, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1294, 258, 19.938176197836167, 218.9080370942814, 0, 2248, 172.0, 397.0, 402.0, 423.0999999999999, 4.355098730155524, 22.10062665020042, 1.7510865397074613], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 331, 3, 0.9063444108761329, 335.664652567976, 0, 1183, 392.0, 405.0, 413.79999999999995, 471.7600000000004, 1.1041246226462298, 11.682812786663774, 0.21597509465116665], "isController": true}, {"data": ["TC_03_Login", 325, 25, 7.6923076923076925, 177.97846153846146, 0, 427, 172.0, 182.40000000000003, 397.0, 419.4000000000001, 1.1170649719358907, 1.9666586717753773, 0.3101164357636085], "isController": true}, {"data": ["POST Login", 324, 25, 7.716049382716049, 178.52777777777771, 1, 427, 172.0, 182.5, 397.0, 419.5, 1.118633885630043, 1.9754992961065325, 0.31151048697689193], "isController": false}, {"data": ["TC_02_Search_Product", 328, 18, 5.487804878048781, 185.57621951219528, 0, 516, 170.0, 279.0, 286.55, 395.67999999999984, 1.1086811764188922, 5.828468637293939, 0.23549968395826223], "isController": true}, {"data": ["POST Add to Basket", 297, 211, 71.04377104377105, 164.4983164983165, 21, 207, 168.0, 178.0, 183.0, 194.0999999999999, 1.033953357215219, 2.6172794287233634, 1.0126438439740013], "isController": false}, {"data": ["GET Search Product", 325, 18, 5.538461538461538, 187.28923076923093, 6, 516, 170.0, 279.0, 286.7, 395.9200000000001, 1.1126364691423114, 5.903255269403524, 0.238521443072383], "isController": false}, {"data": ["GET Home Page", 328, 3, 0.9146341463414634, 338.73475609756116, 14, 1183, 392.0, 405.1, 414.1, 473.46999999999883, 1.1042618447232782, 11.791133017260824, 0.21797756378963812], "isController": false}, {"data": ["TC_04_Add_To_Basket", 299, 211, 70.5685618729097, 170.34113712374588, 0, 2248, 168.0, 178.0, 183.0, 199.0, 1.0304837069841981, 2.5910484536282334, 1.00249489496993], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 234.6, 182, 427, 187.0, 426.2, 427.0, 427.0, 0.41912904983444405, 0.5341439551112788, 0.1563547822624586], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 62, 24.031007751937985, 4.7913446676970635], "isController": false}, {"data": ["500", 1, 0.3875968992248062, 0.07727975270479134], "isController": false}, {"data": ["500/Internal Server Error", 195, 75.5813953488372, 15.069551777434313], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1294, 258, "500/Internal Server Error", 195, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 62, "500", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 324, 25, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 297, 211, "500/Internal Server Error", 195, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 16, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 325, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 328, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["TC_04_Add_To_Basket", 3, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
