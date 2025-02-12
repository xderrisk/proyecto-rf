document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        return;
    }

    window.api.adminew(username, password).then(addAdmi => {
        if (addAdmi) {
            window.location.href = '../html/index.html';
        }
    })
})