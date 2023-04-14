// customer dashboard

function CustomerDashboardCharts() {
  setTimeout(() => {

    $('#poCharts').remove(); // this is my <canvas> element
    $('#poChartsContainer').append('<canvas id="poCharts" style="width:100%;max-width:700px;height: 236px !important;"></canvas>');

    $('#compSerReq').remove(); // this is my <canvas> element
    $('#compSerReqContainer').append('<canvas id="compSerReq" style="width:100%;max-width:600px;height: 236px !important;"></canvas>');

    $('#pendingSerReq').remove(); // this is my <canvas> element
    $('#pendingSerReqContainer').append('<canvas id="pendingSerReq" style="width:100%;max-width:600px;height: 236px !important;"></canvas>');


    let sReqType = JSON.parse(localStorage.getItem("servicerequesttype"));
    let pendingServiceRequest = JSON.parse(localStorage.getItem("pendingservicerequest"));
    let poCost = JSON.parse(localStorage.getItem("costData"))

    new Chart(document.getElementById('poCharts').getContext("2d"), {
      type: "bar",
      data: {
        labels: ["AMC", "Service", "PO"],
        datasets: [{
          backgroundColor: ["#ef3038", "#e03c31", "#ed1c24"],
          data: [poCost?.amcCost, poCost?.othrCost, poCost?.poCost],

        }]
      },
      options: {
        legend: { display: false },
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
              },
              scaleLabel: {
                display: true,
              }
            }
          ]
        }

      }
    });

    new Chart(document.getElementById('compSerReq').getContext("2d"), {
      type: "doughnut",
      data: {
        labels: sReqType?.label,

        datasets: [{
          backgroundColor: ["#8400ff", "#a442ff", "#c484ff", "#e1c1ff", "#f9f1ff"],
          data: sReqType?.chartData,
        }]
      },
      options: {
        legend: { display: false },
      }
    });



    new Chart(document.getElementById('pendingSerReq').getContext("2d"), {
      type: "pie",
      data: {
        labels: pendingServiceRequest?.label,
        datasets: [
          {
            backgroundColor: ["#2aa7ff", "#5abbff", "#89ceff", "#bce3ff", "#eff8ff"],
            data: pendingServiceRequest?.chartData,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
      },
    });

  }, 1500);

}
// distdashboard
function DistributorDashboardCharts() {
  setTimeout(() => {
    var lines = JSON.parse(localStorage.getItem('lines'));
    var xLineValues = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var prevLineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var AMCLineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var PlanLineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var oncallLineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var brkdwLineValues = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    if (lines?.AMC) {
      var amcmonths = Object.keys(lines.AMC)?.map(x => Number.parseInt(x));
      amcmonths?.forEach((x) => AMCLineValues[x] = lines.AMC[x])
    }

    if (lines?.PLAN) {
      var planmonths = Object.keys(lines.PLAN)?.map(x => Number.parseInt(x));
      planmonths?.forEach((x) => PlanLineValues[x] = lines.PLAN[x])
    }

    if (lines?.PREV) {
      var prevmonths = Object.keys(lines.PREV)?.map(x => Number.parseInt(x));
      prevmonths?.forEach((x) => prevLineValues[x] = lines.PREV[x])
    }

    if (lines?.ONCAL) {
      var oncalmonths = Object.keys(lines.ONCAL)?.map(x => Number.parseInt(x));
      oncalmonths?.forEach((x) => oncallLineValues[x] = lines?.ONCAL[x]);
    }

    if (lines?.BRKDW) {
      var brkdwmonths = Object.keys(lines.BRKDW)?.map(x => Number.parseInt(x));
      brkdwmonths?.forEach((x) => brkdwLineValues[x] = lines?.BRKDW[x]);
    }

    var ctx = document.getElementById("chartLine").getContext("2d");


    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: xLineValues,
        datasets: [
          {
            fill: false,
            lineTension: 0,
            backgroundColor: "#233f76",
            borderColor: "#233f76de",
            data: AMCLineValues
          },
          {
            fill: false,
            lineTension: 0,
            backgroundColor: "#77d0f0",
            borderColor: "#77d0f04d",
            data: oncallLineValues
          },
          {
            fill: false,
            lineTension: 0,
            backgroundColor: "#77d0a0",
            borderColor: "#77d0a04d",
            data: brkdwLineValues
          },
          {
            fill: false,
            lineTension: 0,
            backgroundColor: "#f8d877",
            borderColor: "rgb(248 216 119 / 30%)",
            data: prevLineValues
          },
          {
            fill: false,
            lineTension: 0,
            backgroundColor: "#f8a485",
            borderColor: "#f8a4854d",
            data: prevLineValues
          },
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (label, index, labels) {
                  return label > 1000 ? (label / 1000 + 'k') : label;
                }
              },
              scaleLabel: {
                display: true,
                labelString: '1k = $1000'
              }
            }
          ]
        },
        responsive: true,
        legend: {
          display: false,
        },
      }
    });

    var barColors = ["red", "green", "blue", "#f44336", "yellow"];

    $('#serviceRequestRaised').remove(); // this is my <canvas> element
    $('#serviceRequestRaisedContainer').append('<canvas id="serviceRequestRaised" class="engineerChart"></canvas>');
    let instrumentWithHighestServiceRequest = JSON.parse(
      localStorage.getItem("instrumentWithHighestServiceRequest")
    );

    var ctx = document.getElementById("serviceRequestRaised").getContext("2d");


    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: instrumentWithHighestServiceRequest?.label,
        datasets: [{
          backgroundColor: barColors,
          data: instrumentWithHighestServiceRequest?.data,

        }]
      },
      options: {
        responsive: true,
        legend: {
          display: false,
          position: 'top',
        },
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
              },
              scaleLabel: {
                display: true,
              }
            }
          ],
          xAxes: [
            {
              barPercentage: 0.4
            }
          ]
        }

      }
    });

    $('#instrumentsChart').remove(); // this is my <canvas> element
    $('#instrumentsChartContainer').append('<canvas id="instrumentsChart" class="engineerChart"></canvas>');

    var ctx = document.getElementById("instrumentsChart").getContext("2d");

    var data = JSON.parse(localStorage.getItem('instrumentData'))
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Installed", "Under Service"],
        datasets: [{
          backgroundColor: barColors,
          data: [data?.instrumnetInstalled, data?.instrumnetUnderService]
        }]
      },
      options: {
        responsive: true,
        legend: {
          display: false,
          position: 'top',
        },
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
              },
              scaleLabel: {
                display: true,
              }
            }
          ],
          xAxes: [
            {
              barPercentage: 0.4
            }
          ]
        }
      }

    });

    var customerData = JSON.parse(localStorage.getItem('customerrevenue'))
    // Donut Chart
    var datapie = {
      labels: [...customerData?.map(x => x.customer.custname)],
      datasets: [
        {
          data: [...customerData?.map(x => x.total)],
          backgroundColor: [
            "#6f42c1",
            "#007bff",
            "#17a2b8",
            "#00cccc",
            "#adb2bd",
          ],
        },
      ],
    };

    var optionpie = {
      maintainAspectRatio: false,
      height: 30,
      responsive: true,
      legend: {
        display: false,
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    };

    $('#highestServiceRequest').remove(); // this is my <canvas> element
    $('#revenueByCustomer').append('<canvas id="highestServiceRequest" style="width: 100%; max-width: 700px"></canvas>');


    // For a doughnut chart
    var ctxpie = document.getElementById("highestServiceRequest");
    new Chart(ctxpie, {
      type: "doughnut",
      data: datapie,
      options: optionpie,
    });

  }, 500);

}

