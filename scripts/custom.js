let sheetID = "1qRN1CTiEBqQkxfOUI8_wYfXiWxoVjHKiwruslmfOqSs";
async function gsx(id, sheet) {
  url =
    "https://spreadsheets.google.com/feeds/list/" +
    id +
    "/" +
    sheet +
    "/public/values?alt=json";

  response = await fetch(url);

  if (response.status != 200) {
    return;
  }

  var data = await response.json();
  var responseObj = {};
  var rows = [];
  var columns = {};

  for (var i = 0; i < data.feed.entry.length; i++) {
    var entry = data.feed.entry[i];
    var keys = Object.keys(entry);
    var newRow = {};
    var queried = false;
    for (var j = 0; j < keys.length; j++) {
      var gsxCheck = keys[j].indexOf("gsx$");
      if (gsxCheck > -1) {
        var key = keys[j];
        var name = key.substring(4);
        var content = entry[key];
        var value = content.$t;
        newRow[name] = value;
        if (!columns.hasOwnProperty(name)) {
          columns[name] = [];
          columns[name].push(value);
        } else {
          columns[name].push(value);
        }
      }
    }
    rows.push(newRow);
  }
  return rows;
}

function initPieChart(data) {
  var pieChart = document.getElementById("pieChart");
  var pieChartC = new Chart(pieChart, {
    type: "doughnut",
    data: data,
  });
}

function initBarChart(data) {
  var barChart = document.getElementById("barChart");

  var barChartC = new Chart(barChart, {
    type: "bar",
    data: data,
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

async function getData() {
  return await gsx(sheetID, 1);
}

async function getCompanies() {
  let companies = await gsx(sheetID, 3);
  companyDict = {};
  companies.forEach((company) => {
    companyDict[company.companyname] = company;
  });
  return companyDict;
}

function getPieChartData(data) {
  let phases = {
    7: "Generally Available",
    6: "FDA Approved",
    5: "Phase 3 trial",
    4: "Phase 2 trial",
    3: "Phase 1 trial",
    2: "Pre-clinical trials",
    1: "Pre-clinical research",
  };
  let labels = Object.keys(phases).map((val) => {
    return phases[val];
  });

  let newData = [];

  Object.keys(phases).forEach((el) => {
    newData[el - 1] = newData[el - 1] ? newData[el - 1] + 1 : data[el].length;
  });

  return {
    labels: labels,
    datasets: [
      {
        label: "",
        data: newData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(0, 0, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(0, 0, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
}

function getBarChartData(countries, companies) {
  let vaccines = [];
  let countriess = [...countries];
  countriess.shift();
  Object.keys(companies).forEach((el, index) => {
    countriess.forEach((ell, index2) => {
      if (companies[el].companycountry == ell) {
        vaccines[index2] = vaccines[index2] ? vaccines[index2] + 1 : 1;
      }
    });
  });

  return {
    labels: countriess,
    datasets: [
      {
        label: "# of Vaccines by Country",
        data: vaccines,
        backgroundColor: [
          "#fcf8ec",
          "#456268",
          "#532e1c",
          "#0f0f0f",
          "#ffabe1",
          "#6155a6",

          "#41584b",
          "#045762",
          "#f3f2da",
          "#999b84",
          "#ffba93",
          "#da9ff9",
          "#825959",
          "#54e346",
          "#03506f",
        ],
        borderColor: [
          "#fcf8ec",
          "#456268",
          "#532e1c",
          "#0f0f0f",
          "#ffabe1",
          "#6155a6",

          "#41584b",
          "#045762",
          "#f3f2da",
          "#999b84",
          "#ffba93",
          "#da9ff9",
          "#825959",
          "#54e346",
          "#03506f",
        ],
        borderWidth: 1,
      },
    ],
  };
}

new Vue({
  el: "#app",
  data: {
    vaccinationsByPhase: {},
    companies: {},
    tempCompanies: {},
    companiesByPhase: [],
    countries: [],
    selectedCountry: "All",
    phases: {
      8: "All Vaccines",
      7: "Generally Available",
      6: "FDA Approved",
      5: "Phase 3 trial",
      4: "Phase 2 trial",
      3: "Phase 1 trial",
      2: "Pre-clinical trials",
      1: "Pre-clinical research",
    },
    phaseOrder: [8, 7, 6, 5, 4, 3, 2, 1],
    phaseOrderSidebar: [7, 6, 5, 4, 3, 2, 1],
    selected: null,
    statusData: [],
  },
  methods: {
    countryChange: () => {},
    moreInfo(v) {
      this.selected = v;
    },
  },

  async mounted() {
    this.statusData = await getData();
    this.companies = await getCompanies();
    this.tempCompanies = { ...this.companies };
    let phases = Object.keys(this.phases);
    let vaccinationsByPhase = {};

    let country = ["All"];
    for (const key of Object.keys(this.companies)) {
      if (country.indexOf(this.companies[key].companycountry) == -1) {
        country.push(this.companies[key].companycountry);
      }
    }
    this.countries = country.sort();

    phases.forEach((phase) => {
      if (phase == 8) {
        vaccinationsByPhase[phase] = this.statusData;
      } else {
        vaccinationsByPhase[phase] = this.statusData.filter(
          (x) => x.phase == phase
        );
      }
    });

    this.vaccinationsByPhase = vaccinationsByPhase;
    let pieChartData = getPieChartData(vaccinationsByPhase, this.phases);
    initPieChart(pieChartData);
    let barChartData = getBarChartData(this.countries, this.companies);

    initBarChart(barChartData);
    document.querySelector(".loading").style.display = "none";
  },
  watch: {
    async selected() {
      window.scrollTo(0, 0);
    },
    selectedCountry() {
      console.log(this.selectedCountry);
      console.log(this.tempCompanies)
      this.tempCompanies = this.tempCompanies.filter(el => {
          return el.companycountry
      })
    },
  },
});
