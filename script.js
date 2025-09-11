// =======================
// Preloader
// =======================
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
    }, 1500);
});

// =======================
// Sticky Header
// =======================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// =======================
// Mobile Menu Toggle
// =======================
const menuBtn = document.querySelector('.fa-bars');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('show');
    });
}

// =======================
// Scroll Animation
// =======================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section, .fade-in').forEach(section => {
    observer.observe(section);
});

// =======================
// Toggle course details
// =======================
function toggleCourse(element) {
    const courseBody = element.nextElementSibling;
    const icon = element.querySelector('.fa-chevron-down');

    courseBody.classList.toggle('expanded');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// =======================
// Location selector
// =======================
document.querySelectorAll('.location-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const location = btn.getAttribute('data-location');

        document.querySelectorAll('.location-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.location-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${location}-content`).classList.add('active');
    });
});

// =======================
// Testimonial Modal
// =======================
function openTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'flex';
}
function closeTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'none';
    document.getElementById('testimonialForm').reset();
    resetRating();
}

// =======================
// Rating system
// =======================
function setRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
    document.getElementById('testimonialForm').setAttribute('data-rating', rating);
}
function resetRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('selected'));
    document.getElementById('testimonialForm').removeAttribute('data-rating');
}

// =======================
// Admin panel
// =======================
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
}
function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');

        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}Tab`).classList.add('active');
    });
});

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'elite2025') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadInscriptions();
        loadTestimonials();
    } else {
        alert('Contraseña incorrecta');
    }
}

// =======================
// Inscription & Testimonials
// =======================
// (todo lo demás lo dejé igual que tenías: loadInscriptions, loadTestimonials, delete, export, etc.)
// Asegúrate de que solo esté UNA VEZ en el archivo
