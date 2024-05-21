document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const gameLink = document.getElementById('game-link');
    const dataLink = document.getElementById('data-link');

    gameLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayGame();
    });

    dataLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayCatData();
    });

    function displayGame() {
        content.innerHTML = '<div class="game-board"></div>';
        const gameBoard = document.querySelector('.game-board');

        fetch('https://api.thecatapi.com/v1/images/search?limit=10')
            .then(response => response.json())
            .then(data => {
                const images = [...data, ...data];
                images.sort(() => 0.5 - Math.random());

                images.forEach(image => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.id = image.id;

                    const img = document.createElement('img');
                    img.src = image.url;
                    card.appendChild(img);

                    card.addEventListener('click', flipCard);
                    gameBoard.appendChild(card);
                });
            });

        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;

        function flipCard() {
            if (lockBoard) return;
            if (this === firstCard) return;

            this.classList.add('flipped');

            if (!hasFlippedCard) {
                hasFlippedCard = true;
                firstCard = this;
                return;
            }

            secondCard = this;
            checkForMatch();
        }

        function checkForMatch() {
            if (firstCard.dataset.id === secondCard.dataset.id) {
                disableCards();
                return;
            }

            unflipCards();
        }

        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            resetBoard();
        }

        function unflipCards() {
            lockBoard = true;

            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1500);
        }

        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }
    }

    function displayCatData() {
        content.innerHTML = '<div class="cat-data"></div>';
        const catDataContainer = document.querySelector('.cat-data');

        fetch('https://api.thecatapi.com/v1/breeds')
            .then(response => response.json())
            .then(data => {
                // Shuffle the breeds array
                data.sort(() => 0.5 - Math.random());

                const breedPromises = data.slice(0, 10).map(cat => {
                    return fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${cat.id}`)
                        .then(response => response.json())
                        .then(imageData => {
                            const catCard = document.createElement('div');
                            catCard.classList.add('cat-card');

                            const img = document.createElement('img');
                            img.src = imageData[0]?.url || 'https://via.placeholder.com/200'; // Should not fallback to placeholder anymore
                            catCard.appendChild(img);

                            const name = document.createElement('h3');
                            name.textContent = cat.name;
                            catCard.appendChild(name);

                            const description = document.createElement('p');
                            description.textContent = cat.description;
                            catCard.appendChild(description);

                            catDataContainer.appendChild(catCard);
                        });
                });

                return Promise.all(breedPromises);
            })
            .catch(error => {
                console.error('Error fetching cat data:', error);
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Failed to load cat data. Please try again later.';
                content.appendChild(errorMessage);
            });
    }

    // Display the game by default
    displayGame();
});



