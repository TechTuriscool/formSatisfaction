const token = "Bearer 17xa7adwlycG4qrbRatBdCHW41xtl9jNyaBq4d45";
const id = "62b182eea31d8d9863079f42";
let arrayNamesForbidden = ["feet", "bienvenidos", "onboarding", "procedimientos", "taz", "alda"];
let totalCourses = 0;
let categories = [];
let courseList = [];
let courseListCategories = [];
let courseListIds = [];
let loading = true;
let searchActive = false;
let alumnos = []
let showAlumnosToggle = false;
let deployCoursesActive = false;
let optionDisabledifNotForm = false;
let usersString = "";

let url = new URL(window.location.href);
let host = url.host;



const requestOptions = {
    method: "GET",
    headers: {
        Authorization: token,
        "Content-Type": "application/json",
        "Lw-Client": id,
    },
};

document.addEventListener('DOMContentLoaded', function () {
    recoverySurveyInfoFromLocalStorage();
    changeCoruseTitleContent();
    addOpinionsToContainer();
});

if (location.pathname.includes("index.html") || !location.pathname.includes("course.html")) {
    document.addEventListener('keyup', searchCourse);
}

async function fetchCourseMeta() {
    try {
        const response = await fetch(
            "https://academy.turiscool.com/admin/api/v2/courses",
            requestOptions
        );
        if (!response.ok) {
            throw new Error("Failed to fetch cursos");
        }
        const data = await response.json();
        totalCourses = data.meta.totalPages;
        await fetchCourseData();
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetchCourseData() {
    try {
        for (let i = 1; i <= totalCourses; i++) {
            const response = await fetch(
                `https://academy.turiscool.com/admin/api/v2/courses?page=${i}`,
                requestOptions
            );
            if (!response.ok) {
                throw new Error("Failed to fetch cursos");
            }
            const data = await response.json();
            data.data.forEach(course => {
                if (!arrayNamesForbidden.some(word => course.title.toLowerCase().includes(word.toLowerCase()))) {
                    courseList.push(course);
                }
            });
        }
        setLoadingMenuIcon(loading = false);
        courseListIds = courseList.map(course => course.id);
        courseListCategories = courseList.map(course => course.categories);
        categories = courseListCategories.flat();
        categories = [...new Set(categories)];
        courseList.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
        console.error("Error:", error);
    }
}

function setLoadingMenuIcon(loading) {
    let menuIcon = document.querySelector('.menu-icon');
    if (loading) {
        menuIcon.textContent = '⏳CARGANDO CURSOS...';
    } else {
        menuIcon.textContent = ' ⬇️ MOSTRAR CURSOS ⬇️';
    }
}

async function fetchCourseContent(courseId, courseTitle) {
    localStorage.setItem("courseId", courseId);
    localStorage.setItem("courseTitle", courseTitle);
    try {
        const response = await fetch(
            `https://academy.turiscool.com/admin/api/v2/courses/${courseId}/contents`,
            requestOptions
        );
        if (!response.ok) {
            throw new Error("Failed to fetch curso");
        }
        await checkIfCourseHasForm(courseId);
    } catch (error) {
        console.error("Error:", error);
    }
}

async function checkIfCourseHasForm(courseId) {
    try {
        const response = await fetch(
            `https://academy.turiscool.com/admin/api/v2/courses/${courseId}/contents`,
            requestOptions
        );
        if (!response.ok) {
            throw new Error("Failed to fetch curso");
        }
        const data = await response.json();
        const sections = data.sections;

        let learningUnitsWithForm = [];

        sections.forEach(section => {
            section.learningUnits.forEach(unit => {
                if (unit.type === "newSurvey") {
                    learningUnitsWithForm.push(unit);
                }
            });
        });

        if (learningUnitsWithForm.length > 0) {
            localStorage.setItem("learningUnitsWithForm", JSON.stringify(learningUnitsWithForm));
            recoverySurveyInfo(learningUnitsWithForm[0].id);
        } else {
            alert("Este curso no tiene formularios");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function recoveryDataFromLocalStorage() {
    const settings = localStorage.getItem('learningUnitsWithForm');
    if (settings) {
        const settingsObj = JSON.parse(settings);
        let id = settingsObj[0].id;
        recoverySurveyInfo(id);
    } else {
        console.log('No settings found in localStorage.');
    }
}

async function recoverySurveyInfo(SurveyID) {
    try {
        const response = await fetch(
            `https://academy.turiscool.com/admin/api/v2/assessments/${SurveyID}/responses`,
            requestOptions
        );
        if (!response.ok) {
            alert("Este curso no tiene formulario, o el formulario no contiene respuestas");
            localStorage.removeItem("learningUnitsWithForm");
            throw new Error("Failed to fetch survey info");
        }
        const data = await response.json();
        localStorage.setItem("surveyInfo", JSON.stringify(data));
        // Navegar a /courses para mostrar la información
        window.location.href = `http://${host}/courses`;

    } catch (error) {
        console.error("Error:", error);
    }
}

function recoverySurveyInfoFromLocalStorage() {
    let opinionDiv = document.getElementById("opinionContainer");
    let notaMediaDiv = document.getElementsByClassName("notaMedia")[0];
    let notaMediaStarsDiv = document.getElementsByClassName("notaMediaStars")[0];
    let mensajeOpinionDiv = document.getElementsByClassName("mensajeOpinion")[0];
    let notaGlobalDiv = document.getElementsByClassName("notaGlobal")[0];
    let notas = [];
    let notasFinales = [];
    let mensajes = [];
    let notamedia = 0;
    let starsObject = {
        "0": " 0 ",
        "1": "⭐",
        "2": "⭐⭐",
        "3": "⭐⭐⭐",
        "4": "⭐⭐⭐⭐",
        "5": "⭐⭐⭐⭐⭐"
    };
    const settings = localStorage.getItem('surveyInfo');
    if (settings) {
        const settingsObj = JSON.parse(settings);

        settingsObj.data.forEach(item => {
            item.answers.slice(0, -1).forEach(answer => {
                notas.push(answer.answer);
            });
        });

        notasFinales = notas.map(nota => nota.charAt(0));
        notamedia = notasFinales.reduce((acc, nota) => acc + parseInt(nota), 0) / notasFinales.length;
        notamedia = notamedia.toFixed(2);

        let hasOpinions = false;

        settingsObj.data.forEach(item => {
            let opinion = item.answers[4]?.answer?.trim();
            if (opinion && opinion.toLowerCase() !== 'null') {
                hasOpinions = true;
                let opinionP = document.createElement('p');
                opinionP.classList.add('opinionP');
                opinionP.innerHTML = `<strong>${item.email}</strong>: ${opinion}`;
                opinionDiv.appendChild(opinionP);
            }
        });

        if (!hasOpinions) {
            mensajeOpinionDiv.style.color = "black";
            mensajeOpinionDiv.textContent = "⚠️ Los usuarios no han dejado opiniones sobre este curso";
        } else {
            mensajeOpinionDiv.textContent = ""; // Clear any previous message if there are opinions
        }

        if (notamedia >= 4) {
            notaGlobalDiv.style.color = "green";
            notaGlobalDiv.style.backgroundColor = "lightgreen";
        } else if (notamedia >= 2 && notamedia < 4) {
            notaGlobalDiv.style.color = "orange";
            notaGlobalDiv.style.backgroundColor = "lightyellow";
        } else if (notamedia < 2) {
            notaGlobalDiv.style.color = "red";
            notaGlobalDiv.style.backgroundColor = "#ffc0cbbf";
        }

        notaGlobalDiv.innerHTML = `${Math.trunc(notamedia * 2)}`;
        notaMediaDiv.innerHTML = `Media Global: ${notamedia}`;
        notaMediaDiv.appendChild(notaGlobalDiv);

        for (let i = 0; i <= 5; i++) {
            if (notamedia >= i - 0.5 && notamedia < i + 0.5) {
                notaMediaStarsDiv.innerHTML = ` ${starsObject[i.toString()]}`;
                break;
            }
        }
    } else {
        console.log('No settings found in localStorage.');
    }

    return notamedia;
}



function recoveryDataSurveyforSpecificUser() {
    let surveyInfo = localStorage.getItem("surveyInfo");
    let alumnoid = localStorage.getItem("alumnoid");
    let surveyInfoObj = JSON.parse(surveyInfo);
    let surveyInfoAlumno = surveyInfoObj.data.filter(alumno => alumno.id === alumnoid);
    localStorage.setItem("surveyInfoAlumno", JSON.stringify(surveyInfoAlumno));
    showInfoSpecificAlumno();
}

function changeCoruseTitleContent() {
    let courseTitle = localStorage.getItem("courseTitle");
    let courseTitleContent = document.querySelector('.courseTitle');
    courseTitleContent.textContent = courseTitle;
}

function showAlumnos() {
    showAlumnosToggle = !showAlumnosToggle;
    let alumnosIconDiv = document.querySelector('.alumnos-icon');
    let alumnosMenu = document.querySelector('.alumnosMenu');
    let infoAlumnoDiv = document.querySelector('.infoAlumno');

    if (showAlumnosToggle) {
        infoAlumnoDiv.style.display = 'block';
        alumnosMenu.style.display = 'block';
        alumnosIconDiv.textContent = 'CERRAR';
        alumnosIconDiv.style.color = "black";
        alumnosIconDiv.style.backgroundColor = "#efefef";
    } else {
        infoAlumnoDiv.style.display = 'none';
        alumnosMenu.style.display = 'none';
        alumnosIconDiv.textContent = '⬇️ SELECCIONA UN ALUMNO ⬇️';
        alumnosIconDiv.style.backgroundColor = "#ffffff";
        alumnosIconDiv.style.color = "black";
        return;
    }
    alumnosMenu.innerHTML = '';

    let dataAlumnos = localStorage.getItem('surveyInfo');
    if (dataAlumnos) {
        let dataAlumnosObj = JSON.parse(dataAlumnos);
        let listadoAlumnos = dataAlumnosObj.data.map(alumno => alumno.email);

        listadoAlumnos.forEach(email => {
            let listItem = document.createElement('li');
            listItem.textContent = email;
            listItem.style.cursor = 'pointer';
            alumnosMenu.appendChild(listItem);
            listItem.addEventListener('click', () => {
                let alumno = dataAlumnosObj.data.find(alumno => alumno.email === email);
                localStorage.setItem("alumnoid", alumno.id);
                recoveryDataSurveyforSpecificUser();
            });
        });
        alumnosMenu.classList.add('open');
    } else {
        alert("No hay alumnos en este curso");
    }
}

function showInfoSpecificAlumno() {
    let infoAlumnoDiv = document.getElementsByClassName("infoAlumno")[0];
    let emailAlumnoDiv = document.getElementsByClassName("alumnoEmail")[0];
    let responsesAlumnoDiv = document.getElementsByClassName("responsesAlumno")[0];

    emailAlumnoDiv.innerHTML = "";
    responsesAlumnoDiv.innerHTML = "";

    let surveyInfoAlumno = localStorage.getItem("surveyInfoAlumno");
    let surveyInfoAlumnoObj = JSON.parse(surveyInfoAlumno);

    if (surveyInfoAlumnoObj && surveyInfoAlumnoObj.length > 0) {
        let email = surveyInfoAlumnoObj[0].email;
        emailAlumnoDiv.innerHTML = `Email: ${email}`;
        emailAlumnoDiv.style.fontWeight = 'bold';
        emailAlumnoDiv.style.color = '#333';

        let responses = surveyInfoAlumnoObj[0].answers;
        responses.forEach(response => {
            let responseElement = document.createElement('p');
            responseElement.style.margin = "10px 0";
            responseElement.style.padding = "10px";
            responseElement.style.borderRadius = "8px";
            responseElement.style.backgroundColor = "#efefef";
            responseElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

            let answerText = response.answer === null ? "No hay respuesta" : response.answer;

            responseElement.innerHTML = `<strong>${response.description}</strong><br>${answerText}<br>`;
            responsesAlumnoDiv.appendChild(responseElement);
        });

        infoAlumnoDiv.style.position = "fixed";
        infoAlumnoDiv.style.top = "50%";
        infoAlumnoDiv.style.left = "50%";
        infoAlumnoDiv.style.transform = "translate(-50%, -50%)";
        infoAlumnoDiv.style.visibility = "visible";
        infoAlumnoDiv.style.opacity = "1";
        infoAlumnoDiv.style.transition = "visibility 0s, opacity 0.4s";
        infoAlumnoDiv.style.backgroundColor = "white";
        infoAlumnoDiv.style.padding = "20px";
        infoAlumnoDiv.style.borderRadius = "10px";
        infoAlumnoDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
        infoAlumnoDiv.style.color = "black";

        infoAlumnoDiv.innerHTML = `Información del Alumno`;
        infoAlumnoDiv.appendChild(emailAlumnoDiv);
        infoAlumnoDiv.appendChild(responsesAlumnoDiv);

        let closeButton = document.createElement('button');
        closeButton.textContent = 'x';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.border = 'none';
        closeButton.style.background = 'red';
        closeButton.style.color = 'white';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = function () {
            infoAlumnoDiv.style.opacity = '0';
            infoAlumnoDiv.style.visibility = 'hidden';
        };
        infoAlumnoDiv.appendChild(closeButton);
    } else {
        console.log("No se encontraron datos del alumno.");
    }
}

function toggleMenu() {
    let menu = document.querySelector('.menu');
    let isActive = menu.classList.contains('active');
    let menuIcon = document.querySelector('.menu-icon');
    let searchInput = document.querySelector('.search-input');

    if (!isActive) {
        menu.classList.add('active');
        menuIcon.textContent = 'CERRAR';

        if (searchInput.value !== '') {
            searchCourse();
        } else {
            populateMenu(courseList);
        }
    } else {
        menu.classList.remove('active');
        menuIcon.textContent = '⬇️ MOSTRAR CURSOS ⬇️';
    }
}

function closeMenu() {
    let menu = document.querySelector('.menu');
    let menuIcon = document.querySelector('.menu-icon');
    let searchInput = document.querySelector('.search-input');

    menu.classList.remove('active');
    menuIcon.textContent = '⬇️ MOSTRAR CURSOS ⬇️';
    searchInput.value = '';
}

function populateMenu(courses) {
    let menu = document.querySelector('.menu');
    menu.innerHTML = '';
    courses.forEach(course => {
        let listItem = document.createElement('li');
        listItem.textContent = course.title;
        listItem.id = course.id;
        listItem.style.cursor = 'pointer';
        listItem.addEventListener('click', () => fetchCourseContent(course.id, course.title));
        menu.appendChild(listItem);
    });
    menu.classList.add('active');
}

function searchCourse() {
    let searchInput = document.querySelector('.search-input');
    let isActive = document.querySelector('.menu').classList.contains('active');
    let menuIcon = document.querySelector('.menu-icon');

    menuIcon.textContent = " CERRAR";
    searchActive = searchInput.value !== '';

    if (searchActive) {
        let searchResults = courseList.filter(course =>
            course.title.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        populateMenu(searchResults);
    } else if (isActive) {
        populateMenu(courseList);
    }
}

function resetSearchCourse() {
    let menuIcon = document.querySelector('.menu-icon');
    let searchInput = document.querySelector('.search-input');
    searchInput.value = '';
    searchCourse();

    menuIcon.textContent = "⬇️ MOSTRAR CURSOS ⬇️";
    closeMenu();
}

async function start() {
    setLoadingMenuIcon(true);
    await fetchCourseMeta();
    await getAllCourseIds();
    await populateCategoryMenu();
}

async function getAllCourseIds() {
    try {
        const response = await fetch(
            `https://academy.turiscool.com/admin/api/v2/courses`,
            requestOptions
        );
        if (!response.ok) {
            throw new Error("Failed to fetch cursos");
        }
        const data = await response.json();
        const courseIds = data.data.map(course => course.id);
        return courseIds;
    } catch (error) {
        console.error("Error:", error);
    }
}

function populateCategoryMenu() {
    console.log(categories);
    let categoryCardsContainer = document.querySelector('#categoryCards');
    let option = document.createElement('option');
    option.textContent = 'Filtrar por categoria';
    option.style.cursor = 'pointer';
    categoryCardsContainer.appendChild(option);
    categories.forEach(category => {
        let option = document.createElement('option');
        option.textContent = category;
        option.style.cursor = 'pointer';
        categoryCardsContainer.appendChild(option);
    });
    categoryCardsContainer.addEventListener('change', (e) => {
        let selectedCategory = e.target.value;
        let courseListFiltered = courseList.filter(course => course.categories.includes(selectedCategory));
        populateMenu(courseListFiltered);
    });
}

start();
