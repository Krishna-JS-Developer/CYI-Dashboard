let currentPage = 1;
let resultsPerPage = 10;
let totalRecords = 0;

function fetchAndPopulateTable() {
  fetch(`/cves?page=${currentPage}&resultsPerPage=${resultsPerPage}`)
    .then((response) => response.json())
    .then((data) => {
      totalRecords = data.totalRecords;
      document.getElementById("total-records").textContent = totalRecords;
      const tableBody = document.getElementById("cve-table-body");
      tableBody.innerHTML = "";
      data.data.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="cve-id">${entry.cve_id}</td>
          <td>${entry.identifier}</td>
          <td>${entry.published_date}</td>
          <td>${entry.last_modified_date}</td>
          <td>${entry.status}</td>
        `;

        row.classList.add("fade-in");
        row.style.animationDelay = `${index * 0.1}s`;
        tableBody.appendChild(row);
      });

      const startRecord = (currentPage - 1) * resultsPerPage + 1;
      const endRecord = Math.min(currentPage * resultsPerPage, totalRecords);
      document.getElementById("total-numbers-viewed").innerHTML =
        `<strong>${startRecord} - ${endRecord} of ${totalRecords} records</strong>`;

      updatePagination();
    })
    .catch((error) => console.error("Error fetching CVE data:", error));
}

function attachEventListenersToCVEIDs() {
  const tableBody = document.getElementById("cve-table-body");
  tableBody.addEventListener("click", (event) => {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("cve-id")) {
      const cveId = clickedElement.textContent;
      window.location.href = `FrontEnd/cve-details.html?id=${cveId}`;
    }
  });
}

function updatePagination() {
  const totalPages = Math.ceil(totalRecords / resultsPerPage);
  document.getElementById("current-page").textContent = currentPage;
  document.getElementById("total-pages").textContent = totalPages;
  document.getElementById("prev-page-btn").disabled = currentPage === 1;
  document.getElementById("next-page-btn").disabled = currentPage === totalPages;
}

document.getElementById("prev-page-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAndPopulateTable();
  }
});

document.getElementById("next-page-btn").addEventListener("click", () => {
  const totalPages = Math.ceil(totalRecords / resultsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    fetchAndPopulateTable();
  }
});

document
  .getElementById("results-per-page-select")
  .addEventListener("change", (event) => {
    resultsPerPage = parseInt(event.target.value);
    currentPage = 1;
    fetchAndPopulateTable();
  });

fetchAndPopulateTable();
attachEventListenersToCVEIDs();