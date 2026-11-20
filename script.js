
/* =====================================================
   PAW HAVEN - COMPLETE MAIN JAVASCRIPT
   Authentication, Dashboard, Animals & Applications
===================================================== */


/* =====================================================
   1. LOCAL STORAGE KEYS
===================================================== */

const USERS_KEY = "pawhaven_users";
const CURRENT_USER_KEY = "pawhaven_current_user";
const ANIMALS_KEY = "pawhaven_animals";
const APPLICATIONS_KEY = "pawhaven_applications";


/* =====================================================
   2. DEFAULT DATA
===================================================== */

const DEFAULT_ADMIN = {
    name: "Paw Haven Admin",
    email: "admin@pawhaven.com",
    username: "admin",
    password: "pawhaven123",
    role: "admin"
};


const DEFAULT_ANIMALS = [
    {
        id: 1,
        name: "Milo",
        species: "Cat",
        breed: "Persian",
        age: "2 years",
        gender: "Male",
        status: "Available"
    },
    {
        id: 2,
        name: "Luna",
        species: "Cat",
        breed: "Domestic Shorthair",
        age: "1 year",
        gender: "Female",
        status: "Available"
    },
    {
        id: 3,
        name: "Buddy",
        species: "Dog",
        breed: "Golden Retriever",
        age: "3 years",
        gender: "Male",
        status: "Adopted"
    },
    {
        id: 4,
        name: "Coco",
        species: "Dog",
        breed: "Poodle",
        age: "8 months",
        gender: "Female",
        status: "Under Care"
    },
    {
        id: 5,
        name: "Oreo",
        species: "Rabbit",
        breed: "Mini Lop",
        age: "1 year",
        gender: "Male",
        status: "Available"
    }
];


const DEFAULT_APPLICATIONS = [
    {
        id: 1,
        applicant: "Sarah Tan",
        animal: "Milo",
        date: "2026-10-20",
        status: "Pending"
    },
    {
        id: 2,
        applicant: "Adam Lee",
        animal: "Buddy",
        date: "2026-10-22",
        status: "Approved"
    },
    {
        id: 3,
        applicant: "Aina Rahman",
        animal: "Luna",
        date: "2026-10-25",
        status: "Pending"
    },
    {
        id: 4,
        applicant: "Daniel Wong",
        animal: "Coco",
        date: "2026-10-28",
        status: "Declined"
    }
];


/* =====================================================
   3. STORAGE FUNCTIONS
===================================================== */

function getStorage(key, defaultValue = []) {

    try {

        const data = localStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error("Storage reading error:", error);

        return defaultValue;

    }

}


function saveStorage(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error("Storage saving error:", error);

        alert(
            "Unable to save information. Please check your browser storage."
        );

        return false;

    }

}


/* =====================================================
   4. INITIALISE DEFAULT DATA
===================================================== */

function initialiseData() {

    // Initialise users.

    let users = getStorage(USERS_KEY, []);

    if (!Array.isArray(users)) {
        users = [];
    }

    const adminExists = users.some(function(user) {

        return user.username &&
            user.username.toLowerCase() === "admin";

    });

    if (!adminExists) {

        users.push(DEFAULT_ADMIN);

    }

    saveStorage(USERS_KEY, users);


    // Initialise animal records.

    const savedAnimals = localStorage.getItem(ANIMALS_KEY);

    if (savedAnimals === null) {

        saveStorage(ANIMALS_KEY, DEFAULT_ANIMALS);

    } else {

        try {

            if (!Array.isArray(JSON.parse(savedAnimals))) {
                saveStorage(ANIMALS_KEY, DEFAULT_ANIMALS);
            }

        } catch (error) {

            saveStorage(ANIMALS_KEY, DEFAULT_ANIMALS);

        }

    }


    // Initialise applications.

    const savedApplications = localStorage.getItem(APPLICATIONS_KEY);

    if (savedApplications === null) {

        saveStorage(
            APPLICATIONS_KEY,
            DEFAULT_APPLICATIONS
        );

    } else {

        try {

            if (!Array.isArray(JSON.parse(savedApplications))) {

                saveStorage(
                    APPLICATIONS_KEY,
                    DEFAULT_APPLICATIONS
                );

            }

        } catch (error) {

            saveStorage(
                APPLICATIONS_KEY,
                DEFAULT_APPLICATIONS
            );

        }

    }

}


