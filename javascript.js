// Web App: Stock Market Search
// Author: Jibin Lyu
// Date: March 20, 2016
// *****************************************************

// define some global variable

var server_url = "http://storied-coil-127205.appspot.com/";
var currSymbol = "";
var currDetails = {};
var autoRefresh = null;

// jQuery Document Ready

$(function() {

    // ****************  autocomplete  *****************

    $( "#input" ).autocomplete({
        source: function(request, response) {
            $.ajax({
                url: server_url,
                dataType: "json",
                type: "get",
                data: {
                    query: request.term
                },
                success: function(data) {
                    var parsed = [];
                    for (var i = 0; i < data.length; i++) {
                        parsed[parsed.length] = {
                            label: data[i].Symbol + " - " + data[i].Name + " ( " + data[i].Exchange + " ) ",
                            value: data[i].Symbol
                        };
                    };
                    response(parsed);
                }
            });
        }
    });

    // ****************  validation and get quote  ****************

    $( "#search_form" ).submit(function( event ) {
    
        event.preventDefault(); // leave the input value in the form

        // validation (call "look up" another time)
        var valid = false;
        var validData = [];
        $.ajax({
            url: server_url,
            dataType: "json",
            type: "get",
            data: {
                query: $("#input").val()
            },
            success: function(data) {
                validData = [];
                for (var i = 0; i < data.length; i++) {
                    validData[i] = data[i].Symbol;
                };
                generate();
            }
        });

        function generate() {

            for (var i = 0; i < validData.length; i++) {

                if (validData[i] == $("#input").val()) {

                    // validation is true
                    $("#invalid_entry").html("");
                    currSymbol = $("input").val();  // set the current symbol when passing validation

                    // generate details and charts
                    getStockDetails();
                    
                    valid = true;
                    break;
                }
            };

            // validation is false
            if (valid == false) {
                var invalid_hint = "Select a valid entry";
                $("#invalid_entry").html(invalid_hint);
            };
        };
    });

    // ************* end of get quote **************

    // ************  initialize the web page  **************

    // localStorage.clear();
    init();

    function init() {
        var favoriteArray = localStorage.getItem("key");
        if (favoriteArray) {
            favoriteArray = JSON.parse(favoriteArray);
            for (var i = 0; i < favoriteArray.length; i++) {
                var tempItem = favoriteArray[i];
                var tempRow = "<tr id=\"" + tempItem + "\"></tr>";
                $("#favorite_list_table").append(tempRow);
                initGenFavoriteList(tempItem);
            }
        }
    };

    function initGenFavoriteList(companySym) {
        $.ajax({
            url: server_url,
            dataType: "json",
            type: "get",
            data: {
                symbol: companySym
            },
            success: function(data) {
                genFavoriteListRow(data);
            }
        });
    };

    function genFavoriteListRow(symbolDetails) {
        var oneDetail = "";
        oneDetail += "<td class=\"text-primary\"><a href=\"javascript:void(0)\" class=\"local-symbol\">" + symbolDetails.Symbol + "</a></td>";
        oneDetail += "<td>" + symbolDetails.Name + "</td>";
        oneDetail += "<td>$ " + symbolDetails.LastPrice.toFixed(2) + "</td>";
        oneDetail += "<td id=\"_" + symbolDetails.Symbol + "\">" + symbolDetails.Change.toFixed(2) + " ( " + symbolDetails.ChangePercent.toFixed(2) + "% ) " + picSelect(symbolDetails.ChangePercent) +"</td>"
        oneDetail += "<td>" + numFormat(symbolDetails.MarketCap) + "</td>";
        oneDetail += "<td><button title=\"delete this stock from the favorite list\" class=\"btn btn-default btn-sm delete-button\" type=\"button\" style=\"height:30px;\"><span class=\"glyphicon glyphicon-trash\"></span></button></td>";

        var rowTag = "#" + symbolDetails.Symbol;
        $(rowTag).html(oneDetail);

        var tempId = "#_" + symbolDetails.Symbol;
        if (symbolDetails.ChangePercent > 0) {
            $(tempId).css("color", "green");
        }
        else if (symbolDetails.ChangePercent < 0) {
            $(tempId).css("color", "red");
        }  
    };

    // *****************************************************
    
    // *************  getStockDetails  ****************

    function getStockDetails() {
        $.ajax({
            url: server_url,
            dataType: "json",
            type: "get",
            data: {
                symbol: currSymbol
            },
            success: function(data) {

                // deal with the stock details
                // console.log(data);

                if (data.Status == "Failure|APP_SPECIFIC_ERROR") {
                    var status_failure_hint = "No stock details are available! (Status: Failure) Please try another one."
                    $("#invalid_entry").html(status_failure_hint);
                }

                else {
                    currDetails = data;   // set global variable currDetails to data (stock details)
                    $("#myCarousel").carousel(1);

                    var detailTableData;
                    detailTableData += "<tr><th>Name</th><td>" + data.Name + "</td></tr>";
                    detailTableData += "<tr><th>Symbol</th><td>" + data.Symbol + "</td></tr>";
                    detailTableData += "<tr><th>Last Price</th><td>$ " + data.LastPrice.toFixed(2) + "</td></tr>";
                    detailTableData += "<tr><th>Change (Change Percent)</th><td id=\"change\">" + data.Change.toFixed(2) + " ( " + data.ChangePercent.toFixed(2) + "% ) " + picSelect(data.ChangePercent) +"</td></tr>";
                    detailTableData += "<tr><th>Time and Date</th><td>" + moment(data.Timestamp).format('DD MMMM YYYY, hh:mm:ss a') + "</td></tr>";
                    detailTableData += "<tr><th>Market Cap</th><td>" + numFormat(data.MarketCap) + "</td></tr>";
                    detailTableData += "<tr><th>Volume</th><td>" + data.Volume + "</td></tr>";
                    detailTableData += "<tr><th>Change YTD (Change Percent YTD)</th><td id=\"changeYTD\">" + data.ChangeYTD.toFixed(2) + " ( " + data.ChangePercentYTD.toFixed(2) + "% ) " + picSelect(data.ChangePercentYTD) +"</td></tr>";
                    detailTableData += "<tr><th>High Price</th><td>$ " + data.High.toFixed(2) + "</td></tr>";
                    detailTableData += "<tr><th>Low Price</th><td>$ " + data.Low.toFixed(2) + "</td></tr>";
                    detailTableData += "<tr><th>Opening Price</th><td>$ " + data.Open.toFixed(2) + "</td></tr>";
                    
                    $("#stock_details_table").html(detailTableData);

                    // change the color of Change and ChangePercent
                    if (data.ChangePercent > 0) {
                        $("#change").css("color", "green");
                    }
                    if (data.ChangePercentYTD > 0) {
                        $("#changeYTD").css("color", "green");
                    }
                    if (data.ChangePercent < 0) {
                        $("#change").css("color", "red");
                    }
                    if (data.ChangePercentYTD < 0) {
                        $("#changeYTD").css("color", "red");
                    }

                    getStockChart();
                    getHistoricalChart();
                    getNewsFeeds();
                    checkLocalStorage();

                    $("#next").prop('disabled', false);
                    
                }

            }
        });
    };

    function numFormat(num) {
        if (num>1000000000) { return (num/1000000000).toFixed(2) + ' Billion'; }
        else if (num>1000000) { return (num/1000000).toFixed(2) + ' Million'; }
        else { return num;}
    };

    function picSelect(num) {

        if (num > 0) {
            return "<img src=\"images/up.png\" height=\"20\" width=\"20\">";
        }
        else if (num < 0) {
            return "<img src=\"images/down.png\" height=\"20\" width=\"20\">";
        }
        else {
            return "";
        }       
    };

    // **************  get stock chart  *****************

    function getStockChart() {
        var dailyChartURL = "http://chart.finance.yahoo.com/t?s=" + currSymbol + "&lang=en-US&width=400&height=300";
        var dailyChart = "<img src=\"" + dailyChartURL + "\" style=\"width:100%;\" />"
        $("#daily_chart").html(dailyChart);
    };

    // **************  get historical chart  ************************************

    function getHistoricalChart() {

        // © 2016 GitHub MarkitTimeseriesServiceSample.js

        //Make JSON request for timeseries data
        $.ajax({
            
            url: server_url,
            dataType: "json",
            type: "get",
            data: { 
                params: currSymbol
            },
            
            success: function(json){
                // console.log(json);
                
                render(json);

            },
            
        });


        function _fixDate(dateIn) {
            var dat = new Date(dateIn);
            return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
        };

        function _getOHLC(json) {
            var dates = json.Dates || [];
            var elements = json.Elements || [];
            var chartSeries = [];

            if (elements[0]){

                for (var i = 0, datLen = dates.length; i < datLen; i++) {
                    var dat = _fixDate( dates[i] );
                    var pointData = [
                        dat,
                        elements[0].DataSeries['open'].values[i],
                        elements[0].DataSeries['high'].values[i],
                        elements[0].DataSeries['low'].values[i],
                        elements[0].DataSeries['close'].values[i]
                    ];
                    chartSeries.push( pointData );
                };
            }
            return chartSeries;
        };

        function _getVolume(json) {
            var dates = json.Dates || [];
            var elements = json.Elements || [];
            var chartSeries = [];

            if (elements[1]){

                for (var i = 0, datLen = dates.length; i < datLen; i++) {
                    var dat = _fixDate( dates[i] );
                    var pointData = [
                        dat,
                        elements[1].DataSeries['volume'].values[i]
                    ];
                    chartSeries.push( pointData );
                };
            }
            return chartSeries;
        };

        function render(data) {
            
            // split the data set into ohlc and volume
            var ohlc = _getOHLC(data),
                volume = _getVolume(data);

            // set the allowed units for data grouping
            var groupingUnits = [[
                'week',                         
                [1]                             
            ], [
                'month',
                [1, 2, 3, 4, 6]
            ]];

            // create the chart
            $('#historical_chart').highcharts('StockChart', {

                rangeSelector : {
                    buttons: [{
                        type: 'week',
                        count: 1,
                        text: '1w'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],

                    selected : 0
                },

                title : {
                    text : currSymbol + " Stock Value",
                    style: { fontSize: '20px'}
                },

                yAxis: {
                    min: 0,
                    title: {
                        text: 'Stock Value',
                    }
                },

                series : [{
                    name : currSymbol + " Stock Value",
                    data : ohlc,
                    type : 'area',
                    threshold : null,
                    tooltip : {
                        valueDecimals : 2
                    },
                    fillColor : {
                        linearGradient : {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops : [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    }
                }]

            });

        };
    
    };

    $("#highchart_pill").click(function(){
        setTimeout(function(){
            $("#historical_chart").highcharts().reflow();
        },200);
    });

    // **************  end of get historical chart  **************

    // ********************  get news feeds  *********************

    function getNewsFeeds() {

        $.ajax({
            
            url: server_url,
            dataType: "json",
            type: "get",
            data: { 
                newsQuery: currSymbol
            },
            
            success: function(news){
                // console.log(news.d.results);
                
                renderNews(news.d.results);

            },
            
        });

        function renderNews(newsData) {
            var newsDataParsed = "";
            for (var i = 0; i < newsData.length; i++) {
                newsDataParsed += "<div class=\"well\">";
                newsDataParsed += "<div class=\"text-primary news_feed_title\"><a href=\"" + newsData[i].Url + "\">" + newsData[i].Title + "</a></div>";
                newsDataParsed += "<div class=\"news_feed_des\">" + newsData[i].Description + "</div>";
                newsDataParsed += "<div class=\"news_feed_pub\"><b>Publisher: " + newsData[i].Source + "</b></div>";
                newsDataParsed += "<div class=\"news_feed_date\"><b>Date: " + moment(newsData[i].Date).format('DD MMM YYYY HH:mm:ss') + "</b></div>";
                newsDataParsed += "</div>";
            };
            var strReplace = "<strong>" + currSymbol + "</strong>";
            var res = newsDataParsed.replace(new RegExp(currSymbol, "g"), strReplace);
            $("#news").html(res);
        };
    };

    // ******* check local storage (change the color of star) *******

    function checkLocalStorage() {

        var flag = false;
        var favoriteArray = localStorage.getItem("key");
        if (favoriteArray) {
            favoriteArray = JSON.parse(favoriteArray);
            for (var i = 0; i < favoriteArray.length; i++) {
                if (favoriteArray[i] == currSymbol) {
                    $("#favorite_star").css("color", "yellow");
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                $("#favorite_star").css("color", "white");
            }
        }
        else {
            $("#favorite_star").css("color", "white");
        }
    };

    // ****************** clear the page *********************

    $( "#clear" ).click(function() {
        $("#input").val("");
        $("#myCarousel").carousel(0);
        $("#next").prop('disabled', true);
        $("#invalid_entry").html("");
    });

    // ********* add to / delete from favorite list **********

    $("#favorite_star_button").click(function() {

        var favoriteArray = localStorage.getItem("key");   // string
        
        if (favoriteArray) {
            favoriteArray = JSON.parse(favoriteArray);
            var index = favoriteArray.indexOf(currSymbol);
            if (index > -1) {
                favoriteArray.splice( index, 1 );
                localStorage.setItem("key", JSON.stringify(favoriteArray));
                $("#favorite_star").css("color", "white");
                deleteFromFavoriteList(currSymbol);
            }
            else {
                favoriteArray.push(currSymbol);
                localStorage.setItem("key", JSON.stringify(favoriteArray));
                $("#favorite_star").css("color", "yellow");
                addToFavoriteList();
            }   
        }
        else {
            var newArray = [currSymbol];
            localStorage.setItem("key", JSON.stringify(newArray));
            $("#favorite_star").css("color", "yellow");
            addToFavoriteList();
        }
    });

    function addToFavoriteList() {
        var tempRow = "<tr id=\"" + currDetails.Symbol + "\"></tr>";
        $("#favorite_list_table").append(tempRow);
        genFavoriteListRow(currDetails);
    };

    function deleteFromFavoriteList(sym) {
        var deleteId = "#" + sym;
        $(deleteId).remove();
    };
    
    // *******************************************************************

    // ********* check the detail of one symbol in favorite list *********

    $( document ).on( 'click', '.local-symbol', function() {
    
        currSymbol = $(this).text();

        // *** generate details and charts ***
        getStockDetails();

    });

    // ********* delete one row of favorite list ********

    $( document ).on( 'click', '.delete-button', function() {
        var toDeleteSymbol = $(this).closest('tr').attr('id');
        deleteFromFavoriteList(toDeleteSymbol);
        var favoriteArray = JSON.parse(localStorage.getItem("key"));
        var index = favoriteArray.indexOf(toDeleteSymbol);
        favoriteArray.splice( index, 1 );
        localStorage.setItem("key", JSON.stringify(favoriteArray));
        $("#favorite_star").css("color", "white");
    });

    // ******* refresh the data in favorite list ********

    $("#refresh").click(function() {
        refreshFavoriteList();
    });

    // function refresh
    function refreshFavoriteList() {
        var favoriteArray = localStorage.getItem("key");
        if (favoriteArray) {
            favoriteArray = JSON.parse(favoriteArray);
            for (var i = 0; i < favoriteArray.length; i++) {
                var tempItem = favoriteArray[i];
                fillWithNewData(tempItem);
            }
        }
    };

    function fillWithNewData(tempItem) {
        $.ajax({
            url: server_url,
            dataType: "json",
            type: "get",
            data: {
                symbol: tempItem
            },
            success: function(data) {
                var price = "$ " + data.LastPrice.toFixed(2);
                var change = data.Change.toFixed(2) + " ( " + data.ChangePercent.toFixed(2) + "% ) " + picSelect(data.ChangePercent);
                var price_id = "#" + tempItem + " td:nth-child(3)";
                var change_id = "#" + tempItem + " td:nth-child(4)";
                $(price_id).html(price);
                $(change_id).html(change);

                var tempId = "#_" + data.Symbol;
                if (data.ChangePercent > 0) {
                    $(tempId).css("color", "green");
                }
                else if (data.ChangePercent < 0) {
                    $(tempId).css("color", "red");
                }  
            }
        });
    };

    // **********************************************

    // *************** auto refresh *****************

    $(".toggle").click(function() {
        if ($("#toggle").prop("checked") == false) {  // from off to on
            autoRefresh = setInterval(function(){
                refreshFavoriteList();
                // console.log("count...");
            }, 5000);
        }
        else {
            clearInterval(autoRefresh);
        }
    });

    // ************** share to facebook ****************

    $("#facebook").click(function() {
              
        FB.ui({

            method: 'feed',
            link: 'http://dev.markitondemand.com/',                
            picture: 'http://chart.finance.yahoo.com/t?s=' + currDetails.Symbol + '&lang=en-US&width=300&height=300',
            name: 'Current Stock Price of ' + currDetails.Name + ' is $' + currDetails.LastPrice.toFixed(2), 
            description: 'Stock information of ' + currDetails.Name + ' (' + currDetails.Symbol + ')',
            caption: 'LAST TRADE PRICE: $' + currDetails.LastPrice.toFixed(2) + ', CHANGE: ' + currDetails.Change.toFixed(2) + ' (' + currDetails.ChangePercent.toFixed(2) + '%)'
        
        }, function(response){

            if (response && !response.error_message) {
                alert('Posted Successfully');
            } else {
                alert('Not Posted');
            }

        });

    });

    // ************** end of all the functions **************

});



