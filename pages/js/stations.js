function searchStations(query, referenceSystem) {// Make a GET request using the Fetch API
  fetch('https://spansh.co.uk/api/stations/search',
  {
    method: 'POST',
    body: JSON.stringify({
      'filters': {
        'name': {'value': query}
      },
      'sort': [
        {'distance': {'direction': 'asc'}}
      ],
      'reference_system': referenceSystem,
      'size': 500,
      'page': 0
    })
  })
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

      const row = document.createElement('tr');
      
      // Station Name
      let nameCell = document.createElement('td');
      nameCell.innerHTML = `<a href="station_information.html?marketId=${result.market_id}">${result.name}</a>`;
      row.appendChild(nameCell);

      // System Name
      let systemCell = document.createElement('td');
      systemCell.textContent = result.system_name;
      row.appendChild(systemCell);

      // Allegiance
      let allegianceCell = document.createElement('td');
      if (result.allegiance) {
        allegianceCell.textContent = result.allegiance;
      } else allegianceCell.textContent = "---";
      row.appendChild(allegianceCell);

      // Government
      let governmentCell = document.createElement('td');
      governmentCell.textContent = result.government;
      row.appendChild(governmentCell);

      // Economies
      // TODO find a way to show several economies, not just 1
      let economyCell = document.createElement('td');
      if (result.economies) {
        economyCell.textContent = result.economies[0].name;
      } else economyCell.textContent = "---";
      row.appendChild(economyCell);
      
      tbody.appendChild(row);
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}