/* =====================================================
   5. LOGIN
===================================================== */

function handleLogin(event) {

    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const message = document.getElementById("loginMessage");

    if (!usernameInput || !passwordInput) {

        console.error("Login fields not found.");

        return;

    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const users = getStorage(USERS_KEY, []);


    function showMessage(text, color) {

        if (message) {

            message.textContent = text;
            message.style.color = color;

        }

    }


    if (!username || !password) {

        showMessage(
            "Please enter your username and password.",
            "#dc3545"
        );

        return;

    }


    const user = users.find(function(account) {

        return account.username &&
            account.password &&
            account.username.toLowerCase() === username.toLowerCase() &&
            account.password === password;

    });


    if (!user) {

        showMessage(
            "Invalid username or password.",
            "#dc3545"
        );

        return;

    }


    const currentUser = {

        name: user.name || user.username,
        username: user.username,
        email: user.email || "",
        role: user.role || "user"

    };


    if (!saveStorage(CURRENT_USER_KEY, currentUser)) {
        return;
    }


    showMessage(
        "Login successful! Redirecting...",
        "#198754"
    );


    window.location.href = "dashboard.html";

}


/* =====================================================
   6. REGISTRATION
===================================================== */

function handleRegistration(event) {

    event.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    const agreeTerms = document.getElementById("agreeTerms");
    const message = document.getElementById("registerMessage");

    const users = getStorage(USERS_KEY, []);


    function showMessage(text, color = "#dc3545") {

        if (message) {

            message.textContent = text;
            message.style.color = color;

        }

    }


    if (
        !fullName ||
        !email ||
        !username ||
        !password ||
        !confirmPassword
    ) {

        showMessage("Please complete all required fields.");

        return;

    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters."
        );

        return;

    }


    if (password !== confirmPassword) {

        showMessage("Passwords do not match.");

        return;

    }


    if (!agreeTerms || !agreeTerms.checked) {

        showMessage(
            "Please agree to the terms and conditions."
        );

        return;

    }


    const usernameExists = users.some(function(user) {

        return user.username &&
            user.username.toLowerCase() === username.toLowerCase();

    });


    if (usernameExists) {

        showMessage("Username already exists.");

        return;

    }


    const emailExists = users.some(function(user) {

        return user.email &&
            user.email.toLowerCase() === email.toLowerCase();

    });


    if (emailExists) {

        showMessage("Email is already registered.");

        return;

    }


    const newUser = {

        name: fullName,
        email: email,
        username: username,
        password: password,
        role: "user"

    };


    users.push(newUser);


    if (!saveStorage(USERS_KEY, users)) {
        return;
    }


    showMessage(
        "Account created successfully! Redirecting to login...",
        "#198754"
    );


    const form = document.getElementById("registrationForm");

    if (form) {
        form.reset();
    }


    setTimeout(function() {

        window.location.href = "login.html";

    }, 1500);

}


/* =====================================================
   7. LOGOUT
===================================================== */

function handleLogout(event) {

    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem(CURRENT_USER_KEY);

    window.location.href = "login.html";

}


/* =====================================================
   8. LOGIN SESSION PROTECTION
===================================================== */

function checkLoginSession() {

    const currentUser = getStorage(
        CURRENT_USER_KEY,
        null
    );

    const protectedPages = [
        "dashboard.html",
        "animals.html",
        "applications.html",
        "about.html"
    ];


    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();


    const isLoggedIn = currentUser &&
        typeof currentUser === "object" &&
        currentUser.username;


    if (protectedPages.includes(currentPage) && !isLoggedIn) {

        window.location.replace("login.html");

        return false;

    }

    return true;

}


/* =====================================================
   9. DISPLAY USER PROFILE
===================================================== */

