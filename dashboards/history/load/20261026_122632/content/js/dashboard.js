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

    var data = {"OkPercent": 80.71374335611237, "KoPercent": 19.286256643887622};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8009188361408882, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9803625377643505, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9679878048780488, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9676923076923077, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9424242424242424, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.28044871794871795, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9452887537993921, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9833836858006042, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.28955696202531644, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.9, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1317, 254, 19.286256643887622, 209.2619589977222, 0, 2567, 161.0, 359.0, 363.0, 536.3999999999987, 4.421644233900616, 22.275240035562845, 1.8191518760932406], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 331, 5, 1.5105740181268883, 310.83987915407863, 8, 2397, 356.0, 363.8, 368.4, 432.60000000000014, 1.1024256695320853, 11.714794923013384, 0.21630628282713898], "isController": true}, {"data": ["TC_03_Login", 328, 9, 2.7439024390243905, 173.76524390243918, 0, 907, 160.0, 172.10000000000002, 362.1, 529.0599999999962, 1.12259566020946, 1.9453139706259839, 0.32635864449996577], "isController": true}, {"data": ["POST Login", 325, 9, 2.769230769230769, 175.3692307692309, 19, 907, 161.0, 172.40000000000003, 362.4, 534.6400000000017, 1.1143876011521054, 1.9489159098117543, 0.32696292946783706], "isController": false}, {"data": ["TC_02_Search_Product", 330, 17, 5.151515151515151, 184.83636363636367, 0, 2567, 158.5, 261.0, 268.0, 518.9199999999998, 1.1127146190469768, 5.768604725412379, 0.2387667191693754], "isController": true}, {"data": ["POST Add to Basket", 312, 223, 71.47435897435898, 162.2724358974359, 6, 612, 156.0, 174.0, 185.34999999999997, 546.1000000000001, 1.0854552475846881, 2.7640092111488777, 1.0665686361272209], "isController": false}, {"data": ["GET Search Product", 329, 17, 5.167173252279635, 178.39513677811559, 3, 706, 159.0, 261.0, 268.0, 471.4, 1.1156059367868514, 5.801173388983646, 0.24011475969542942], "isController": false}, {"data": ["GET Home Page", 331, 5, 1.5105740181268883, 304.6646525679759, 8, 1010, 356.0, 363.0, 367.4, 408.4400000000002, 1.1112864399552798, 11.8089528433489, 0.21804484930485843], "isController": false}, {"data": ["TC_04_Add_To_Basket", 316, 223, 70.56962025316456, 160.21835443037978, 0, 612, 156.0, 174.0, 185.14999999999998, 544.8999999999995, 1.0870051288754656, 2.7329184217270313, 1.0545714037243685], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 347.4, 181, 667, 311.5, 655.3000000000001, 667.0, 667.0, 0.36743092298647856, 0.4677209063602293, 0.13706895759847149], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 46, 18.11023622047244, 3.492786636294609], "isController": false}, {"data": ["500/Internal Server Error", 208, 81.88976377952756, 15.793470007593015], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1317, 254, "500/Internal Server Error", 208, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 46, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 325, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 312, 223, "500/Internal Server Error", 208, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 15, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 329, 17, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 331, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
