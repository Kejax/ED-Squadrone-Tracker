
function loadStationContent() {

    const loader = document.querySelector('.preloader');

    const query = new URLSearchParams(window.location.search);

    fetch(`https://spansh.co.uk/api/station/${query.get('marketId')}`)
    .then((response) => response.json())
    .then((data) => {
        
        targets = document.querySelectorAll('[data-value]');

        targets.forEach(element => {
            key = element.getAttribute('data-value');
            console.log(key)
            console.log(data.record[key]);
            element.textContent = data.record[key];
        });

        loader.style.display = 'none';

    })

}

loadStationContent()