function displayUserProfile() {

    const user = getStorage(
        CURRENT_USER_KEY,
        null
    );

    if (!user || !user.name) {
        return;
    }


    const nameElements = document.querySelectorAll(
        "#adminName, #adminTopbarName, .admin-name, [data-user-name]"
    );


    nameElements.forEach(function(element) {

        element.textContent = user.name;

    });


    const initials = user.name
        .trim()
        .split(/\s+/)
        .map(function(word) {

            return word.charAt(0);

        })
        .join("")
        .substring(0, 2)
        .toUpperCase();


    const avatarElements = document.querySelectorAll(
        "#adminAvatar, .admin-avatar, [data-user-avatar]"
    );


    avatarElements.forEach(function(element) {

        element.textContent = initials;

    });

}


/* =====================================================
   10. DASHBOARD STATISTICS
===================================================== */

function updateDashboardStats() {

    const animals = getStorage(ANIMALS_KEY, []);
    const applications = getStorage(APPLICATIONS_KEY, []);


    const stats = {

        totalAnimals: animals.length,

        availableAnimals: animals.filter(function(animal) {

            return animal.status === "Available";

        }).length,

        adoptedAnimals: animals.filter(function(animal) {

            return animal.status === "Adopted";

        }).length,

        pendingApplications: applications.filter(function(application) {

            return application.status === "Pending";

        }).length

    };


    Object.keys(stats).forEach(function(key) {

        const element = document.getElementById(key);

        if (element) {

            element.textContent = stats[key];

        }

    });

}


/* =====================================================
   11. DASHBOARD - APPROVED ADOPTIONS CHART
===================================================== */

function initialiseAdoptionChart() {

    const chartElement = document.getElementById("adoptionChart");

    if (!chartElement || typeof ApexCharts === "undefined") {
        return;
    }


    const applications = getStorage(APPLICATIONS_KEY, []);

    const months = [
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];


    const monthlyData = months.map(function(month, index) {

        const monthNumber = index + 5;

        return applications.filter(function(application) {

            if (application.status !== "Approved") {
                return false;
            }

            const date = new Date(
                application.date + "T00:00:00"
            );

            return date.getFullYear() === 2026 &&
                date.getMonth() + 1 === monthNumber;

        }).length;

    });


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

        dataLabels: {
            enabled: false
        },

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

        xaxis: {
            categories: months
        },

        yaxis: {
            min: 0,
            forceNiceScale: true
        },

        grid: {
            borderColor: "#eeeeee"
        },

        tooltip: {
            theme: "light"
        }

    };


    new ApexCharts(chartElement, options).render();

}


/* =====================================================
   12. DASHBOARD - ANIMALS BY SPECIES CHART
===================================================== */

function initialiseStatusChart() {

    const chartElement = document.getElementById("statusChart");

    if (!chartElement || typeof ApexCharts === "undefined") {
        return;
    }


    const animals = getStorage(ANIMALS_KEY, []);

    const speciesCounts = {};


    animals.forEach(function(animal) {

        const species = animal.species || "Other";

        speciesCounts[species] =
            (speciesCounts[species] || 0) + 1;

    });


    const options = {

        series: Object.values(speciesCounts),

        chart: {
            type: "donut",
            height: 300,
            fontFamily: "DM Sans, sans-serif"
        },

        labels: Object.keys(speciesCounts),

        colors: [
            "#71836b",
            "#d9b39e",
            "#b6a9c6",
            "#e8c979",
            "#9db7b0"
        ],

        legend: {
            position: "bottom"
        },

        dataLabels: {
            enabled: true
        },

        plotOptions: {
            pie: {
                donut: {
                    size: "65%"
                }
            }
        }

    };


    new ApexCharts(chartElement, options).render();

}


/* =====================================================
   13. DISPLAY RECENT ANIMALS
===================================================== */

