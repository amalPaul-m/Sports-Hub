const new_arraival = document.getElementById('new_arraival');
const top_selling = document.getElementById('top_selling');

new_arraival.addEventListener('click', e => {
    new_arraival.classList.add('active');
    top_selling.classList.remove('active');
});

top_selling.addEventListener('click', e => {
    top_selling.classList.add('active');
    new_arraival.classList.remove('active');
});


