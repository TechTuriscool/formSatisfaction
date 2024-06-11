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
        categoryScore.innerHTML = answersObject2[key].toFixed(2);
        //si es NaN o null, convertirlo a 5


        categoryContainer.appendChild(categoryScore);

        if (categoryScore.innerHTML >= 0 && categoryScore.innerHTML <= 3) {
            categoryContainer.style.backgroundColor = '#F79394';
            categoryContainer.style.color = '#C60001';
        }
        if (categoryScore.innerHTML > 3 && categoryScore.innerHTML <= 4) {
            categoryContainer.style.backgroundColor = '#FDF6C4';
            categoryContainer.style.color = '#F74B00';
        }
        if (categoryScore.innerHTML > 4 && categoryScore.innerHTML <= 5) {
            categoryContainer.style.backgroundColor = '#8BE68B';
            categoryContainer.style.color = '#012E1F';
        }

        imgLoading2.style.display = 'none';

        categoryContainer.addEventListener('click', function () {
            console.log(key.toUpperCase);
        });

        categoriesContainer2.appendChild(categoryContainer);
    }
}