function displayRecentAnimals() {

    const tableBody = document.getElementById(
        "recentAnimalsTable"
    );

    if (!tableBody) {
        return;
    }


    const animals = getStorage(ANIMALS_KEY, []);

    tableBody.innerHTML = "";


    if (animals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No animal records available.
                </td>
            </tr>
        `;

        return;

    }


    const recentAnimals = [...animals]
        .slice(-5)
        .reverse();


    recentAnimals.forEach(function(animal) {

        const row = document.createElement("tr");

        const values = [
            animal.name,
            animal.species,
            animal.breed,
            animal.age,
            animal.status
        ];


        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value || "-";

            row.appendChild(cell);

        });


        tableBody.appendChild(row);

    });

}


/* =====================================================
   14. DISPLAY ANIMAL RECORDS
===================================================== */


function displayAnimals() {

    const tableBody = document.getElementById("animalTableBody");

    if (!tableBody) {
        return;
    }

    const animals = getStorage(ANIMALS_KEY, []);

    tableBody.innerHTML = "";

    if (!Array.isArray(animals) || animals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No animal records available.
                </td>
            </tr>
        `;

        return;
    }

    animals.forEach(function (animal) {

        const row = document.createElement("tr");

        // Animal name
        const nameCell = document.createElement("td");

        nameCell.innerHTML = `
            <div class="ph-animal-name">
                <div class="ph-animal-avatar">
                    <i class="fa-solid fa-paw"></i>
                </div>
                <span></span>
            </div>
        `;

        nameCell.querySelector("span").textContent = animal.name || "-";

        row.appendChild(nameCell);

        // Other information
        const values = [
            animal.species,
            animal.breed,
            animal.age,
            animal.gender
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value || "-";

            row.appendChild(cell);

        });

        // Status
        const statusCell = document.createElement("td");

        const status = document.createElement("span");

        status.className = "ph-status";

        if (animal.status === "Available") {
            status.classList.add("available");
        } else if (animal.status === "Adopted") {
            status.classList.add("adopted");
        } else {
            status.classList.add("care");
        }

        status.textContent = animal.status || "-";

        statusCell.appendChild(status);

        row.appendChild(statusCell);

        // Delete button
        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "ph-delete-btn";

        deleteButton.innerHTML = `
            <i class="fa-solid fa-trash"></i>
        `;

        deleteButton.title = "Delete animal";

        deleteButton.addEventListener("click", function () {

            deleteAnimal(animal.id);

        });

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}



/* =====================================================
   15. ADD NEW ANIMAL
===================================================== */


function addAnimal(event) {

    event.preventDefault();

    const name = document.getElementById("animalName").value.trim();
    const species = document.getElementById("animalSpecies").value;
    const breed = document.getElementById("animalBreed").value.trim();
    const age = document.getElementById("animalAge").value.trim();
    const gender = document.getElementById("animalGender").value;
    const status = document.getElementById("animalStatus").value;

    if (!name || !species || !breed || !age || !gender || !status) {

        alert("Please complete all animal information.");

        return;

    }

    let animals = getStorage(ANIMALS_KEY, []);

    if (!Array.isArray(animals)) {
        animals = [];
    }

    const newAnimal = {

        id: Date.now(),
        name: name,
        species: species,
        breed: breed,
        age: age,
        gender: gender,
        status: status

    };

    animals.push(newAnimal);

    saveStorage(ANIMALS_KEY, animals);

    // Verify storage
    const savedAnimals = getStorage(ANIMALS_KEY, []);

    const exists = savedAnimals.some(function (animal) {

        return animal.id === newAnimal.id;

    });

    if (!exists) {

        alert("Unable to save animal information.");

        return;

    }

    // Reset form
    document.getElementById("addAnimalForm").reset();

    // Refresh records
    displayAnimals();

    displayRecentAnimals();

    updateDashboardStats();

    // Close modal
    if (typeof closeAnimalModal === "function") {
        closeAnimalModal();
    }

    alert("Animal added successfully!");

}

/* =====================================================
   16. CLOSE ANIMAL MODAL
===================================================== */

function closeAnimalModal() {

    if (typeof bootstrap === "undefined") {
        return;
    }


    const modalElement =
        document.getElementById("addAnimalModal") ||
        document.getElementById("animalModal");


    if (!modalElement) {
        return;
    }


    const modalInstance =
        bootstrap.Modal.getInstance(modalElement);


    if (modalInstance) {
        modalInstance.hide();
    }

}


/* =====================================================
   17. DELETE ANIMAL
===================================================== */

function deleteAnimal(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this animal?"
    );

    if (!confirmed) {
        return;
    }


    let animals = getStorage(ANIMALS_KEY, []);


    animals = animals.filter(function(animal) {

        return String(animal.id) !== String(id);

    });


    if (!saveStorage(ANIMALS_KEY, animals)) {
        return;
    }


    displayAnimals();

    displayRecentAnimals();

    updateDashboardStats();

    refreshDashboardCharts();


    console.log("Animal deleted:", id);

}


