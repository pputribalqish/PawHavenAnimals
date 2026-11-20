
/* =====================================================
   PAW HAVEN - SUPABASE MAIN JAVASCRIPT
   Authentication, Animals, Applications & Dashboard
===================================================== */

const db = supabaseClient;

const DEFAULT_ANIMALS = [
    { id: 1, name: "Milo", species: "Cat", breed: "Persian", age: "2 years", gender: "Male", status: "Available" },
    { id: 2, name: "Luna", species: "Cat", breed: "Domestic Shorthair", age: "1 year", gender: "Female", status: "Available" },
    { id: 3, name: "Buddy", species: "Dog", breed: "Golden Retriever", age: "3 years", gender: "Male", status: "Adopted" },
    { id: 4, name: "Coco", species: "Dog", breed: "Poodle", age: "8 months", gender: "Female", status: "Under Care" },
    { id: 5, name: "Oreo", species: "Rabbit", breed: "Mini Lop", age: "1 year", gender: "Male", status: "Available" }
];

const DEFAULT_APPLICATIONS = [
    { id: 1, applicant: "Sarah Tan", animal: "Milo", date: "2026-10-20", status: "Pending" },
    { id: 2, applicant: "Adam Lee", animal: "Buddy", date: "2026-10-22", status: "Approved" },
    { id: 3, applicant: "Aina Rahman", animal: "Luna", date: "2026-10-25", status: "Pending" },
    { id: 4, applicant: "Daniel Wong", animal: "Coco", date: "2026-10-28", status: "Declined" }
];

let animalsCache = [];
let applicationsCache = [];
let adoptionChart = null;
let speciesChart = null;


/* =====================================================
   1. GENERAL DATABASE FUNCTIONS
===================================================== */

async function getAnimals() {
    const { data, error } = await db
        .from("animals")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Animal loading error:", error);
        alert("Unable to load animals: " + error.message);
        return [];
    }

    animalsCache = data || [];
    return animalsCache;
}


async function getApplications() {
    const { data, error } = await db
        .from("applications")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Application loading error:", error);
        alert("Unable to load applications: " + error.message);
        return [];
    }

    applicationsCache = data || [];
    return applicationsCache;
}


async function initialiseDatabase() {
    // Check whether animal records already exist.
    const { data: animals, error: animalError } = await db
        .from("animals")
        .select("id")
        .limit(1);

    if (animalError) {
        console.error(animalError);
        throw animalError;
    }

    // Add starter animals only if the database is empty.
    if (!animals || animals.length === 0) {
        const { error } = await db
            .from("animals")
            .insert(DEFAULT_ANIMALS);

        if (error) throw error;
    }

    // Check whether applications already exist.
    const { data: applications, error: applicationError } = await db
        .from("applications")
        .select("id")
        .limit(1);

    if (applicationError) throw applicationError;

    if (!applications || applications.length === 0) {
        const { error } = await db
            .from("applications")
            .insert(DEFAULT_APPLICATIONS);

        if (error) throw error;
    }
}


/* =====================================================
   2. LOGIN
===================================================== */

async function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const message = document.getElementById("loginMessage");

    const email = usernameInput?.value.trim();
    const password = passwordInput?.value;

    function showMessage(text, color) {
        if (message) {
            message.textContent = text;
            message.style.color = color;
        }
    }

    if (!email || !password) {
        showMessage("Please enter your email and password.", "#dc3545");
        return;
    }

    // Supabase Authentication uses email and password.
    const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showMessage(error.message, "#dc3545");
        return;
    }

    showMessage("Login successful! Redirecting...", "#198754");

    window.location.href = "dashboard.html";
}


/* =====================================================
   3. REGISTRATION
===================================================== */

async function handleRegistration(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;
    const agreeTerms = document.getElementById("agreeTerms");
    const message = document.getElementById("registerMessage");

    function showMessage(text, color = "#dc3545") {
        if (message) {
            message.textContent = text;
            message.style.color = color;
        }
    }

    if (!fullName || !email || !username || !password || !confirmPassword) {
        showMessage("Please complete all required fields.");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must contain at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.");
        return;
    }

    if (!agreeTerms || !agreeTerms.checked) {
        showMessage("Please agree to the terms and conditions.");
        return;
    }

    // Register using Supabase Authentication.
    const { data, error } = await db.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName,
                username: username
            }
        }
    });

    if (error) {
        showMessage(error.message);
        return;
    }

    showMessage(
        "Account created! Please check your email if confirmation is required.",
        "#198754"
    );

    document.getElementById("registrationForm")?.reset();

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}


