function fetchAndDisplayCVEDetails(cveId) {
    fetch(`/cves/list?id=${cveId}`)
      .then((response) => response.json())
      .then((data) => {
        const container = document.getElementById("cve-details-container");
        container.innerHTML = "";
        const cveIdHeading = document.createElement("h1");
        cveIdHeading.textContent = data.cve.id;
        container.appendChild(cveIdHeading);
        for (const [key, value] of Object.entries(data.cve)) {
          if (
            key !== "sourceIdentifier" &&
            key !== "id" &&
            key !== "published" &&
            key !== "lastModified" &&
            key !== "vulnStatus" &&
            key !== "weaknesses" &&
            key !== "references"
          ) {
            if (key === "configurations") {
              const configurations = value[0].nodes[0].cpeMatch;
              const table = document.createElement("table");
              const headerRow = table.insertRow();
              const headerCell1 = document.createElement("th");
              headerCell1.textContent = "Match Criteria ID";
              const headerCell2 = document.createElement("th");
              headerCell2.textContent = "Criteria";
              const headerCell3 = document.createElement("th");
              headerCell3.textContent = "Vulnerable";
              headerRow.appendChild(headerCell1);
              headerRow.appendChild(headerCell2);
              headerRow.appendChild(headerCell3);
              for (const config of configurations) {
                const row = table.insertRow();
                const cell1 = row.insertCell();
                cell1.textContent = config.matchCriteriaId;
                const cell2 = row.insertCell();
                cell2.textContent = config.criteria;
                const cell3 = row.insertCell();
                cell3.textContent = config.vulnerable ? "Yes" : "No";
              }
              const detail = document.createElement("div");
              detail.classList.add("detail");
              const label = document.createElement("h2");
              label.textContent = "CPE:";
              detail.appendChild(label);
              detail.appendChild(table);
              container.appendChild(detail);
            } 
            else if
             (key === "metrics") {
              const metrics = value.cvssMetricV2[0].cvssData;
              const baseSeverity = value.cvssMetricV2[0].baseSeverity;
              const exploitabilityScore = value.cvssMetricV2[0].exploitabilityScore;
              const impactScore = value.cvssMetricV2[0].impactScore;
              const vectorString = value.cvssMetricV2[0].vectorString;
              const table = document.createElement("table");
              const headerRowKeys = table.insertRow();
              const headerRowValues = table.insertRow();
              const metricKeys = Object.keys(metrics).filter(
                (key) =>
                  key !== "version" &&
                  key !== "baseScore" &&
                  key !== "vectorString",
              );
              const metricValues = Object.values(metrics).filter((_, index) =>
                metricKeys.includes(Object.keys(metrics)[index]),
              );
              metricKeys.forEach((metricKey) => {
                const capitalizedKey = metricKey.charAt(0).toUpperCase() + metricKey.slice(1);
                const headerCellKey = document.createElement("th");
                headerCellKey.textContent = capitalizedKey;
                headerRowKeys.appendChild(headerCellKey);
              });
              metricValues.forEach((metricValue) => {
                const valueCell = headerRowValues.insertCell();
                valueCell.textContent =
                  typeof metricValue === "object"
                    ? JSON.stringify(metricValue)
                    : metricValue;
              });
              const baseScoreRow = table.insertRow(0);
              const baseScoreCell = baseScoreRow.insertCell();
              baseScoreCell.colSpan = metricKeys.length;
              baseScoreCell.innerHTML = `<strong>Score:</strong> ${metrics.baseScore}`;
              const baseSeverityRow = table.insertRow(1);
              const baseSeverityCell = baseSeverityRow.insertCell();
              baseSeverityCell.colSpan = metricKeys.length;
              baseSeverityCell.innerHTML = `<strong>Severity:</strong> ${baseSeverity}`;
              const vectorStringRow = table.insertRow(2);
              const vectorStringCell = vectorStringRow.insertCell();
              vectorStringCell.colSpan = metricKeys.length;
              vectorStringCell.innerHTML = `<strong>Vector String:</strong> ${metrics.vectorString}`;
              const scoresHeading = document.createElement("h2");
              scoresHeading.textContent = "Scores:";
              const scoresDetail = document.createElement("div");
              scoresDetail.classList.add("detail");
              const exploitabilityScoreLabel = document.createElement("p");
              exploitabilityScoreLabel.innerHTML = `<strong>Exploitability Score:</strong> ${exploitabilityScore}`;
              const impactScoreLabel = document.createElement("p");
              impactScoreLabel.innerHTML = `<strong>Impact Score:</strong> ${impactScore}`;
              scoresDetail.appendChild(scoresHeading);
              scoresDetail.appendChild(exploitabilityScoreLabel);
              scoresDetail.appendChild(impactScoreLabel);
              const detail = document.createElement("div");
              detail.classList.add("detail");
              const label = document.createElement("h3");
              label.textContent = "CVSS V2 Metrics:";
              detail.appendChild(label);
              detail.appendChild(table);
              detail.appendChild(scoresDetail);
              container.appendChild(detail);
            } 
            else if (key === "descriptions") 
            {
              const detail = document.createElement("div");
              detail.classList.add("detail");
              const label = document.createElement("h2");
              label.textContent = "Description:";
              const paragraph = document.createElement("p");
              paragraph.textContent = value[0].value;
              detail.appendChild(label);
              detail.appendChild(paragraph);
              container.appendChild(detail);
            }
             else
              {
              const detail = document.createElement("div");
              detail.classList.add("detail");
              const label = document.createElement("label");
              label.textContent = key;
              const paragraph = document.createElement("p");
              paragraph.textContent = JSON.stringify(value, null, 2);
              detail.appendChild(label);
              detail.appendChild(paragraph);
              container.appendChild(detail);
            }
          }
        }
      })
      .catch((error) => console.error("Error fetching CVE details:", error));
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const cveId = urlParams.get("id");
  fetchAndDisplayCVEDetails(cveId);
  