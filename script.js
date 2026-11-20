
/* =========================================================
   PAW HAVEN - LOCAL STORAGE VERSION
   Keeps existing records and adds missing default records.
   No Supabase required.
========================================================= */


/* =========================================================
   1. STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {
    users: "pawhaven_users",
    currentUser: "pawhaven_current_user",
    animals: "pawhaven_animals",
    applications: "pawhaven_applications"
};


/* =========================================================
   2. DEFAULT ADMIN ACCOUNT
========================================================= */

const DEFAULT_ADMIN = {
    id: "pawhaven-admin",
    name: "Paw Haven Admin",
    fullName: "Paw Haven Admin",
    email: "admin@pawhaven.com",
    username: "admin",
    password: "pawhaven123",
    role: "admin"
};


/* =========================================================
   3. DEFAULT ANIMAL RECORDS
========================================================= */

const DEFAULT_ANIMALS = [
    {
        id: "default-milo",
        name: "Milo",
        species: "Cat",
        breed: "Persian",
        age: "2 years",
        gender: "Male",
        status: "Available"
    },
    {
        id: "default-luna",
        name: "Luna",
        species: "Cat",
        breed: "Domestic Shorthair",
        age: "1 year",
        gender: "Female",
        status: "Available"
    },
    {
        id: "default-buddy",
        name: "Buddy",
        species: "Dog",
        breed: "Golden Retriever",
        age: "3 years",
        gender: "Male",
        status: "Adopted"
    },
    {
        id: "default-coco",
        name: "Coco",
        species: "Dog",
        breed: "Poodle",
        age: "8 months",
        gender: "Female",
        status: "Under Care"
    },
    {
        id: "default-oreo",
        name: "Oreo",
        species: "Rabbit",
        breed: "Mini Lop",
        age: "1 year",
        gender: "Male",
        status: "Available"
    }
];


/* =========================================================
   4. DEFAULT APPLICATION RECORDS
========================================================= */

const DEFAULT_APPLICATIONS = [
    {
        id: "default-app-1",
        applicant: "Sarah Tan",
        animal: "Milo",
        date: "2026-10-20",
        status: "Pending"
    },
    {
        id: "default-app-2",
        applicant: "Adam Lee",
        animal: "Buddy",
        date: "2026-10-22",
        status: "Approved"
    },
    {
        id: "default-app-3",
        applicant: "Aina Rahman",
        animal: "Luna",
        date: "2026-10-25",
        status: "Pending"
    },
    {
        id: "default-app-4",
        applicant: "Daniel Wong",
        animal: "Coco",
        date: "2026-10-28",
        status: "Declined"
    }
];


/* =========================================================
   5. STORAGE FUNCTIONS
========================================================= */

function getStorage(key, fallback = []) {
    try {
        const savedData = localStorage.getItem(key);

        if (savedData === null) {
            return fallback;
        }

        const parsedData = JSON.parse(savedData);

        return parsedData;

    } catch (error) {
        console.error("Storage reading error:", error);
        return fallback;
    }
}


function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;

    } catch (error) {
        console.error("Storage saving error:", error);
        alert("Unable to save data in this browser.");
        return false;
    }
}


function createId(prefix = "ph") {
    return prefix + "-" +
        Date.now() + "-" +
        Math.random().toString(36).substring(2, 8);
}


function normaliseText(value) {
    return String(value ?? "").trim().toLowerCase();
}


/* =========================================================
   6. INITIALISE DATA
   Existing records are preserved.
   Missing default records are added only once.
========================================================= */