/* =====================================================
   4. LOGOUT
===================================================== */

// LOGOUT FUNCTION
async function handleLogout(event) {

    if (event) {
        event.preventDefault();
    }

    try {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        // Clear old local session
        localStorage.removeItem("pawhaven_current_user");

        // Redirect to login page
        window.location.href = "./login.html";

    } catch (error) {

        console.error("Logout error:", error);

        alert("Unable to logout. Please try again.");

    }
}


/* =====================================================
   5. SESSION PROTECTION
===================================================== */

async function checkLoginSession() {
    const { data, error } = await db.auth.getSession();

    if (error) {
        console.error(error);
        return false;
    }

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

    const isProtected = protectedPages.includes(currentPage);
    const isLoggedIn = !!data.session;

    if (isProtected && !isLoggedIn) {
        window.location.replace("login.html");
        return false;
    }

    return true;
}


/* =====================================================
   6. USER PROFILE
===================================================== */

async function displayUserProfile() {
    const { data } = await db.auth.getUser();

    const user = data.user;

    if (!user) return;

    const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.username ||
        user.email;

    document.querySelectorAll(
        "#adminName, #adminTopbarName, .admin-name, [data-user-name]"
    ).forEach(element => {
        element.textContent = name;
    });

    const initials = name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    document.querySelectorAll(
        "#adminAvatar, .admin-avatar, [data-user-avatar]"
    ).forEach(element => {
        element.textContent = initials;
    });
}


/* =====================================================
   7. DASHBOARD STATISTICS
===================================================== */

async function updateDashboardStats() {
    const animals = await getAnimals();
    const applications = await getApplications();

    const stats = {
        totalAnimals: animals.length,

        availableAnimals: animals.filter(
            animal => animal.status === "Available"
        ).length,

        adoptedAnimals: animals.filter(
            animal => animal.status === "Adopted"
        ).length,

        pendingApplications: applications.filter(
            application => application.status === "Pending"
        ).length
    };

    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key);

        if (element) {
            element.textContent = stats[key];
        }
    });
}


/* =====================================================
   8. DASHBOARD ADOPTION CHART
===================================================== */

async function initialiseAdoptionChart() {
    const element = document.getElementById("adoptionChart");

    if (!element || typeof ApexCharts === "undefined") return;

    const applications = await getApplications();

    const months = [
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const monthlyData = months.map((month, index) => {
        const monthNumber = index + 5;

        return applications.filter(application => {
            if (application.status !== "Approved") return false;

            const date = new Date(application.date + "T00:00:00");

            return date.getFullYear() === 2026 &&
                date.getMonth() + 1 === monthNumber;
        }).length;
    });

    if (adoptionChart) adoptionChart.destroy();

    adoptionChart = new ApexCharts(element, {
        series: [{
            name: "Approved Applications",
            data: monthlyData
        }],
        chart: {
            type: "area",
            height: 300,
            toolbar: { show: false },
            fontFamily: "DM Sans, sans-serif"
        },
        colors: ["#71836b"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 3 },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.35,
                opacityTo: 0.05
            }
        },
        xaxis: { categories: months },
        yaxis: { min: 0, forceNiceScale: true },
        grid: { borderColor: "#eeeeee" }
    });

    adoptionChart.render();
}


/* =====================================================
   9. DASHBOARD ANIMALS BY SPECIES CHART
===================================================== */

async function initialiseStatusChart() {
    const element = document.getElementById("statusChart");

    if (!element || typeof ApexCharts === "undefined") return;

    const animals = await getAnimals();

    const counts = {};

    animals.forEach(animal => {
        const species = animal.species || "Other";
        counts[species] = (counts[species] || 0) + 1;
    });

    if (speciesChart) speciesChart.destroy();

    speciesChart = new ApexCharts(element, {
        series: Object.values(counts),
        chart: {
            type: "donut",
            height: 300,
            fontFamily: "DM Sans, sans-serif"
        },
        labels: Object.keys(counts),
        colors: [
            "#71836b",
            "#d9b39e",
            "#b6a9c6",
            "#e8c979",
            "#9db7b0"
        ],
        legend: { position: "bottom" },
        plotOptions: {
            pie: {
                donut: { size: "65%" }
            }
        }
    });

    speciesChart.render();
}


