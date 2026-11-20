
/* =========================================================
   PAW HAVEN - LOCAL STORAGE VERSION
   Keeps existing records and adds missing default records.
   No Supabase required.
========================================================= */


/* 1. STORAGE KEYS */

const STORAGE_KEYS = {
    users: "pawhaven_users",
    currentUser: "pawhaven_current_user",
    animals: "pawhaven_animals",
    applications: "pawhaven_applications"
};


/* 2. DEFAULT ADMIN */

const DEFAULT_ADMIN = {
    id: "pawhaven-admin",
    name: "Paw Haven Admin",
    fullName: "Paw Haven Admin",
    email: "admin@pawhaven.com",
    username: "admin",
    password: "pawhaven123",
    role: "admin"
};


/* 3. DEFAULT ANIMALS */

const DEFAULT_ANIMALS = [
    { id: "default-milo", name: "Milo", species: "Cat", type: "Cat", breed: "Persian", age: "2 years", gender: "Male", status: "Available" },
    { id: "default-luna", name: "Luna", species: "Cat", type: "Cat", breed: "Domestic Shorthair", age: "1 year", gender: "Female", status: "Available" },
    { id: "default-buddy", name: "Buddy", species: "Dog", type: "Dog", breed: "Golden Retriever", age: "3 years", gender: "Male", status: "Adopted" },
    { id: "default-coco", name: "Coco", species: "Dog", type: "Dog", breed: "Poodle", age: "8 months", gender: "Female", status: "Under Care" },
    { id: "default-oreo", name: "Oreo", species: "Rabbit", type: "Rabbit", breed: "Mini Lop", age: "1 year", gender: "Male", status: "Available" }
];


/* 4. DEFAULT APPLICATIONS */

const DEFAULT_APPLICATIONS = [
    { id: "default-app-1", applicant: "Sarah Tan", animal: "Milo", email: "sarah@gmail.com", date: "2026-10-20", status: "Pending" },
    { id: "default-app-2", applicant: "Adam Lee", animal: "Buddy", email: "adam@gmail.com", date: "2026-10-22", status: "Approved" },
    { id: "default-app-3", applicant: "Aina Rahman", animal: "Luna", email: "aina@gmail.com", date: "2026-10-25", status: "Pending" },
    { id: "default-app-4", applicant: "Daniel Wong", animal: "Coco", email: "daniel@gmail.com", date: "2026-10-28", status: "Declined" }
];


/* 5. STORAGE FUNCTIONS */

