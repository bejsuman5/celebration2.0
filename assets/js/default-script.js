const urlLocation = new URLSearchParams(window.location.search);
const birthdayPersonNameForScript = urlLocation.get('happy_birthday') || 'default';
const scriptElement = document.createElement('script');

scriptElement.src = `assets/plugins/${birthdayPersonNameForScript}/js/text.js`;

scriptElement.onerror = function() {
    window.location.href = 'index.html';
};

document.head.appendChild(scriptElement);
