$(function() {
    "use strict";

  var xLineValues = [50,60,70,80,90,100,110,120,130,140,150];
  var yLineValues = [7,8,8,9,9,9,10,11,14,14,15];

  var ctx = document.getElementById("chartLine").getContext("2d");

  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xLineValues,
      datasets: [{
        fill: false,
        lineTension: 0,
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: yLineValues
      }]
    },
    options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true
          }
        }
      }
  });
});

