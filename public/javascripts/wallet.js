const walletInput = document.getElementById('walletInput');
const quickAddButtons = document.querySelectorAll('.quick-add');

quickAddButtons.forEach(button => {
    button.addEventListener('click', () => {
        const amount = button.getAttribute('data-amount');
        walletInput.value = amount;
    });
});