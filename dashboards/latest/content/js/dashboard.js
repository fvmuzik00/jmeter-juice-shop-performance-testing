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

    var data = {"OkPercent": 80.0, "KoPercent": 20.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7965868968222832, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9893617021276596, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9226006191950464, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.921875, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9235474006116208, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.29931972789115646, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9892966360856269, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.3016949152542373, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.95, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1285, 257, 20.0, 232.52529182879363, 0, 2783, 181.0, 428.0, 436.0, 456.0, 4.326089518070261, 21.959655033287323, 1.714950731816116], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 329, 3, 0.9118541033434651, 356.5775075987841, 0, 706, 422.0, 438.0, 443.5, 466.39999999999986, 1.1002534930540229, 11.676836016664327, 0.21374367939482714], "isController": true}, {"data": ["TC_03_Login", 323, 25, 7.739938080495356, 188.04643962848294, 0, 467, 181.0, 193.0, 428.6, 453.31999999999994, 1.1053807745878779, 1.9303791918058089, 0.3026703084200584], "isController": true}, {"data": ["POST Login", 320, 25, 7.8125, 189.809375, 0, 467, 181.0, 193.0, 428.9, 453.53000000000014, 1.104503266913569, 1.9469296966412746, 0.30526531484383357], "isController": false}, {"data": ["TC_02_Search_Product", 327, 23, 7.033639143730887, 202.59633027522943, 0, 2783, 179.0, 300.2, 308.0, 513.3999999999965, 1.1035069247590508, 5.792910432021274, 0.2285395111160606], "isController": true}, {"data": ["POST Add to Basket", 294, 206, 70.06802721088435, 174.35374149659867, 5, 412, 178.0, 188.0, 192.0, 275.0500000000016, 1.0217593027014065, 2.559027560567042, 0.9918215542123244], "isController": false}, {"data": ["GET Search Product", 324, 23, 7.098765432098766, 196.4228395061729, 8, 558, 179.0, 300.0, 308.0, 399.5, 1.1005247872828248, 5.8307486710483865, 0.23003228970296022], "isController": false}, {"data": ["GET Home Page", 327, 3, 0.9174311926605505, 358.75840978593266, 84, 706, 422.0, 438.0, 443.59999999999997, 466.63999999999965, 1.1034808578129482, 11.782715033239409, 0.2156817875040073], "isController": false}, {"data": ["TC_04_Add_To_Basket", 295, 206, 69.83050847457628, 173.7627118644068, 0, 412, 178.0, 188.0, 192.0, 273.6400000000029, 1.0189173226306718, 2.543259192706624, 0.9857100893106937], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 305.80000000000007, 181, 555, 198.0, 546.2, 555.0, 555.0, 0.38728166995856084, 0.4932924630146005, 0.14371780721118468], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 68, 26.459143968871594, 5.291828793774319], "isController": false}, {"data": ["500/Internal Server Error", 189, 73.5408560311284, 14.70817120622568], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1285, 257, "500/Internal Server Error", 189, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 68, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 320, 25, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 25, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 294, 206, "500/Internal Server Error", 189, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 17, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 324, 23, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 327, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
