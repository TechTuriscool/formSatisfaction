// Recoger del localStorage el objeto con las respuestas
let answersObject2 = JSON.parse(localStorage.getItem('answersObject'));
console.log('Respuestas del localStorage: ');
console.log(answersObject2);

let categoriesContainer2 = document.getElementById('categoriesContainer');
let imgLoading2 = document.getElementById('loading2');
if (answersObject2 && categoriesContainer2) {
    // Pasar por cada categoría
    for (let key in answersObject2) {
        let categoryContainer = document.createElement('div');
        categoryContainer.classList.add('categoryContainer');

        let categoryName = document.createElement('h4');
        categoryName.innerHTML = key.toUpperCase();
        categoryContainer.appendChild(categoryName);

        let categoryScore = document.createElement('h1');
        let scoreValue = answersObject2[key] ? answersObject2[key].toFixed(2) : 5;
        categoryScore.innerHTML = scoreValue;

        categoryContainer.appendChild(categoryScore);

        if (scoreValue >= 0 && scoreValue <= 3) {
            categoryContainer.style.backgroundColor = '#F79394';
            categoryContainer.style.color = '#C60001';
        } else if (scoreValue > 3 && scoreValue <= 4) {
            categoryContainer.style.backgroundColor = '#FDF6C4';
            categoryContainer.style.color = '#F74B00';
        } else if (scoreValue > 4 && scoreValue <= 5) {
            categoryContainer.style.backgroundColor = '#8BE68B';
            categoryContainer.style.color = '#012E1F';
        }

        imgLoading2.style.display = 'none';

        categoriesContainer2.appendChild(categoryContainer);
    }
}