function initialiseData() {

    // Initialise users without deleting existing users.
    let users = getStorage(STORAGE_KEYS.users, []);

    if (!Array.isArray(users)) {
        users = [];
    }

    const adminExists = users.some(user =>
        normaliseText(user.username) === "admin" ||
        normaliseText(user.email) === "admin@pawhaven.com"
    );

    if (!adminExists) {
        users.push({ ...DEFAULT_ADMIN });
    }

    saveStorage(STORAGE_KEYS.users, users);


    // Initialise animals and preserve existing records.
    let animals = getStorage(STORAGE_KEYS.animals, []);

    if (!Array.isArray(animals)) {
        animals = [];
    }

    DEFAULT_ANIMALS.forEach(defaultAnimal => {

        const alreadyExists = animals.some(animal =>
            normaliseText(animal.name) ===
            normaliseText(defaultAnimal.name)
        );

        if (!alreadyExists) {
            animals.push({ ...defaultAnimal });
        }

    });

    saveStorage(STORAGE_KEYS.animals, animals);


    // Initialise applications and preserve existing records.
    let applications = getStorage(
        STORAGE_KEYS.applications,
        []
    );

    if (!Array.isArray(applications)) {
        applications = [];
    }

    DEFAULT_APPLICATIONS.forEach(defaultApplication => {

        const alreadyExists = applications.some(application => {

            return (
                normaliseText(application.applicant) ===
                normaliseText(defaultApplication.applicant) &&

                normaliseText(application.animal) ===
                normaliseText(defaultApplication.animal) &&

                String(application.date || "") ===
                defaultApplication.date
            );

        });

        if (!alreadyExists) {
            applications.push({ ...defaultApplication });
        }

    });

    saveStorage(STORAGE_KEYS.applications, applications);

}


/* =========================================================
   7. LOGIN
========================================================= */

