
// Function to create and show the notification
function showNotification(text) {

    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'absolute';
    notification.style.bottom = '0px';
    notification.style.right = '20px';
    notification.style.overflow = 'hidden';

    const div = document.createElement('div');
    div.id = 'notificationInner';
    div.style.position = 'absolute';
    div.style.color = 'white';
    div.style.fontFamily = 'arial';
    div.style.transition = '1s ease-in';
    div.style.bottom = '20px';
    div.style.padding = '20px';
    div.style.backgroundColor = 'black';
    div.style.borderRadius = '20px';
    div.innerHTML = text;
    div.style.zIndex = '-1';

    notification.appendChild(div);

    document.body.appendChild(notification);

    notification.style.height = `${div.clientHeight + 20}px`;
    notification.style.width = `${div.clientWidth}px`;

    // TODO Make in window notifications hide after some time (probably after 5 seconds)
    setTimeout(() => {
        div.style.bottom = `-${div.clientHeight + 20}px`;
        setTimeout(() => {
            document.body.removeChild(notification);
            delete notification;
            delete div;
        }, 1500);
    }, 5000)
}

console.log(window.versions.ping())