/* =====================================================
   10. RECENT ANIMALS
===================================================== */

async function displayRecentAnimals() {
    const tableBody = document.getElementById("recentAnimalsTable");

    if (!tableBody) return;

    const animals = await getAnimals();

    tableBody.innerHTML = "";

    if (animals.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="5" class="text-center">
                No animal records available.
            </td></tr>`;
        return;
    }

    animals.slice(-5).reverse().forEach(animal => {
        const row = document.createElement("tr");

        [
            animal.name,
            animal.species,
            animal.breed,
            animal.age,
            animal.status
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}


/* =====================================================
   11. DISPLAY ANIMALS
===================================================== */

async function displayAnimals() {
    const tableBody = document.getElementById("animalTableBody");

    if (!tableBody) return;

    const animals = await getAnimals();

    renderAnimalTable(animals);
}


function renderAnimalTable(animals) {
    const tableBody = document.getElementById("animalTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!animals || animals.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="7" class="text-center">
                No animal records available.
            </td></tr>`;
        return;
    }

    animals.forEach(animal => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");

        nameCell.innerHTML = `
            <div class="ph-animal-name">
                <div class="ph-animal-avatar">
                    <i class="fa-solid fa-paw"></i>
                </div>
                <span></span>
            </div>`;

        nameCell.querySelector("span").textContent = animal.name || "-";
        row.appendChild(nameCell);

        [
            animal.species,
            animal.breed,
            animal.age,
            animal.gender
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

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

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "ph-delete-btn";
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteButton.title = "Delete animal";

        deleteButton.addEventListener("click", () => {
            deleteAnimal(animal.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}


/* =====================================================
   12. ADD ANIMAL
===================================================== */

async function addAnimal(event) {
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

    const newAnimal = {
        id: Date.now(),
        name,
        species,
        breed,
        age,
        gender,
        status
    };

    const { error } = await db
        .from("animals")
        .insert([newAnimal]);

    if (error) {
        console.error(error);
        alert("Unable to save animal: " + error.message);
        return;
    }

    document.getElementById("addAnimalForm").reset();

    if (typeof closeAnimalModal === "function") {
        closeAnimalModal();
    }

    await refreshAllData();

    alert("Animal added successfully!");
}


/* =====================================================
   13. DELETE ANIMAL
===================================================== */

async function deleteAnimal(id) {
    if (!confirm("Are you sure you want to delete this animal?")) {
        return;
    }

    const { error } = await db
        .from("animals")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Unable to delete animal: " + error.message);
        return;
    }

    await refreshAllData();

    alert("Animal deleted successfully!");
}


/* =====================================================
   14. SEARCH AND FILTER
===================================================== */

async function filterAnimals() {
    const search = document.getElementById("animalSearch")
        ?.value.toLowerCase().trim() || "";

    const filter = document.getElementById("animalFilter")
        ?.value || "All";

    const animals = await getAnimals();

    const filtered = animals.filter(animal => {
        const matchesSearch =
            (animal.name || "").toLowerCase().includes(search) ||
            (animal.species || "").toLowerCase().includes(search) ||
            (animal.breed || "").toLowerCase().includes(search);

        const matchesFilter =
            filter === "All" || animal.status === filter;

        return matchesSearch && matchesFilter;
    });

    renderAnimalTable(filtered);
}


/* =====================================================
   15. DISPLAY APPLICATIONS
===================================================== */

async function displayApplications() {
    const tableBody = document.getElementById("applicationTableBody");

    if (!tableBody) return;

    const applications = await getApplications();

    tableBody.innerHTML = "";

    if (applications.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="5" class="text-center">
                No applications available.
            </td></tr>`;
        return;
    }

    applications.forEach(application => {
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
        const select = document.createElement("select");

        select.className = "form-select form-select-sm";

        ["Pending", "Approved", "Declined"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        });

        select.value = application.status;

        select.addEventListener("change", () => {
            updateApplicationStatus(application.id, select.value);
        });

        actionCell.appendChild(select);

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
   16. UPDATE APPLICATION STATUS
===================================================== */

async function updateApplicationStatus(id, newStatus) {
    const applications = await getApplications();

    const application = applications.find(
        item => String(item.id) === String(id)
    );

    if (!application) return;

    const oldStatus = application.status;

    const animals = await getAnimals();

    const animal = animals.find(
        item => item.name === application.animal
    );

    if (newStatus === "Approved") {
        const anotherApproved = applications.some(item =>
            item.animal === application.animal &&
            item.status === "Approved" &&
            String(item.id) !== String(id)
        );

        if (anotherApproved) {
            alert("This animal already has an approved application.");
            await displayApplications();
            return;
        }

        if (animal && animal.status !== "Available" &&
            oldStatus !== "Approved") {
            alert("This animal is not currently available.");
            await displayApplications();
            return;
        }
    }

    // Update application in Supabase.
    const { error } = await db
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);

    if (error) {
        alert("Unable to update application: " + error.message);
        return;
    }

    // Update animal adoption status.
    if (animal && newStatus === "Approved") {
        const { error: animalError } = await db
            .from("animals")
            .update({ status: "Adopted" })
            .eq("id", animal.id);

        if (animalError) {
            alert(animalError.message);
            return;
        }
    }

    if (animal && oldStatus === "Approved" && newStatus !== "Approved") {
        const otherApproved = applications.some(item =>
            item.animal === application.animal &&
            item.status === "Approved" &&
            String(item.id) !== String(id)
        );

        if (!otherApproved) {
            const { error: animalError } = await db
                .from("animals")
                .update({ status: "Available" })
                .eq("id", animal.id);

            if (animalError) {
                alert(animalError.message);
                return;
            }
        }
    }

    await refreshAllData();
}


/* =====================================================
   17. REFRESH ALL DATA
===================================================== */

async function refreshAllData() {
    await getAnimals();
    await getApplications();

    await updateDashboardStats();
    await displayAnimals();
    await displayRecentAnimals();
    await displayApplications();

    await initialiseAdoptionChart();
    await initialiseStatusChart();
}


/* =====================================================
   18. MOBILE SIDEBAR
===================================================== */

function initialiseMobileMenu() {
    const menuButton = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });
}


/* =====================================================
   19. PAGE INITIALISATION
===================================================== */

document.addEventListener("DOMContentLoaded", async function() {
    console.log("Paw Haven starting...");

    try {
        // Check user login.
        const allowed = await checkLoginSession();

        if (!allowed) return;

        // Initialise database starter records.
        const currentPage = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        const isProtectedPage = [
            "dashboard.html",
            "animals.html",
            "applications.html",
            "about.html"
        ].includes(currentPage);

        if (isProtectedPage) {
            await initialiseDatabase();
            await displayUserProfile();
            await refreshAllData();
        }

        // Login form.
        const loginForm = document.getElementById("loginForm");

        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }

        // Registration form.
        const registrationForm = document.getElementById("registrationForm");

        if (registrationForm) {
            registrationForm.addEventListener("submit", handleRegistration);
        }

        // Logout.
        document.querySelectorAll(
            "#logoutLink, #logoutBtn, .logout-btn, [data-logout]"
        ).forEach(button => {
            button.addEventListener("click", handleLogout);
        });

        // Animal search.
        document.getElementById("animalSearch")
            ?.addEventListener("input", filterAnimals);

        // Animal filter.
        document.getElementById("animalFilter")
            ?.addEventListener("change", filterAnimals);

        // Add animal form.
        const addAnimalForm = document.getElementById("addAnimalForm");

        if (addAnimalForm) {
            addAnimalForm.addEventListener("submit", addAnimal);
        }

        // Mobile menu.
        initialiseMobileMenu();

        // Current year.
        const year = document.getElementById("currentYear");

        if (year) {
            year.textContent = new Date().getFullYear();
        }

        console.log("Paw Haven ready!");

    } catch (error) {
        console.error("Paw Haven initialisation error:", error);
        alert("Paw Haven could not load: " + error.message);
    }
});

// LOGOUT BUTTON EVENT
document.addEventListener("click", function(event) {

    const logoutButton = event.target.closest(
        "#logoutLink, #logoutBtn, .logout-btn, [data-logout]"
    );

    if (logoutButton) {
        handleLogout(event);
    }

});