function getStorage(key, fallback = []) {
    try {
        const savedData = localStorage.getItem(key);

        if (savedData === null) return fallback;

        return JSON.parse(savedData);
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
    return prefix + "-" + Date.now() + "-" +
        Math.random().toString(36).substring(2, 8);
}

function normaliseText(value) {
    return String(value ?? "").trim().toLowerCase();
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


/* 6. INITIALISE DATA */

function initialiseData() {
    let users = getStorage(STORAGE_KEYS.users, []);

    if (!Array.isArray(users)) users = [];

    const adminExists = users.some(user =>
        normaliseText(user.username) === "admin" ||
        normaliseText(user.email) === "admin@pawhaven.com"
    );

    if (!adminExists) users.push({ ...DEFAULT_ADMIN });

    saveStorage(STORAGE_KEYS.users, users);


    let animals = getStorage(STORAGE_KEYS.animals, []);

    if (!Array.isArray(animals)) animals = [];

    // Support older records that used "type".
    animals.forEach(animal => {
        if (!animal.species && animal.type) {
            animal.species = animal.type;
        }

        if (!animal.type && animal.species) {
            animal.type = animal.species;
        }
    });

    DEFAULT_ANIMALS.forEach(defaultAnimal => {
        const exists = animals.some(animal =>
            normaliseText(animal.name) === normaliseText(defaultAnimal.name)
        );

        if (!exists) animals.push({ ...defaultAnimal });
    });

    saveStorage(STORAGE_KEYS.animals, animals);


    let applications = getStorage(STORAGE_KEYS.applications, []);

    if (!Array.isArray(applications)) applications = [];

    DEFAULT_APPLICATIONS.forEach(defaultApplication => {
        const exists = applications.some(application =>
            normaliseText(application.applicant) === normaliseText(defaultApplication.applicant) &&
            normaliseText(application.animal) === normaliseText(defaultApplication.animal) &&
            String(application.date || "") === defaultApplication.date
        );

        if (!exists) applications.push({ ...defaultApplication });
    });

    saveStorage(STORAGE_KEYS.applications, applications);
}


/* 7. GET DATA */

function getAnimals() {
    const animals = getStorage(STORAGE_KEYS.animals, []);
    return Array.isArray(animals) ? animals : [];
}

function getApplications() {
    const applications = getStorage(STORAGE_KEYS.applications, []);
    return Array.isArray(applications) ? applications : [];
}

function getUsers() {
    const users = getStorage(STORAGE_KEYS.users, []);
    return Array.isArray(users) ? users : [];
}

function getCurrentUser() {
    return getStorage(STORAGE_KEYS.currentUser, null);
}


/* 8. MESSAGE HELPER */

function showMessage(element, message, type = "error") {
    if (!element) {
        if (type === "error") alert(message);
        return;
    }

    element.textContent = message;
    element.className = "form-feedback " + type;
    element.style.display = "block";
}


/* 9. LOGIN */

function handleLogin(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const messageElement = document.getElementById("loginMessage");

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showMessage(messageElement, "Please enter your username and password.");
        return;
    }

    const users = getUsers();

    const matchedUser = users.find(user =>
        (
            normaliseText(user.username) === normaliseText(username) ||
            normaliseText(user.email) === normaliseText(username)
        ) &&
        String(user.password || "") === password
    );

    if (!matchedUser) {
        showMessage(messageElement, "Invalid username or password.");
        return;
    }

    const currentUser = {
        id: matchedUser.id,
        name: matchedUser.fullName || matchedUser.name || matchedUser.username,
        username: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role || "user"
    };

    if (saveStorage(STORAGE_KEYS.currentUser, currentUser)) {
        window.location.href = "./dashboard.html";
    }
}


/* 10. REGISTRATION */

function handleRegistration(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    const messageElement = document.getElementById("registerMessage");

    if (!fullName || !email || !username || !password || !confirmPassword) {
        showMessage(messageElement, "Please complete all required fields.");
        return;
    }

    if (password.length < 6) {
        showMessage(messageElement, "Password must contain at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showMessage(messageElement, "Passwords do not match.");
        return;
    }

    const agreeTerms =
        document.getElementById("agreeTerms") ||
        document.getElementById("terms") ||
        document.getElementById("termsCheckbox");

    if (agreeTerms && !agreeTerms.checked) {
        showMessage(messageElement, "Please agree to the terms and conditions.");
        return;
    }

    const users = getUsers();

    const duplicate = users.some(user =>
        normaliseText(user.username) === normaliseText(username) ||
        normaliseText(user.email) === normaliseText(email)
    );

    if (duplicate) {
        showMessage(messageElement, "Username or email already exists.");
        return;
    }

    users.push({
        id: createId("user"),
        fullName,
        name: fullName,
        email,
        username,
        password,
        role: "user"
    });

    if (saveStorage(STORAGE_KEYS.users, users)) {
        showMessage(messageElement, "Registration successful! You can now sign in.", "success");

        document.getElementById("registrationForm")?.reset();
        document.getElementById("registerForm")?.reset();
    }
}


/* 11. LOGOUT */

function handleLogout(event) {
    if (event) event.preventDefault();

    // Remove login session only. Animal and application data remain saved.
    localStorage.removeItem(STORAGE_KEYS.currentUser);

    window.location.href = "./login.html";
}


/* 12. LOGIN SESSION */

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

    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = "./login.html";
        return false;
    }

    if (authPages.includes(currentPage) && currentUser) {
        window.location.href = "./dashboard.html";
        return false;
    }

    return true;
}


/* 13. USER PROFILE */

function displayUserProfile() {
    const user = getCurrentUser();

    if (!user) return;

    const name = user.name || user.fullName || user.username || "Administrator";

    const adminName = document.getElementById("adminName");
    const adminTopbarName = document.getElementById("adminTopbarName");
    const avatar = document.getElementById("adminAvatar");

    if (adminName) adminName.textContent = name;
    if (adminTopbarName) adminTopbarName.textContent = name;

    if (avatar) {
        avatar.textContent = name
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }
}


/* 14. STATUS BADGE */

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


/* 15. DASHBOARD STATISTICS */