function EngDashboardCharts() {
  $('#compSerReq').remove(); // this is my <canvas> element
  $('#compSerReqContainer').append('<canvas id="compSerReq" class="chart-canvas" height="170"><canvas>');

  $('#pendingSerReq').remove(); // this is my <canvas> element
  $('#pendingSerReqContainer').append('<canvas id="pendingSerReq" class="chart-canvas" height="170"><canvas>');

  var pendingSerReq = JSON.parse(localStorage.getItem("pendingSerReq"))
  var compSerReq = JSON.parse(localStorage.getItem("compSerReq"))

  new Chart("compSerReq", {
    type: "doughnut",
    data: {
      labels: compSerReq?.compReqLabels,
      datasets: [
        {
          backgroundColor: ["#8400ff", "#a442ff", "#c484ff", "#e1c1ff", "#f9f1ff"],
          data: compSerReq?.compReqValues,
        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
    },
  });

  new Chart("pendingSerReq", {
    type: "doughnut",
    data: {
      labels: pendingSerReq?.pendingReqLabels,
      datasets: [
        {
          backgroundColor: ["#2aa7ff", "#5abbff", "#89ceff", "#bce3ff", "#eff8ff"],
          data: pendingSerReq?.pendingReqValues,

        },
      ],
    },
    options: {
      legend: {
        display: false,
      },
    },
  });

}

function CustomMenu() {
  $(function () {
    "use strict";
    var x = window.matchMedia("(max-width: 700px)");

    function myFunction(x) {
      if (x.matches) {
        $(".wrapper").removeClass("toggled")
      } else {
        $(".wrapper").hasClass("toggled") ? ($(".wrapper").removeClass("toggled"), $(".sidebar-wrapper").unbind("hover")) : ($(".wrapper").addClass("toggled"), $(".sidebar-wrapper").hover(function () {
          $(".wrapper").addClass("sidebar-hovered")
        }, function () {
          $(".wrapper").removeClass("sidebar-hovered")
        }))
      }
    }

    myFunction(x);
    x.addListener(myFunction);

    $(".mobile-search-icon").on("click", function () {
      $(".search-bar").addClass("full-search-bar")
    }),

      $(".mobile-toggle-menu").on("click", function () {
        $(".wrapper").addClass("toggled")
      }),

      $(".toggle-icon").on("click", function () {
        $(".wrapper").removeClass("toggled")
      }),




      $(document).ready(function () {
        $(window).on("scroll", function () {
          $(this).scrollTop() > 300 ? $(".back-to-top").fadeIn() : $(".back-to-top").fadeOut()
        }), $(".back-to-top").on("click", function () {
          return $("html, body").animate({
            scrollTop: 0
          }, 600), !1
        })
      }),
      $(function () {
        for (var e = window.location, o = $(".metismenu li a").filter(function () {
          return this.href == e
        }).addClass("").parent().addClass("mm-active"); o.is("li");) o = o.parent("").addClass("mm-show").parent("").addClass("mm-active")
      }),
      $(function () {
        setTimeout(() => {
          $("#menu").metisMenu();
        }, 200);

      })



    $(".downArrow").click(function () {
      var id = $(this).attr('id');
      $(this).toggleClass('bi-arrow-up-circle-fill', 'bi-arrow-down-circle-fill')
      $("." + id).toggleClass('d-none', 1000);

    })

    $(".customBtnGroup > a").click(function () {
      $(".customBtnGroup > a").removeClass('active');
      $(this).addClass('active');
    })

  });
}