function searchStations(event) {// Make a GET request using the Fetch API
  if (event.key === "Enter") {
    fetch(`https://spansh.co.uk/api/search?q=${event.target.value}`)
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        // Data is now an object containing the fetched JSON data
        console.log(data);

        // Create and populate an HTML table using the fetched data
        const table = document.getElementById('table');
        const tbody = table.querySelector('tbody');

        tbody.innerHTML = "";

        // Create table rows
        data.results.forEach(result => {
          if (result.type === "station") {

            const row = document.createElement('tr');
            const record = result.record
            
            // Station Name
            let nameCell = document.createElement('td');
            nameCell.innerHTML = `<a href="station_information.html?marketId=${record.market_id}">${record.name}</a>`;
            row.appendChild(nameCell);

            // System Name
            let systemCell = document.createElement('td');
            systemCell.textContent = record.system_name;
            row.appendChild(systemCell);

            // Allegiance
            let allegianceCell = document.createElement('td');
            if (record.allegiance) {
              allegianceCell.textContent = record.allegiance;
            } else allegianceCell.textContent = "---";
            row.appendChild(allegianceCell);

            // Government
            let governmentCell = document.createElement('td');
            governmentCell.textContent = record.government;
            row.appendChild(governmentCell);

            // Economies
            // TODO find a way to show several economies, not just 1
            let economyCell = document.createElement('td');
            if (record.economies) {
              economyCell.textContent = record.economies[0].name;
            } else economyCell.textContent = "---";
            row.appendChild(economyCell);
            
            tbody.appendChild(row);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }
  }