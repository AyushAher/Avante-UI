// customer dashboard

function CustomerDashboardCharts() {
  $('#poCharts').remove(); // this is my <canvas> element
  $('#poChartsContainer').append('<canvas id="poCharts" style="width:100%;max-width:700px"></canvas>');

  $('#compSerReq').remove(); // this is my <canvas> element
  $('#compSerReqContainer').append('<canvas id="compSerReq" style="width:100%;max-width:600px"></canvas>');

  $('#pendingSerReq').remove(); // this is my <canvas> element
  $('#pendingSerReqContainer').append('<canvas id="pendingSerReq" style="width:100%;max-width:600px"></canvas>');


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
      title: {
        display: true,
        text: "Cost"
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
      title: {
        display: true,
        text: "Completed Service Request"
      }
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
      title: {
        text: "Pending Service Request",
        display: true

      },
    },
  });



}
// distdashboard
function DistributorDashboardCharts() {

  var xLineValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
  var yLineValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];

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
      legend: {
        display: false,
      },
      title: {
        display: true
      },
    }
  });

  var barColors = ["red", "green", "blue"];

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
      title: {
        text: "Instruments with Highest Service Request",
        display: true
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
        data: [data.instrumnetInstalled, data.instrumnetUnderService]
      }]
    },
    options: {
      responsive: true,
      legend: {
        display: false,
        position: 'top',
      },
      title: {
        text: "Instruments",
        display: true
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
    title: {
      text: "Customer Revenue",
      display: true

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

      title: {
        text: "Completed Service Request",
        display: true
      }
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
      title: {
        text: "Pending Service Request",
        display: true
      }
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