async function handleLogin(event) {

    if (event) {
        event.preventDefault();
    }

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const messageElement = document.getElementById("loginMessage");

    if (!usernameInput || !passwordInput) {
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {

        showMessage(
            messageElement,
            "Please enter your username and password.",
            "error"
        );

        return;
    }

    const users = getStorage(STORAGE_KEYS.users, []);

    const matchedUser = users.find(user => {

        const usernameMatches =
            normaliseText(user.username) === normaliseText(username) ||
            normaliseText(user.email) === normaliseText(username);

        const passwordMatches =
            String(user.password || "") === password;

        return usernameMatches && passwordMatches;

    });

    if (!matchedUser) {

        showMessage(
            messageElement,
            "Invalid username or password.",
            "error"
        );

        return;
    }

    const currentUser = {
        id: matchedUser.id,
        name: matchedUser.fullName || matchedUser.name || matchedUser.username,
        username: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role || "user"
    };

    saveStorage(STORAGE_KEYS.currentUser, currentUser);

    showMessage(
        messageElement,
        "Login successful! Redirecting...",
        "success"
    );

    window.location.href = "./dashboard.html";
}


/* =========================================================
   8. REGISTRATION
========================================================= */

async function handleRegistration(event) {

    if (event) {
        event.preventDefault();
    }

    const fullName = document.getElementById("fullName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    const messageElement = document.getElementById("registerMessage");

    if (!fullName || !email || !username || !password || !confirmPassword) {

        showMessage(
            messageElement,
            "Please complete all required fields.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        showMessage(
            messageElement,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    if (password !== confirmPassword) {

        showMessage(
            messageElement,
            "Passwords do not match.",
            "error"
        );

        return;
    }

    const agreeTerms = document.getElementById("agreeTerms");

    if (agreeTerms && !agreeTerms.checked) {

        showMessage(
            messageElement,
            "Please agree to the terms and conditions.",
            "error"
        );

        return;
    }

    const users = getStorage(STORAGE_KEYS.users, []);

    const duplicateUser = users.some(user => {

        return (
            normaliseText(user.username) === normaliseText(username) ||
            normaliseText(user.email) === normaliseText(email)
        );

    });

    if (duplicateUser) {

        showMessage(
            messageElement,
            "Username or email already exists.",
            "error"
        );

        return;
    }

    const newUser = {
        id: createId("user"),
        fullName: fullName,
        name: fullName,
        email: email,
        username: username,
        password: password,
        role: "user"
    };

    users.push(newUser);

    const saved = saveStorage(STORAGE_KEYS.users, users);

    if (!saved) {
        return;
    }

    showMessage(
        messageElement,
        "Registration successful! You can now sign in.",
        "success"
    );

    const registrationForm =
        document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.reset();
    }

}


/* =========================================================
   9. LOGOUT
========================================================= */

function handleLogout(event) {

    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem(STORAGE_KEYS.currentUser);

    window.location.href = "./login.html";
}


/* =========================================================
   10. LOGIN SESSION
========================================================= */

function getCurrentUser() {

    return getStorage(
        STORAGE_KEYS.currentUser,
        null
    );

}


function checkLoginSession() {

    const currentUser = getCurrentUser();

    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const protectedPages = [
        "dashboard.html",
        "animals.html",
        "applications.html",
        "about.html"
    ];

    const authPages = [
        "login.html",
        "registration.html",
        "register.html"
    ];

    if (
        protectedPages.includes(currentPage) &&
        !currentUser
    ) {
        window.location.href = "./login.html";
        return false;
    }

    if (
        authPages.includes(currentPage) &&
        currentUser
    ) {
        window.location.href = "./dashboard.html";
        return false;
    }

    return true;
}


/* =========================================================
   11. USER PROFILE
========================================================= */

function displayUserProfile() {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        return;
    }

    const displayName =
        currentUser.name ||
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";

    const adminName = document.getElementById("adminName");
    const adminAvatar = document.getElementById("adminAvatar");
    const adminTopbarName = document.getElementById("adminTopbarName");

    if (adminName) {
        adminName.textContent = displayName;
    }

    if (adminTopbarName) {
        adminTopbarName.textContent = displayName;
    }

    if (adminAvatar) {
        adminAvatar.textContent =
            displayName.charAt(0).toUpperCase();
    }

}


/* =========================================================
   12. MESSAGE HELPER
========================================================= */

function showMessage(element, message, type = "error") {

    if (!element) {
        if (type === "error") {
            alert(message);
        }
        return;
    }

    element.textContent = message;
    element.className = "form-feedback " + type;
    element.style.display = "block";

}


/* =========================================================
   13. GET ANIMALS AND APPLICATIONS
========================================================= */

function getAnimals() {
    return getStorage(STORAGE_KEYS.animals, []);
}


function getApplications() {
    return getStorage(STORAGE_KEYS.applications, []);
}


/* =========================================================
   14. DASHBOARD STATISTICS
========================================================= */

function updateDashboardStats() {

    const animals = getAnimals();
    const applications = getApplications();

    const totalAnimals = animals.length;

    const availableAnimals = animals.filter(animal =>
        normaliseText(animal.status) === "available"
    ).length;

    const adoptedAnimals = animals.filter(animal =>
        normaliseText(animal.status) === "adopted"
    ).length;

    const pendingApplications = applications.filter(application =>
        normaliseText(application.status) === "pending"
    ).length;


    const totalElement = document.getElementById("totalAnimals");
    const availableElement = document.getElementById("availableAnimals");
    const adoptedElement = document.getElementById("adoptedAnimals");
    const pendingElement = document.getElementById("pendingApplications");


    if (totalElement) {
        totalElement.textContent = totalAnimals;
    }

    if (availableElement) {
        availableElement.textContent = availableAnimals;
    }

    if (adoptedElement) {
        adoptedElement.textContent = adoptedAnimals;
    }

    if (pendingElement) {
        pendingElement.textContent = pendingApplications;
    }

}


/* =========================================================
   15. RECENT ANIMALS TABLE
========================================================= */

function displayRecentAnimals() {

    const tableBody = document.getElementById("recentAnimalsTable");

    if (!tableBody) {
        return;
    }

    const animals = getAnimals();

    const recentAnimals = [...animals].slice(-5).reverse();

    if (recentAnimals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">No animal records found.</td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = recentAnimals.map(animal => `

        <tr>
            <td><strong>${escapeHTML(animal.name)}</strong></td>
            <td>${escapeHTML(animal.species)}</td>
            <td>${escapeHTML(animal.breed)}</td>
            <td>${escapeHTML(animal.age)}</td>
            <td>${getStatusBadge(animal.status)}</td>
        </tr>

    `).join("");

}


/* =========================================================
   16. ANIMAL STATUS BADGE
========================================================= */

function getStatusBadge(status) {

    const safeStatus = String(status || "Available");
    const statusClass = normaliseText(safeStatus)
        .replace(/\s+/g, "-");

    return `
        <span class="status-badge ${escapeHTML(statusClass)}">
            ${escapeHTML(safeStatus)}
        </span>
    `;

}


/* =========================================================
   17. DISPLAY ANIMALS
========================================================= */

function displayAnimals(list = null) {

    const tableBody = document.getElementById("animalTableBody");

    if (!tableBody) {
        return;
    }

    const animals = list || getAnimals();

    if (animals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No animal records found.</td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = animals.map(animal => `

        <tr>

            <td>
                <strong>${escapeHTML(animal.name)}</strong>
            </td>

            <td>${escapeHTML(animal.species)}</td>

            <td>${escapeHTML(animal.breed)}</td>

            <td>${escapeHTML(animal.age)}</td>

            <td>${escapeHTML(animal.gender)}</td>

            <td>${getStatusBadge(animal.status)}</td>

            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteAnimal('${escapeHTML(animal.id)}')"
                    aria-label="Delete ${escapeHTML(animal.name)}">

                    <i class="fa-solid fa-trash"></i>

                </button>
            </td>

        </tr>

    `).join("");

}


/* =========================================================
   18. ADD ANIMAL
========================================================= */

function addAnimal(event) {

    if (event) {
        event.preventDefault();
    }

    const name = document.getElementById("animalName")?.value.trim();
    const species = document.getElementById("animalSpecies")?.value;
    const breed = document.getElementById("animalBreed")?.value.trim();
    const age = document.getElementById("animalAge")?.value.trim();
    const gender = document.getElementById("animalGender")?.value;
    const status = document.getElementById("animalStatus")?.value;

    if (!name || !species || !breed || !age || !gender || !status) {
        alert("Please complete all animal information.");
        return;
    }

    const animals = getAnimals();

    const duplicate = animals.some(animal =>
        normaliseText(animal.name) === normaliseText(name)
    );

    if (duplicate) {
        alert("An animal with this name already exists.");
        return;
    }

    const newAnimal = {
        id: createId("animal"),
        name,
        species,
        breed,
        age,
        gender,
        status
    };

    animals.push(newAnimal);

    if (!saveStorage(STORAGE_KEYS.animals, animals)) {
        return;
    }

    const form = document.getElementById("addAnimalForm");

    if (form) {
        form.reset();
    }

    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    refreshDashboardCharts();

    if (typeof closeAnimalModal === "function") {
        closeAnimalModal();
    }

    alert("Animal added successfully!");

}


/* =========================================================
   19. DELETE ANIMAL
========================================================= */

function deleteAnimal(id) {

    if (!confirm("Are you sure you want to delete this animal?")) {
        return;
    }

    let animals = getAnimals();

    animals = animals.filter(animal =>
        String(animal.id) !== String(id)
    );

    saveStorage(STORAGE_KEYS.animals, animals);

    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    refreshDashboardCharts();

}


/* =========================================================
   20. SEARCH AND FILTER ANIMALS
========================================================= */

function filterAnimals() {

    const searchInput = document.getElementById("animalSearch");
    const filterInput = document.getElementById("animalFilter");

    const searchTerm = normaliseText(searchInput?.value || "");
    const selectedFilter = normaliseText(filterInput?.value || "");

    const animals = getAnimals();

    const filteredAnimals = animals.filter(animal => {

        const matchesSearch =
            normaliseText(animal.name).includes(searchTerm) ||
            normaliseText(animal.species).includes(searchTerm) ||
            normaliseText(animal.breed).includes(searchTerm);

        const matchesFilter =
            !selectedFilter ||
            selectedFilter === "all" ||
            normaliseText(animal.species) === selectedFilter ||
            normaliseText(animal.status) === selectedFilter;

        return matchesSearch && matchesFilter;

    });

    displayAnimals(filteredAnimals);

}


/* =========================================================
   21. DISPLAY APPLICATIONS
========================================================= */

function displayApplications() {

    const tableBody = document.getElementById("applicationTableBody");

    if (!tableBody) {
        return;
    }

    const applications = getApplications();

    if (applications.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">No applications found.</td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = applications.map(application => `

        <tr>

            <td>
                <strong>${escapeHTML(application.applicant)}</strong>
            </td>

            <td>${escapeHTML(application.animal)}</td>

            <td>${escapeHTML(application.date)}</td>

            <td>${getStatusBadge(application.status)}</td>

            <td>

                <select
                    class="form-select form-select-sm application-status-select"
                    data-application-id="${escapeHTML(application.id)}">

                    <option value="Pending"
                        ${application.status === "Pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="Approved"
                        ${application.status === "Approved" ? "selected" : ""}>
                        Approved
                    </option>

                    <option value="Declined"
                        ${application.status === "Declined" ? "selected" : ""}>
                        Declined
                    </option>

                </select>

            </td>

        </tr>

    `).join("");

}


/* =========================================================
   22. UPDATE APPLICATION STATUS
========================================================= */

function updateApplicationStatus(id, newStatus) {

    const validStatuses = ["Pending", "Approved", "Declined"];

    if (!validStatuses.includes(newStatus)) {
        return;
    }

    const applications = getApplications();

    const applicationIndex = applications.findIndex(application =>
        String(application.id) === String(id)
    );

    if (applicationIndex === -1) {
        return;
    }

    applications[applicationIndex].status = newStatus;

    saveStorage(STORAGE_KEYS.applications, applications);


    // Update the corresponding animal's status.
    const animals = getAnimals();

    const application = applications[applicationIndex];

    const relatedAnimal = animals.find(animal =>
        normaliseText(animal.name) ===
        normaliseText(application.animal)
    );

    if (relatedAnimal) {

        if (newStatus === "Approved") {
            relatedAnimal.status = "Adopted";
        } else if (
            newStatus === "Pending" &&
            normaliseText(relatedAnimal.status) === "adopted"
        ) {
            relatedAnimal.status = "Available";
        }

        saveStorage(STORAGE_KEYS.animals, animals);
    }

    displayApplications();
    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    refreshDashboardCharts();

}


/* =========================================================
   23. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


/* =========================================================
   24. APPROVED ADOPTIONS CHART
========================================================= */

let adoptionChart = null;


function initialiseAdoptionChart() {

    const chartElement = document.getElementById("adoptionChart");

    if (!chartElement || typeof ApexCharts === "undefined") {
        return;
    }

    const applications = getApplications();

    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    const currentYear = new Date().getFullYear();

    const monthlyData = months.map((month, index) => {

        return applications.filter(application => {

            if (application.status !== "Approved") {
                return false;
            }

            const date = new Date(application.date + "T00:00:00");

            return (
                date.getFullYear() === currentYear &&
                date.getMonth() === index
            );

        }).length;

    });

    if (adoptionChart) {
        adoptionChart.destroy();
    }

    const options = {

        series: [{
            name: "Approved Applications",
            data: monthlyData
        }],

        chart: {
            type: "area",
            height: 300,
            toolbar: {
                show: false
            },
            fontFamily: "DM Sans, sans-serif"
        },

        colors: ["#71836b"],

        stroke: {
            curve: "smooth",
            width: 3
        },

        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.35,
                opacityTo: 0.05
            }
        },

        dataLabels: {
            enabled: false
        },

        xaxis: {
            categories: months
        },

        yaxis: {
            min: 0,
            forceNiceScale: true
        },

        grid: {
            borderColor: "#eee9e1",
            strokeDashArray: 4
        },

        tooltip: {
            y: {
                formatter: value => value + " approved applications"
            }
        }

    };

    adoptionChart = new ApexCharts(chartElement, options);

    adoptionChart.render();

}


/* =========================================================
   25. ANIMALS BY SPECIES CHART
========================================================= */

let statusChart = null;


function initialiseStatusChart() {

    const chartElement = document.getElementById("statusChart");

    if (!chartElement || typeof ApexCharts === "undefined") {
        return;
    }

    const animals = getAnimals();

    const speciesNames = [...new Set(
        animals.map(animal => animal.species || "Other")
    )];

    const speciesCounts = speciesNames.map(species => {

        return animals.filter(animal =>
            normaliseText(animal.species) === normaliseText(species)
        ).length;

    });

    if (statusChart) {
        statusChart.destroy();
    }

    const options = {

        series: speciesCounts,

        labels: speciesNames,

        chart: {
            type: "donut",
            height: 300,
            fontFamily: "DM Sans, sans-serif"
        },

        colors: [
            "#71836b",
            "#d9b39e",
            "#b6a9c6",
            "#e7ca83",
            "#9db7bd"
        ],

        legend: {
            position: "bottom"
        },

        dataLabels: {
            enabled: true
        },

        stroke: {
            show: true,
            colors: ["#ffffff"],
            width: 3
        },

        plotOptions: {
            pie: {
                donut: {
                    size: "65%"
                }
            }
        }

    };

    statusChart = new ApexCharts(chartElement, options);

    statusChart.render();

}


/* =========================================================
   26. REFRESH DASHBOARD CHARTS
========================================================= */

function refreshDashboardCharts() {

    initialiseAdoptionChart();
    initialiseStatusChart();

}


/* =========================================================
   27. MOBILE SIDEBAR
========================================================= */

function initialiseMobileMenu() {

    const menuButton = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener("click", function () {

        sidebar.classList.toggle("active");

    });

}


/* =========================================================
   28. EVENT LISTENERS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Add default records without deleting existing data.
    initialiseData();

    // Check login session.
    const sessionAllowed = checkLoginSession();

    if (!sessionAllowed) {
        return;
    }

    // Display profile.
    displayUserProfile();


    // Login form.
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }


    // Registration form.
    const registrationForm =
        document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.addEventListener(
            "submit",
            handleRegistration
        );
    }


    // Logout links and buttons.
    document.addEventListener("click", function (event) {

        const logoutButton = event.target.closest(
            "#logoutLink, #logoutBtn, .logout-btn, [data-logout]"
        );

        if (logoutButton) {
            handleLogout(event);
        }

    });


    // Dashboard statistics.
    updateDashboardStats();

    // Dashboard tables.
    displayRecentAnimals();

    // Dashboard charts.
    refreshDashboardCharts();


    // Animal management.
    displayAnimals();

    const animalForm = document.getElementById("addAnimalForm");

    if (animalForm) {
        animalForm.addEventListener("submit", addAnimal);
    }


    const animalSearch = document.getElementById("animalSearch");

    if (animalSearch) {
        animalSearch.addEventListener("input", filterAnimals);
    }


    const animalFilter = document.getElementById("animalFilter");

    if (animalFilter) {
        animalFilter.addEventListener("change", filterAnimals);
    }


    // Applications.
    displayApplications();

    const applicationTableBody =
        document.getElementById("applicationTableBody");

    if (applicationTableBody) {

        applicationTableBody.addEventListener("change", function (event) {

            const select = event.target.closest(
                ".application-status-select"
            );

            if (!select) {
                return;
            }

            updateApplicationStatus(
                select.dataset.applicationId,
                select.value
            );

        });

    }


    // Mobile sidebar.
    initialiseMobileMenu();


    // Current year.
    const yearElements = document.querySelectorAll(
        "#currentYear, [data-year]"
    );

    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });

});
