
function loadStationContent() {

    const loader = document.querySelector('.preloader');

    const query = new URLSearchParams(window.location.search);

    fetch(`https://spansh.co.uk/api/station/${query.get('marketId')}`)
    .then((response) => response.json())
    .then((data) => {
        
        targets = document.querySelectorAll('[data-value]');

        targets.forEach(element => {
            key = element.getAttribute('data-value');

            element.textContent = data.record[key];

            console.log(key)

            if (key == 'landingpad') {
                console.log(data.record.has_large_pad)
                if (data.record.has_large_pad) {
                    element.textContent = 'L'
                } else element.textContent = 'M'
            }
        });


        // Station chips
        const stationChips = document.querySelector('.station-chips');

        stationChips.innerHTML = '';

        data.record.services.forEach(element => {
            const span = document.createElement('span');
            span.textContent = element.name;
            span.classList.add('station-span');
            stationChips.appendChild(span)
        })

        loader.style.display = 'none';

    })

}

loadStationContent()