function searchSystems(event) {// Make a GET request using the Fetch API
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
            if (result.type === "system") {

              const row = document.createElement('tr');
              const record = result.record
              
              // Station Name
              let nameCell = document.createElement('td');
              nameCell.innerHTML = `<a href="system_information.html?systemAddress=${record.id64}">${record.name}</a>`;
              row.appendChild(nameCell);

              // Economy
              let economyCell = document.createElement('td');
              if (record.primary_economy) {
                economyCell.textContent = record.primary_economy;
              } else economyCell.textContent = "---";
              row.appendChild(economyCell);

              // Government
              let governmentCell = document.createElement('td');
              governmentCell.textContent = record.government;
              row.appendChild(governmentCell);

              // Allegiance
              // TODO find a way to show several economies, not just 1
              let allegianceCell = document.createElement('td');
              if (record.allegiance) {
                allegianceCell.textContent = record.allegiance;
              } else allegianceCell.textContent = "---";
              row.appendChild(allegianceCell);
              
              tbody.appendChild(row);
            }
          });
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
      }
    }