/* =====================================================
   18. SEARCH AND FILTER ANIMALS
===================================================== */

function filterAnimals() {

    const searchInput = document.getElementById(
        "animalSearch"
    );

    const filterSelect = document.getElementById(
        "animalFilter"
    );

    const tableBody = document.getElementById(
        "animalTableBody"
    );


    if (!tableBody) {
        return;
    }


    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";


    const filter = filterSelect
        ? filterSelect.value
        : "All";


    const animals = getStorage(ANIMALS_KEY, []);


    const filteredAnimals = animals.filter(function(animal) {

        const matchesSearch =

            (animal.name || "").toLowerCase().includes(search) ||

            (animal.species || "").toLowerCase().includes(search) ||

            (animal.breed || "").toLowerCase().includes(search);


        const matchesFilter =

            filter === "All" ||
            animal.status === filter;


        return matchesSearch && matchesFilter;

    });


    tableBody.innerHTML = "";


    if (filteredAnimals.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No matching animals found.
                </td>
            </tr>
        `;

        return;

    }


    filteredAnimals.forEach(function(animal) {

        const row = document.createElement("tr");


        const values = [
            animal.name,
            animal.species,
            animal.breed,
            animal.age,
            animal.gender,
            animal.status
        ];


        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value || "-";

            row.appendChild(cell);

        });


        const actionCell = document.createElement("td");

        const button = document.createElement("button");

        button.type = "button";

        button.textContent = "Delete";

        button.className =
            "btn btn-sm btn-outline-danger";


        button.addEventListener("click", function() {

            deleteAnimal(animal.id);

        });


        actionCell.appendChild(button);

        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}


/* =====================================================
   19. DISPLAY APPLICATIONS
===================================================== */

function displayApplications() {

    const tableBody = document.getElementById(
        "applicationTableBody"
    );


    if (!tableBody) {
        return;
    }


    const applications = getStorage(
        APPLICATIONS_KEY,
        []
    );


    tableBody.innerHTML = "";


    if (applications.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No applications available.
                </td>
            </tr>
        `;

        return;

    }


    applications.forEach(function(application) {

        const row = document.createElement("tr");


        const applicantCell = document.createElement("td");

        applicantCell.textContent = application.applicant || "-";


        const animalCell = document.createElement("td");

        animalCell.textContent = application.animal || "-";


        const dateCell = document.createElement("td");

        dateCell.textContent = application.date || "-";


        const statusCell = document.createElement("td");

        statusCell.textContent = application.status || "-";


        const actionCell = document.createElement("td");

        const statusSelect = document.createElement("select");

        statusSelect.className =
            "form-select form-select-sm";


        ["Pending", "Approved", "Declined"].forEach(function(status) {

            const option = document.createElement("option");

            option.value = status;

            option.textContent = status;

            statusSelect.appendChild(option);

        });


        statusSelect.value = application.status;


        statusSelect.addEventListener("change", function() {

            updateApplicationStatus(
                application.id,
                statusSelect.value
            );

        });


        actionCell.appendChild(statusSelect);


        row.append(
            applicantCell,
            animalCell,
            dateCell,
            statusCell,
            actionCell
        );


        tableBody.appendChild(row);

    });

}


/* =====================================================
   20. UPDATE APPLICATION STATUS
===================================================== */

