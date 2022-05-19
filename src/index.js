// customer dashboard

function CustomerDashboardCharts() {
  let sReqType = JSON.parse(localStorage.getItem("servicerequesttype"));
  let pendingServiceRequest = JSON.parse(localStorage.getItem("pendingservicerequest"));

  new Chart("chart-bars", {
    type: "bar",
    data: {
      labels: ["PO", "Service", "AMC"],
      datasets: [
        {
          label: "Cost",
          tension: 0.4,
          borderWidth: 0,
          borderRadius: 4,
          borderSkipped: false,
          // backgroundColor: "rgba(255, 255, 255, .8)",
          backgroundColor: "#9e4541",
          data: [50, 20, 10],
          maxBarThickness: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            // color: "rgba(255, 255, 255, .2)",
          },
          ticks: {
            suggestedMin: 0,
            suggestedMax: 500,
            beginAtZero: true,
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: "Roboto",
              style: "normal",
              lineHeight: 2,
            },
            // color: "#fff",
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            // color: "rgba(255, 255, 255, .2)",
          },
          ticks: {
            display: true,
            // color: "#f8f9fa",
            padding: 10,
            font: {
              size: 14,
              weight: 300,
              family: "Roboto",
              style: "normal",
              lineHeight: 2,
            },
          },
        },
      },
    },
  });

  new Chart("chart-line", {
    type: "doughnut",
    data: {
      labels: sReqType?.label,
      datasets: [
        {
          label: "Service Request Types",
          tension: 0,
          borderWidth: 0,
          pointRadius: 5,
          // pointBackgroundColor: "rgba(255, 255, 255, .8)",
          pointBorderColor: "transparent",
          backgroundColor: ["#8400ff", "#a442ff", "#c484ff", "#e1c1ff", "#f9f1ff"],
          borderColor: "rgba(255, 255, 255, .8)",
          fill: true,
          data: sReqType?.chartData,
          maxBarThickness: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });

  new Chart("chart-line-tasks", {
    type: "pie",
    data: {
      labels: pendingServiceRequest?.label,
      datasets: [
        {
          label: "Pending Service Request",
          tension: 0,
          borderWidth: 0,
          pointRadius: 5,
          // pointBackgroundColor: "rgba(255, 255, 255, .8)",
          pointBorderColor: "transparent",
          backgroundColor: ["#2aa7ff", "#5abbff", "#89ceff", "#bce3ff", "#eff8ff"],
          borderColor: "rgba(255, 255, 255, .8)",
          fill: true,
          data: pendingServiceRequest?.chartData,
          maxBarThickness: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  });



}
// distdashboard
function DistributorDashboardCharts() {
  "use strict";

  $.plot(
    "#flotChart",
    [
      {
        data: flotSampleData1,
        color: "#007bff",
        lines: {
          fillColor: { colors: [{ opacity: 0 }, { opacity: 0.2 }] },
        },
      },
      {
        data: flotSampleData2,
        color: "#ff0000",
        lines: { fillColor: { colors: [{ opacity: 0 }, { opacity: 0.2 }] } },
      },
      {
        data: flotSampleData3,
        color: "#ffff00",
        lines: { fillColor: { colors: [{ opacity: 0 }, { opacity: 0.2 }] } },
      },
      {
        data: flotSampleData4,
        color: "#560bd0",
        lines: { fillColor: { colors: [{ opacity: 0 }, { opacity: 0.2 }] } },
      },
      {
        data: flotSampleData5,
        color: "#009900",
        lines: { fillColor: { colors: [{ opacity: 0 }, { opacity: 0.2 }] } },
      },
    ],
    {
      series: {
        shadowSize: 0,
        lines: {
          show: true,
          lineWidth: 2,
          fill: true,
        },
      },
      grid: {
        borderWidth: 0,
        labelMargin: 8,
        height: 100,
      },
      yaxis: {
        show: true,
        // min: 0,
        // max: 100,
        ticks: [
          [0, ""],
          [20, "20K"],
          [40, "40K"],
          [60, "60K"],
          [80, "80K"],
        ],
        tickColor: "#eee",
      },
      xaxis: {
        show: true,
        color: "#fff",
        ticks: [
          [15, "OCT 18"],
          [25, "OCT 19"],
          [40, "OCT 20"],
          [55, "OCT 21"],
        ],
      },
    }
  );

  $.plot(
    "#flotChart1",
    [
      {
        data: dashData2,
        color: "#00cccc",
      },
    ],
    {
      series: {
        shadowSize: 0,
        lines: {
          show: true,
          lineWidth: 2,
          fill: true,
          fillColor: { colors: [{ opacity: 0.2 }, { opacity: 0.2 }] },
        },
      },
      grid: {
        borderWidth: 0,
        labelMargin: 0,
      },
      yaxis: {
        show: false,
        min: 0,
        max: 35,
      },
      xaxis: {
        show: false,
        max: 50,
      },
    }
  );

  $.plot(
    "#flotChart2",
    [
      {
        data: dashData2,
        color: "#007bff",
      },
    ],
    {
      series: {
        shadowSize: 0,
        bars: {
          show: true,
          lineWidth: 0,
          fill: 1,
          barWidth: 0.5,
        },
      },
      grid: {
        borderWidth: 0,
        labelMargin: 0,
      },
      yaxis: {
        show: false,
        min: 0,
        max: 35,
      },
      xaxis: {
        show: false,
        max: 20,
      },
    }
  );

  //-------------------------------------------------------------//

  // Line chart
  $(".peity-line").peity("line");

  // Bar charts
  $(".peity-bar").peity("bar");

  // Bar charts
  $(".peity-donut").peity("donut");

  $.plot(
    "#flotChart2",
    [
      {
        data: dashData2,
        color: "#007bff",
      },
    ],
    {
      series: {
        shadowSize: 0,
        bars: {
          show: true,
          lineWidth: 0,
          fill: 1,
          barWidth: 0.5,
        },
      },
      grid: {
        borderWidth: 0,
        labelMargin: 0,
      },
      yaxis: {
        show: false,
        min: 0,
        max: 35,
      },
      xaxis: {
        show: false,
        max: 20,
      },
    }
  );
  setTimeout(() => {
    let instrumentWithHighestServiceRequest = JSON.parse(
      localStorage.getItem("instrumentWithHighestServiceRequest")
    );
    var ctx5 = document.getElementById("chartBar5").getContext("2d");
    new Chart(ctx5, {
      type: "bar",
      data: {
        labels: instrumentWithHighestServiceRequest?.label,
        datasets: [
          {
            data: instrumentWithHighestServiceRequest?.data,
            backgroundColor: "#560bd0",
          },
        ],
        maxBarThickness: 2,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5],
              color: "rgba(255, 255, 255, .2)",
            },
            ticks: {
              suggestedMin: 0,
              suggestedMax: 200,
              beginAtZero: true,
              font: {
                size: 14,
                weight: 300,
                family: "Roboto",
                style: "normal",
                lineHeight: 2,
              },
              color: "#fff",
            },
          },
          x: {
            barPercentage: 0.1,
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5],
              color: "rgba(255, 255, 255, .2)",
            },
            ticks: {
              display: true,
              color: "#f8f9fa",
              font: {
                size: 14,
                weight: 300,
                family: "Roboto",
                style: "normal",
                lineHeight: 2,
              },
            },
          },
        },
      },
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
      plugins: {
        legend: {
          display: false,
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    };

    // For a doughnut chart
    var ctxpie = document.getElementById("chartDonut");
    new Chart(ctxpie, {
      type: "doughnut",
      data: datapie,
      options: optionpie,
    });
  }, 2000);
}
