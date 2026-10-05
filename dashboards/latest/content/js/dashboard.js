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

    var data = {"OkPercent": 80.87679516250945, "KoPercent": 19.12320483749055};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8046875, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9834834834834835, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9740853658536586, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9740061162079511, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9607250755287009, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.2737341772151899, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9603658536585366, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9864457831325302, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.28056426332288403, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.95, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1323, 253, 19.12320483749055, 204.44822373393845, 0, 2917, 154.0, 354.0, 360.0, 473.39999999999986, 4.444937206442639, 22.540258882734964, 1.8496226695997204], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 333, 4, 1.2012012012012012, 306.54354354354354, 0, 2917, 346.0, 360.0, 366.90000000000003, 447.6200000000002, 1.1090573012939, 11.778933219263626, 0.21762751661088076], "isController": true}, {"data": ["TC_03_Login", 328, 8, 2.4390243902439024, 164.1463414634147, 0, 558, 152.0, 167.30000000000007, 347.0, 380.77999999999963, 1.120513249727558, 1.9515703625953547, 0.32884584466372646], "isController": true}, {"data": ["POST Login", 327, 8, 2.4464831804281344, 164.64831804281354, 1, 558, 152.0, 167.59999999999997, 347.0, 380.95999999999947, 1.1227043785470763, 1.9613663732871889, 0.3304965037801147], "isController": false}, {"data": ["TC_02_Search_Product", 331, 13, 3.9274924471299095, 167.69184290030222, 0, 479, 151.0, 250.0, 254.39999999999998, 350.04, 1.116632425521292, 5.953325987511259, 0.24117644795345902], "isController": true}, {"data": ["POST Add to Basket", 316, 227, 71.83544303797468, 169.5664556962024, 10, 637, 153.0, 172.90000000000003, 360.15, 588.5599999999995, 1.0898919420425817, 2.7922923503640447, 1.0777125720415124], "isController": false}, {"data": ["GET Search Product", 328, 13, 3.9634146341463414, 169.22560975609767, 5, 479, 151.0, 250.10000000000002, 254.55, 350.12999999999994, 1.116831467407589, 6.008848037713492, 0.2434257134697366], "isController": false}, {"data": ["GET Home Page", 332, 4, 1.2048192771084338, 299.7048192771084, 57, 671, 346.0, 360.0, 364.69999999999993, 442.67, 1.1154339777316373, 11.882340508899954, 0.21953806922410143], "isController": false}, {"data": ["TC_04_Add_To_Basket", 319, 227, 71.15987460815047, 176.48275862068954, 0, 2865, 153.0, 175.0, 361.0, 600.4000000000001, 1.0951248064650128, 2.7793130140907203, 1.0727030701257505], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 227.2, 152, 563, 164.5, 547.7, 563.0, 563.0, 0.3827604684988134, 0.4862254076398989, 0.1427875966470183], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 38, 15.019762845849803, 2.872260015117158], "isController": false}, {"data": ["500", 1, 0.3952569169960474, 0.07558578987150416], "isController": false}, {"data": ["500/Internal Server Error", 214, 84.58498023715416, 16.17535903250189], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1323, 253, "500/Internal Server Error", 214, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 38, "500", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 327, 8, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 316, 227, "500/Internal Server Error", 214, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 328, 13, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 332, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["TC_04_Add_To_Basket", 4, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
