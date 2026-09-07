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

    var data = {"OkPercent": 79.67161845191556, "KoPercent": 20.32838154808444};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.688288643533123, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6395705521472392, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9006309148264984, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9006309148264984, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9117647058823529, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.2733333333333333, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9100946372239748, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.6415384615384615, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.2757475083056478, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.95, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1279, 260, 20.32838154808444, 276.4777169663797, 0, 1850, 212.0, 516.0, 520.0, 545.2, 4.283193071876601, 19.570801878459793, 1.7030102230257629], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 326, 1, 0.3067484662576687, 442.3865030674845, 0, 1850, 511.0, 522.0, 528.0, 855.1500000000046, 1.0855593960826624, 11.217831900003663, 0.21493701424546963], "isController": true}, {"data": ["TC_03_Login", 317, 16, 5.047318611987381, 237.1640378548896, 14, 545, 213.0, 477.59999999999957, 519.0999999999999, 536.8199999999999, 1.0936766857111313, 1.9185197122716044, 0.3133680465709613], "isController": true}, {"data": ["POST Login", 317, 16, 5.047318611987381, 237.1640378548896, 14, 545, 213.0, 477.59999999999957, 519.0999999999999, 536.8199999999999, 1.0888868279043566, 1.9101173784362624, 0.31199562234004186], "isController": false}, {"data": ["TC_02_Search_Product", 323, 28, 8.6687306501548, 204.98452012383916, 0, 511, 211.0, 219.0, 359.0, 371.52, 1.0863387022456605, 3.8113129468955265, 0.2205902909739716], "isController": true}, {"data": ["POST Add to Basket", 300, 215, 71.66666666666667, 214.44666666666663, 15, 699, 209.0, 228.0, 341.19999999999936, 635.6400000000003, 1.035711326539067, 2.59770021378808, 0.9785449162109536], "isController": false}, {"data": ["GET Search Product", 317, 28, 8.832807570977918, 208.864353312303, 4, 511, 211.0, 219.2, 359.09999999999997, 371.64, 1.090373753981412, 3.8978758940978793, 0.2256003612507997], "isController": false}, {"data": ["GET Home Page", 325, 1, 0.3076923076923077, 435.78461538461517, 76, 924, 511.0, 522.0, 527.7, 659.9200000000001, 1.0883797876152428, 11.281583028517225, 0.21615850493454652], "isController": false}, {"data": ["TC_04_Add_To_Basket", 301, 215, 71.42857142857143, 213.73421926910297, 0, 699, 209.0, 228.0, 338.3999999999987, 635.2800000000007, 1.0346807099078412, 2.586493646252634, 0.9743234399868], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 265.1, 220, 546, 236.0, 516.3000000000002, 546.0, 546.0, 0.37721614485099964, 0.4796612716899283, 0.14071930403621274], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 70, 26.923076923076923, 5.473025801407349], "isController": false}, {"data": ["500/Internal Server Error", 190, 73.07692307692308, 14.855355746677091], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1279, 260, "500/Internal Server Error", 190, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 70, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 317, 16, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 300, 215, "500/Internal Server Error", 190, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 25, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 317, 28, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 325, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