function updateDashboardStats() {
    const animals = getAnimals();
    const applications = getApplications();

    const values = {
        totalAnimals: animals.length,
        availableAnimals: animals.filter(a => normaliseText(a.status) === "available").length,
        adoptedAnimals: animals.filter(a => normaliseText(a.status) === "adopted").length,
        pendingApplications: applications.filter(a => normaliseText(a.status) === "pending").length
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}


/* 16. ANIMAL PAGE STATISTICS */

function updateAnimalPageStats() {
    const animals = getAnimals();

    const values = {
        animalTotalCount: animals.length,
        animalAvailableCount: animals.filter(a => a.status === "Available").length,
        animalAdoptedCount: animals.filter(a => a.status === "Adopted").length,
        animalCareCount: animals.filter(a => a.status === "Under Care").length
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    // Support the other HTML version's statistic IDs too.
    const alternativeIds = {
        totalAnimals: animals.length,
        availableAnimals: animals.filter(a => a.status === "Available").length,
        adoptedAnimals: animals.filter(a => a.status === "Adopted").length
    };

    Object.entries(alternativeIds).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}


/* 17. RECENT ANIMALS */

function displayRecentAnimals() {
    const table = document.getElementById("recentAnimalsTable");

    if (!table) return;

    const animals = [...getAnimals()].slice(-5).reverse();

    if (!animals.length) {
        table.innerHTML = `<tr><td colspan="5">No animal records found.</td></tr>`;
        return;
    }

    table.innerHTML = animals.map(animal => `
        <tr>
            <td><strong>${escapeHTML(animal.name)}</strong></td>
            <td>${escapeHTML(animal.species || animal.type)}</td>
            <td>${escapeHTML(animal.breed)}</td>
            <td>${escapeHTML(animal.age)}</td>
            <td>${getStatusBadge(animal.status)}</td>
        </tr>
    `).join("");
}


/* 18. DISPLAY ANIMALS */

function displayAnimals(list = null) {
    const table =
        document.getElementById("animalsTable") ||
        document.getElementById("animalTableBody");

    if (!table) return;

    const animals = list || getAnimals();

    if (!animals.length) {
        table.innerHTML = `<tr><td colspan="7">No animal records found.</td></tr>`;
        return;
    }

    table.innerHTML = animals.map(animal => `
        <tr>
            <td><strong>${escapeHTML(animal.name)}</strong></td>
            <td>${escapeHTML(animal.species || animal.type)}</td>
            <td>${escapeHTML(animal.breed)}</td>
            <td>${escapeHTML(animal.age)}</td>
            <td>${escapeHTML(animal.gender)}</td>
            <td>${getStatusBadge(animal.status)}</td>
            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    onclick="deleteAnimal('${escapeHTML(animal.id)}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}


/* 19. ADD ANIMAL */

function addAnimal(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("animalName")?.value.trim();

    const species =
        document.getElementById("animalSpecies")?.value ||
        document.getElementById("animalType")?.value;

    const breed = document.getElementById("animalBreed")?.value.trim();
    const age = document.getElementById("animalAge")?.value.trim();
    const gender = document.getElementById("animalGender")?.value;
    const status = document.getElementById("animalStatus")?.value;

    if (!name || !species || !breed || !age || !gender || !status) {
        alert("Please complete all animal information.");
        return;
    }

    const animals = getAnimals();

    if (animals.some(a => normaliseText(a.name) === normaliseText(name))) {
        alert("An animal with this name already exists.");
        return;
    }

    animals.push({
        id: createId("animal"),
        name,
        species,
        type: species,
        breed,
        age,
        gender,
        status
    });

    if (!saveStorage(STORAGE_KEYS.animals, animals)) return;

    document.getElementById("addAnimalForm")?.reset();
    document.getElementById("animalForm")?.reset();

    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    updateAnimalPageStats();
    refreshDashboardCharts();

    if (typeof closeAnimalModal === "function") {
        closeAnimalModal();
    }

    alert("Animal added successfully!");
}


/* 20. DELETE ANIMAL */

function deleteAnimal(id) {
    if (!confirm("Are you sure you want to delete this animal?")) return;

    const animals = getAnimals().filter(a => String(a.id) !== String(id));

    saveStorage(STORAGE_KEYS.animals, animals);

    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    updateAnimalPageStats();
    refreshDashboardCharts();
}


/* 21. SEARCH AND FILTER */

function filterAnimals() {
    const searchInput = document.getElementById("animalSearch");
    const filterInput = document.getElementById("animalFilter");

    const search = normaliseText(searchInput?.value || "");
    const filter = normaliseText(filterInput?.value || "");

    const filtered = getAnimals().filter(animal => {
        const species = animal.species || animal.type || "";

        const matchesSearch =
            normaliseText(animal.name).includes(search) ||
            normaliseText(species).includes(search) ||
            normaliseText(animal.breed).includes(search);

        const matchesFilter =
            !filter ||
            filter === "all" ||
            normaliseText(species) === filter ||
            normaliseText(animal.status) === filter;

        return matchesSearch && matchesFilter;
    });

    displayAnimals(filtered);
}


/* 22. APPLICATION STATISTICS */

function updateApplicationStats() {
    const applications = getApplications();

    const values = {
        totalApplicationCount: applications.length,
        pendingApplicationCount: applications.filter(a => a.status === "Pending").length,
        approvedApplicationCount: applications.filter(a => a.status === "Approved").length,
        declinedApplicationCount: applications.filter(a => a.status === "Declined").length
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}


/* 23. DISPLAY APPLICATIONS */

function displayApplications() {
    const table =
        document.getElementById("applicationsTable") ||
        document.getElementById("applicationTableBody");

    if (!table) return;

    const applications = getApplications();

    if (!applications.length) {
        table.innerHTML = `<tr><td colspan="5">No applications found.</td></tr>`;
        return;
    }

    table.innerHTML = applications.map(application => `
        <tr>
            <td><strong>${escapeHTML(application.applicant)}</strong></td>
            <td>${escapeHTML(application.animal)}</td>
            <td>${escapeHTML(application.date)}</td>
            <td>${getStatusBadge(application.status)}</td>
            <td>
                <select
                    class="form-select form-select-sm application-status-select"
                    data-application-id="${escapeHTML(application.id)}">
                    <option value="Pending" ${application.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Approved" ${application.status === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Declined" ${application.status === "Declined" ? "selected" : ""}>Declined</option>
                </select>
            </td>
        </tr>
    `).join("");
}


/* 24. UPDATE APPLICATION STATUS */

function updateApplicationStatus(id, newStatus) {
    if (!["Pending", "Approved", "Declined"].includes(newStatus)) return;

    const applications = getApplications();

    const index = applications.findIndex(a => String(a.id) === String(id));

    if (index === -1) return;

    applications[index].status = newStatus;

    saveStorage(STORAGE_KEYS.applications, applications);

    const animals = getAnimals();
    const selectedAnimal = applications[index].animal;

    const relatedAnimal = animals.find(a =>
        normaliseText(a.name) === normaliseText(selectedAnimal)
    );

    if (relatedAnimal) {
        const anotherApproved = applications.some(a =>
            normaliseText(a.animal) === normaliseText(selectedAnimal) &&
            a.status === "Approved"
        );

        if (anotherApproved) {
            relatedAnimal.status = "Adopted";
        } else if (relatedAnimal.status === "Adopted") {
            relatedAnimal.status = "Available";
        }

        saveStorage(STORAGE_KEYS.animals, animals);
    }

    displayApplications();
    displayAnimals();
    displayRecentAnimals();
    updateDashboardStats();
    updateAnimalPageStats();
    updateApplicationStats();
    refreshDashboardCharts();
}


/* 25. APPLICATION SEARCH */

function filterApplications() {
    const search = normaliseText(document.getElementById("applicationSearch")?.value || "");
    const filter = normaliseText(document.getElementById("applicationFilter")?.value || "");

    const filtered = getApplications().filter(application => {
        const matchesSearch =
            normaliseText(application.applicant).includes(search) ||
            normaliseText(application.animal).includes(search) ||
            normaliseText(application.email).includes(search);

        const matchesStatus =
            !filter || application.status.toLowerCase() === filter;

        return matchesSearch && matchesStatus;
    });

    const table =
        document.getElementById("applicationsTable") ||
        document.getElementById("applicationTableBody");

    if (!table) return;

    table.innerHTML = filtered.map(application => `
        <tr>
            <td>${escapeHTML(application.applicant)}</td>
            <td>${escapeHTML(application.animal)}</td>
            <td>${escapeHTML(application.date)}</td>
            <td>${getStatusBadge(application.status)}</td>
            <td>
                <select class="form-select form-select-sm application-status-select"
                    data-application-id="${escapeHTML(application.id)}">
                    <option value="Pending" ${application.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Approved" ${application.status === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Declined" ${application.status === "Declined" ? "selected" : ""}>Declined</option>
                </select>
            </td>
        </tr>
    `).join("");
}


/* 26. DASHBOARD CHARTS */

let adoptionChart = null;
let statusChart = null;

function initialiseAdoptionChart() {
    const element = document.getElementById("adoptionChart");

    if (!element || typeof ApexCharts === "undefined") return;

    const applications = getApplications();
    const year = new Date().getFullYear();

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = months.map((month, index) =>
        applications.filter(application => {
            if (application.status !== "Approved" || !application.date) return false;

            const date = new Date(application.date + "T00:00:00");

            return date.getFullYear() === year && date.getMonth() === index;
        }).length
    );

    if (adoptionChart) adoptionChart.destroy();

    adoptionChart = new ApexCharts(element, {
        series: [{ name: "Approved Applications", data }],
        chart: { type: "area", height: 300, toolbar: { show: false }, fontFamily: "DM Sans, sans-serif" },
        colors: ["#71836b"],
        stroke: { curve: "smooth", width: 3 },
        fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: { categories: months },
        yaxis: { min: 0, forceNiceScale: true },
        grid: { borderColor: "#eee9e1", strokeDashArray: 4 }
    });

    adoptionChart.render();
}


function initialiseStatusChart() {
    const element = document.getElementById("statusChart");

    if (!element || typeof ApexCharts === "undefined") return;

    const animals = getAnimals();

    const species = [...new Set(animals.map(a => a.species || a.type || "Other"))];

    const counts = species.map(type =>
        animals.filter(a => normaliseText(a.species || a.type) === normaliseText(type)).length
    );

    if (statusChart) statusChart.destroy();

    statusChart = new ApexCharts(element, {
        series: counts,
        labels: species,
        chart: { type: "donut", height: 300, fontFamily: "DM Sans, sans-serif" },
        colors: ["#71836b", "#d9b39e", "#b6a9c6", "#e7ca83", "#9db7bd"],
        legend: { position: "bottom" },
        dataLabels: { enabled: true },
        plotOptions: { pie: { donut: { size: "65%" } } }
    });

    statusChart.render();
}


function refreshDashboardCharts() {
    initialiseAdoptionChart();
    initialiseStatusChart();
}


/* 27. MOBILE MENU */

function initialiseMobileMenu() {
    const button =
        document.getElementById("mobileMenuBtn") ||
        document.getElementById("menuToggle");

    const sidebar =
        document.getElementById("sidebar") ||
        document.querySelector(".ph-sidebar") ||
        document.querySelector(".sidebar");

    if (!button || !sidebar) return;

    button.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });
}


/* 28. MAIN INITIALISATION */

document.addEventListener("DOMContentLoaded", function () {

    initialiseData();

    const sessionAllowed = checkLoginSession();

    if (!sessionAllowed) return;

    displayUserProfile();

    // Login and registration forms.
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    const registrationForm =
        document.getElementById("registrationForm") ||
        document.getElementById("registerForm");

    if (registrationForm) {
        registrationForm.addEventListener("submit", handleRegistration);
    }

    // Logout links: supports multiple HTML versions.
    document.querySelectorAll(
        "#logoutLink, #logoutBtn, .logout-btn, .logout-link, [data-logout]"
    ).forEach(button => {
        button.addEventListener("click", handleLogout);
    });

    // Dashboard.
    updateDashboardStats();
    displayRecentAnimals();
    refreshDashboardCharts();

    // Animals page.
    displayAnimals();
    updateAnimalPageStats();

    const animalForm =
        document.getElementById("addAnimalForm") ||
        document.getElementById("animalForm");

    if (animalForm) {
        animalForm.addEventListener("submit", addAnimal);
    }

    const search = document.getElementById("animalSearch");
    const filter = document.getElementById("animalFilter");

    if (search) search.addEventListener("input", filterAnimals);
    if (filter) filter.addEventListener("change", filterAnimals);

    // Applications page.
    displayApplications();
    updateApplicationStats();

    const applicationSearch = document.getElementById("applicationSearch");
    const applicationFilter = document.getElementById("applicationFilter");

    if (applicationSearch) {
        applicationSearch.addEventListener("input", filterApplications);
    }

    if (applicationFilter) {
        applicationFilter.addEventListener("change", filterApplications);
    }

    const applicationTable =
        document.getElementById("applicationsTable") ||
        document.getElementById("applicationTableBody");

    if (applicationTable) {
        applicationTable.addEventListener("change", function (event) {
            const select = event.target.closest(".application-status-select");

            if (select) {
                updateApplicationStatus(
                    select.dataset.applicationId,
                    select.value
                );
            }
        });
    }

    // Sidebar and year.
    initialiseMobileMenu();

    document.querySelectorAll("#currentYear, [data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

});
