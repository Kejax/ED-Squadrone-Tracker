
function loadStationContent() {

    const query = URLSearchParams(window.location.search);

    fetch(`https://spansh.co.uk/api/station/${query.get('marketId')}`)
    .then((response) => response.json())
    .then((data) => {
        
        stationNames = document.querySelector("[data-value=stationName]") 

    })

}