
// change the image depended by the user name
// Get the folder name from the URL query parameter, with a default value of 'default-folder'

const urlParams = new URLSearchParams(window.location.search);
const happy_birthday = urlParams.get('happy_birthday') || 'default';

// Set the image source based on the folder name
const imgElement1 = document.getElementById('pic1');
imgElement1.src = `assets/plugins/${happy_birthday}/images/pic1.jpg`;

const imgElement2 = document.getElementById('pic2');
imgElement2.src = `assets/plugins/${happy_birthday}/images/pic2.jpg`;

const imgElement3 = document.getElementById('pic3');
imgElement3.src = `assets/plugins/${happy_birthday}/images/pic3.jpg`;

const imgElement4 = document.getElementById('pic4');
imgElement4.src = `assets/plugins/${happy_birthday}/images/pic4.jpg`;

const imgElement5 = document.getElementById('pic5');
imgElement5.src = `assets/plugins/${happy_birthday}/images/pic5.jpg`;

const imgElement6 = document.getElementById('pic6');
imgElement6.src = `assets/plugins/${happy_birthday}/images/pic6.jpg`;

const imgElement7 = document.getElementById('pic7');
imgElement7.src = `assets/plugins/${happy_birthday}/images/pic7.jpg`;

const imgElement8 = document.getElementById('pic8');
imgElement8.src = `assets/plugins/${happy_birthday}/images/pic8.jpg`;

const imgElement9 = document.getElementById('pic9');
imgElement9.src = `assets/plugins/${happy_birthday}/images/pic9.jpg`;