let variableDesdeEJS22 = JSON.parse(localStorage.getItem('answersObject'));

// Calcular media global
var answersObject = variableDesdeEJS22;
var totalScore = 0;
var totalQuestions = 0;
let imgLoading = document.getElementById('loading');

for (var key in answersObject) {
    totalScore += answersObject[key];
    totalQuestions++;
}
var averageScore = totalScore / totalQuestions;
document.getElementById('averageScore').innerHTML =`<h1>${averageScore.toFixed(2)}</h1>`;

imgLoading.style.display = 'none';

if (averageScore >= 0 && averageScore <= 3) {
    document.getElementById('averageScore').style.backgroundColor = '#F79394';
    document.getElementById('averageScore').style.color = '#C60001';
}
if (averageScore > 3 && averageScore <= 4) {
    document.getElementById('averageScore').style.backgroundColor = '#FDF6C4';
    document.getElementById('averageScore').style.color = '#F74B00';
}
if (averageScore > 4 && averageScore <= 5) {
    document.getElementById('averageScore').style.backgroundColor = '#8BE68B';
    document.getElementById('averageScore').style.color = '#012E1F';
}
