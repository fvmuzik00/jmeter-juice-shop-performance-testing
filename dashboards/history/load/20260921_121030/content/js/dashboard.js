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

    var data = {"OkPercent": 79.9844840961986, "KoPercent": 20.015515903801397};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7944053208137715, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.975609756097561, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9365325077399381, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9359375, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9279141104294478, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.29431438127090304, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9290123456790124, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9754601226993865, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.2966666666666667, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [1.0, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1289, 258, 20.015515903801397, 233.14352211016288, 0, 1516, 181.0, 427.0, 434.0, 506.0, 4.315135446377162, 19.695546940907082, 1.7598367889567348], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 328, 5, 1.524390243902439, 356.7926829268294, 0, 1477, 418.0, 436.0, 440.0, 531.4899999999996, 1.0948003658235368, 11.167356836285622, 0.21345008561472373], "isController": true}, {"data": ["TC_03_Login", 323, 20, 6.191950464396285, 192.26315789473688, 0, 556, 182.0, 194.0, 428.6, 463.9999999999998, 1.099660569167969, 1.915266317660617, 0.30820232307550893], "isController": true}, {"data": ["POST Login", 320, 20, 6.25, 194.06562500000004, 1, 556, 182.0, 194.0, 428.9, 464.7500000000005, 1.1045223286091992, 1.9417689949796006, 0.31246710162986074], "isController": false}, {"data": ["TC_02_Search_Product", 326, 23, 7.0552147239263805, 187.89570552147237, 0, 1292, 179.5, 292.6, 305.65, 425.84000000000015, 1.0957283400387876, 4.036933618105062, 0.22960062004443413], "isController": true}, {"data": ["POST Add to Basket", 299, 209, 69.89966555183946, 188.7892976588629, 7, 718, 179.0, 202.0, 231.0, 572.0, 1.0367832672196178, 2.6223699263935893, 1.0330313210838027], "isController": false}, {"data": ["GET Search Product", 324, 23, 7.098765432098766, 185.61728395061726, 9, 436, 179.5, 291.5, 305.0, 419.0, 1.0981896817622554, 4.070977128250929, 0.23153684485698112], "isController": false}, {"data": ["GET Home Page", 326, 5, 1.5337423312883436, 358.9815950920247, 17, 1477, 418.0, 436.0, 440.0, 531.8700000000003, 1.0960783258916564, 11.248983852807777, 0.21501028413981388], "isController": false}, {"data": ["TC_04_Add_To_Basket", 300, 209, 69.66666666666667, 192.62666666666667, 0, 1516, 179.0, 203.80000000000007, 232.89999999999998, 619.5200000000004, 1.0311510739438436, 2.5994304877430507, 1.023994778079103], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 199.7, 190, 218, 197.5, 217.0, 218.0, 218.0, 0.38611529402679645, 0.4916936947372485, 0.14403910382640256], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 58, 22.48062015503876, 4.499612102404965], "isController": false}, {"data": ["500", 1, 0.3875968992248062, 0.07757951900698215], "isController": false}, {"data": ["500/Internal Server Error", 199, 77.13178294573643, 15.438324282389448], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1289, 258, "500/Internal Server Error", 199, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 58, "500", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 320, 20, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 20, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 299, 209, "500/Internal Server Error", 199, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 10, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 324, 23, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 326, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["TC_04_Add_To_Basket", 2, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
