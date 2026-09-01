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

    var data = {"OkPercent": 82.6923076923077, "KoPercent": 17.307692307692307};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6620253164556962, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.45454545454545453, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.8061224489795918, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.7978723404255319, 500, 1500, "POST Login"], "isController": false}, {"data": [0.6862745098039216, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.7560975609756098, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.673469387755102, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.4117647058823529, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.7380952380952381, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.85, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 208, 36, 17.307692307692307, 335.7163461538461, 0, 2862, 220.0, 839.3, 849.55, 1504.1799999999976, 3.522677234698371, 59.214359884666194, 1.2843204344917523], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 55, 9, 16.363636363636363, 572.1272727272725, 0, 1567, 534.0, 855.6, 864.1999999999999, 1567.0, 0.920240266367728, 53.73098605835996, 0.14192483937624442], "isController": true}, {"data": ["TC_03_Login", 49, 5, 10.204081632653061, 257.1020408163265, 0, 545, 219.0, 539.0, 543.5, 545.0, 0.8957133717210493, 1.530367425281053, 0.2301763435700576], "isController": true}, {"data": ["POST Login", 47, 5, 10.638297872340425, 268.04255319148933, 68, 545, 220.0, 539.8, 543.6, 545.0, 0.9028738281850315, 1.6082440064545875, 0.2418894435799908], "isController": false}, {"data": ["TC_02_Search_Product", 51, 12, 23.529411764705884, 211.29411764705878, 0, 545, 214.0, 534.0, 540.2, 545.0, 0.900407831782631, 2.1732614735792093, 0.14701626803022547], "isController": true}, {"data": ["POST Add to Basket", 41, 10, 24.390243902439025, 216.8292682926829, 145, 229, 219.0, 224.8, 226.8, 229.0, 0.8010628736665234, 1.2586250109901918, 0.8143426888359189], "isController": false}, {"data": ["GET Search Product", 49, 12, 24.489795918367346, 219.91836734693877, 0, 545, 214.0, 534.0, 541.0, 545.0, 0.8778215693299892, 2.2052257815299177, 0.14917858182551058], "isController": false}, {"data": ["GET Home Page", 51, 9, 17.647058823529413, 616.9999999999997, 35, 1567, 534.0, 857.2, 865.4, 1567.0, 0.8761230695229425, 55.167233748776006, 0.14571853902183438], "isController": false}, {"data": ["TC_04_Add_To_Basket", 42, 10, 23.80952380952381, 274.4761904761905, 0, 2862, 219.0, 225.0, 228.7, 2862.0, 0.8040585814109314, 1.2332525186656456, 0.7979264382119269], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 323.59999999999997, 220, 553, 229.0, 552.8, 553.0, 553.0, 0.3726754369619498, 0.4741057536429024, 0.13829752543509857], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 26, 72.22222222222223, 12.5], "isController": false}, {"data": ["500/Internal Server Error", 9, 25.0, 4.326923076923077], "isController": false}, {"data": ["The operation lasted too long: It took 1,567 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 2.7777777777777777, 0.4807692307692308], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 208, 36, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 26, "500/Internal Server Error", 9, "The operation lasted too long: It took 1,567 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 47, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 41, 10, "500/Internal Server Error", 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 49, 12, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 51, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 8, "The operation lasted too long: It took 1,567 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
