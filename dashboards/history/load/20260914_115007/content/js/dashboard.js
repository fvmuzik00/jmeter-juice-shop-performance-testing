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

    var data = {"OkPercent": 78.93481717011129, "KoPercent": 21.065182829888712};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7781563126252505, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9549689440993789, 500, 1500, "TC_01_Home_Page"], "isController": true}, {"data": [0.9056603773584906, 500, 1500, "TC_03_Login"], "isController": true}, {"data": [0.9047619047619048, 500, 1500, "POST Login"], "isController": false}, {"data": [0.9122257053291536, 500, 1500, "TC_02_Search_Product"], "isController": true}, {"data": [0.2867132867132867, 500, 1500, "POST Add to Basket"], "isController": false}, {"data": [0.9119496855345912, 500, 1500, "GET Search Product"], "isController": false}, {"data": [0.9545454545454546, 500, 1500, "GET Home Page"], "isController": false}, {"data": [0.2916666666666667, 500, 1500, "TC_04_Add_To_Basket"], "isController": true}, {"data": [0.95, 500, 1500, "POST Register User"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1258, 265, 21.065182829888712, 263.6049284578693, 0, 3204, 202.0, 484.0, 492.0, 538.4100000000001, 4.218079399141631, 19.033705420760125, 1.6848944799071217], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["TC_01_Home_Page", 322, 9, 2.7950310559006213, 410.4440993788821, 0, 3204, 479.0, 492.0, 496.0, 583.5199999999986, 1.0767790262172283, 10.860515367927366, 0.20718643408908505], "isController": true}, {"data": ["TC_03_Login", 318, 27, 8.49056603773585, 217.67295597484286, 0, 707, 202.0, 243.4000000000001, 492.0, 503.0, 1.0934561121789692, 1.9122822490036826, 0.2988307240536275], "isController": true}, {"data": ["POST Login", 315, 27, 8.571428571428571, 219.74603174603186, 1, 707, 202.0, 244.60000000000014, 492.0, 503.0, 1.0874555955631813, 1.9199005614636808, 0.3000212312759134], "isController": false}, {"data": ["TC_02_Search_Product", 319, 27, 8.463949843260188, 204.31034482758628, 0, 609, 199.0, 219.0, 340.0, 492.40000000000003, 1.0885031546118071, 3.8701582776143697, 0.22536749777351628], "isController": true}, {"data": ["POST Add to Basket", 286, 201, 70.27972027972028, 213.7027972027972, 7, 945, 199.0, 231.3, 304.54999999999984, 649.7599999999998, 0.9953261433200042, 2.5147564278579955, 0.9842943037589222], "isController": false}, {"data": ["GET Search Product", 318, 27, 8.49056603773585, 204.95283018867931, 16, 609, 199.5, 219.4000000000001, 340.0, 492.43, 1.0882770657586283, 3.8815222029482728, 0.22602924316832362], "isController": false}, {"data": ["GET Home Page", 319, 9, 2.8213166144200628, 414.3040752351098, 7, 3204, 479.0, 492.0, 496.0, 585.8000000000009, 1.0774697362732384, 10.96968397246879, 0.20926904740191307], "isController": false}, {"data": ["TC_04_Add_To_Basket", 288, 201, 69.79166666666667, 216.5, 0, 1429, 199.0, 232.10000000000002, 363.65000000000117, 722.5000000000034, 0.9936585264872101, 2.493108758168356, 0.9758212454026042], "isController": true}, {"data": ["POST Register User", 10, 0, 0.0, 250.90000000000003, 212, 524, 215.0, 496.30000000000007, 524.0, 524.0, 0.43591979075850046, 0.5554997411726242, 0.16261851569311245], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 74, 27.92452830188679, 5.882352941176471], "isController": false}, {"data": ["The operation lasted too long: It took 3,204 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, 0.37735849056603776, 0.0794912559618442], "isController": false}, {"data": ["500", 1, 0.37735849056603776, 0.0794912559618442], "isController": false}, {"data": ["500/Internal Server Error", 189, 71.32075471698113, 15.023847376788554], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1258, 265, "500/Internal Server Error", 189, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 74, "The operation lasted too long: It took 3,204 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "500", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Login", 315, 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST Add to Basket", 286, 201, "500/Internal Server Error", 189, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["GET Search Product", 318, 27, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET Home Page", 319, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: preview.owasp-juice.shop:443 failed to respond", 8, "The operation lasted too long: It took 3,204 milliseconds, but should not have lasted longer than 1,500 milliseconds.", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["TC_04_Add_To_Basket", 3, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