function updateApplicationStatus(id, newStatus) {

    const applications = getStorage(
        APPLICATIONS_KEY,
        []
    );


    const application = applications.find(function(item) {

        return String(item.id) === String(id);

    });


    if (!application) {
        return;
    }


    const oldStatus = application.status;


    const animals = getStorage(
        ANIMALS_KEY,
        []
    );


    const animal = animals.find(function(item) {

        return item.name === application.animal;

    });


    // Check if another application is already approved.

    if (newStatus === "Approved") {

        const anotherApproved = applications.some(function(item) {

            return item.animal === application.animal &&
                item.status === "Approved" &&
                String(item.id) !== String(id);

        });


        if (anotherApproved) {

            alert(
                "This animal already has an approved application."
            );

            displayApplications();

            return;

        }


        if (
            animal &&
            animal.status !== "Available" &&
            oldStatus !== "Approved"
        ) {

            alert(
                "This animal is not currently available."
            );

            displayApplications();

            return;

        }

    }


    // Update application status.

    application.status = newStatus;


    // Update animal status.

    if (
        animal &&
        oldStatus !== "Approved" &&
        newStatus === "Approved"
    ) {

        animal.status = "Adopted";

    }


    // Return animal to available if approval is cancelled.

    else if (
        animal &&
        oldStatus === "Approved" &&
        newStatus !== "Approved"
    ) {

        const otherApproved = applications.some(function(item) {

            return item.animal === application.animal &&
                item.status === "Approved" &&
                String(item.id) !== String(id);

        });


        if (!otherApproved) {

            animal.status = "Available";

        }

    }


    // Save both records.

    const applicationsSaved = saveStorage(
        APPLICATIONS_KEY,
        applications
    );


    const animalsSaved = saveStorage(
        ANIMALS_KEY,
        animals
    );


    if (!applicationsSaved || !animalsSaved) {
        return;
    }


    // Refresh pages.

    displayApplications();

    displayAnimals();

    displayRecentAnimals();

    updateDashboardStats();

    refreshDashboardCharts();


    console.log(
        "Application status updated:",
        id,
        newStatus
    );

}


/* =====================================================
   21. REFRESH DASHBOARD CHARTS
===================================================== */

function refreshDashboardCharts() {

    const adoptionElement = document.getElementById(
        "adoptionChart"
    );

    const speciesElement = document.getElementById(
        "statusChart"
    );


    if (adoptionElement && typeof ApexCharts !== "undefined") {

        adoptionElement.innerHTML = "";

        initialiseAdoptionChart();

    }


    if (speciesElement && typeof ApexCharts !== "undefined") {

        speciesElement.innerHTML = "";

        initialiseStatusChart();

    }

}


/* =====================================================
   22. MOBILE SIDEBAR
===================================================== */

function initialiseMobileMenu() {

    const menuButton = document.getElementById(
        "mobileMenuBtn"
    );

    const sidebar = document.getElementById(
        "sidebar"
    );


    if (!menuButton || !sidebar) {
        return;
    }


    menuButton.addEventListener("click", function() {

        sidebar.classList.toggle("active");

    });

}





/* =====================================================
   21. PAGE INITIALISATION
===================================================== */

/* =====================================================
   21. PAGE INITIALISATION - FIXED
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Paw Haven JavaScript loaded successfully!");

    // 1. Initialise default data
    initialiseData();

    // 2. Check login session
    if (!checkLoginSession()) {
        return;
    }

    // 3. Display user profile
    displayUserProfile();

    // 4. Login form
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // 5. Registration form
    const registrationForm = document.getElementById("registrationForm");

    if (registrationForm) {
        registrationForm.addEventListener(
            "submit",
            handleRegistration
        );
    }

    // 6. Logout
    document.querySelectorAll(
        "#logoutLink, #logoutBtn, .logout-btn, [data-logout]"
    ).forEach(function (button) {

        button.addEventListener("click", handleLogout);

    });

    // 7. Dashboard statistics
    updateDashboardStats();

    // 8. Dashboard charts
    initialiseAdoptionChart();
    initialiseStatusChart();

    // 9. Recent animals
    displayRecentAnimals();

    // 10. Animal records
    displayAnimals();

    console.log("Animal records displayed!");

    // 11. Animal search
    const animalSearch = document.getElementById("animalSearch");

    if (animalSearch) {
        animalSearch.addEventListener("input", filterAnimals);
    }

    // 12. Animal filter
    const animalFilter = document.getElementById("animalFilter");

    if (animalFilter) {
        animalFilter.addEventListener("change", filterAnimals);
    }

    // 13. Add animal form
    const addAnimalForm = document.getElementById("addAnimalForm");

    if (addAnimalForm) {

        addAnimalForm.addEventListener("submit", function(event) {

            event.preventDefault();

            addAnimal(event);

        });

    }

    // 14. Mobile menu
    initialiseMobileMenu();

    // 15. Current year
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

});

