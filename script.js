// ===== FUNCIONES DE CIERRE DE MODALES =====
function closeViewModal() {
    document.getElementById('viewInscriptionModal').style.display = 'none';
}

function closeTestimonialViewModal() {
    document.getElementById('viewTestimonialModal').style.display = 'none';
}

function closeTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'none';
    document.getElementById('testimonialForm').reset();
    resetRating();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

// ===== FUNCIONALIDADES GENERALES =====
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        if (preloader) preloader.classList.add('hidden');
    }, 1500);
    
    // Mostrar testimonios al cargar la página
    displayTestimonials();
    
    // Añadir event listeners para los botones de cerrar
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Cerrar admin panel al hacer clic fuera
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAdminPanel();
            }
        });
    }
});

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Menú móvil
const menuBtn = document.querySelector('.fa-bars');
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        document.querySelector('nav ul').classList.toggle('show');
    });
}

// Animaciones de aparición
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

// Acordeón de cursos
function toggleCourse(element) {
    const courseBody = element.nextElementSibling;
    const icon = element.querySelector('.fa-chevron-down');

    courseBody.classList.toggle('expanded');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// Selector de ubicación
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

// ===== SISTEMA DE TESTIMONIOS =====
let currentRating = 0;

function openTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'flex';
}

function setRating(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });
    currentRating = rating;
}

function resetRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('selected'));
    currentRating = 0;
}

// ===== ADMIN PANEL =====
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
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

// ===== ALMACENAMIENTO Y GESTIÓN DE DATOS =====
let inscriptions = JSON.parse(localStorage.getItem('inscriptions')) || [];
let testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
const ADMIN_PASSWORD = "elite2025";

// Mapeo de nombres de cursos para mostrar correctamente
const courseNames = {
    "farmacia": "Auxiliar de Farmacia",
    "enfermeria": "Auxiliar de Enfermería",
    "parvularia": "Parvularia o Educación Inicial",
    "belleza": "Técnico en Belleza integral",
    "contabilidad": "Gestión administrativa y contabilidad",
    "cocteleria": "Técnico en Coctelería",
    "automotriz": "Técnico en Mecánica Automotriz",
    "motos": "Técnico en Mecánica de Motos",
    "fisioterapia": "Auxiliar de fisioterapia",
    "soldadura": "Técnico en Soldadura",
    "electricidad": "Técnico en Electricidad",
    "uñas": "Técnico en Uñas",
    "forense": "Auxiliar forense",
    "Celulares": "Mantenimiento de celulares y computadoras"
};

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        loadInscriptions();
        loadTestimonials();
    } else {
        alert('Contraseña incorrecta');
    }
}

function loadInscriptions() {
    const table = document.getElementById('inscriptionsTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    inscriptions.forEach((inscription, index) => {
        const row = `
            <tr>
                <td>${inscription.firstName} ${inscription.lastName}</td>
                <td>${inscription.email}</td>
                <td>${inscription.phone}</td>
                <td>${courseNames[inscription.course] || inscription.course}</td>
                <td>${new Date(inscription.date).toLocaleDateString()}</td>
                <td class="admin-actions">
                    <button class="admin-btn view-btn" onclick="viewInscription(${index})">Ver</button>
                    <button class="admin-btn delete-btn" onclick="deleteInscription(${index})">Eliminar</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

function loadTestimonials() {
    const table = document.getElementById('testimonialsTable');
    if (!table) return;
    
    table.innerHTML = '';
    
    testimonials.forEach((testimonial, index) => {
        const row = `
            <tr>
                <td>${testimonial.name}</td>
                <td>${courseNames[testimonial.course] || testimonial.course}</td>
                <td>${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</td>
                <td>${new Date(testimonial.date).toLocaleDateString()}</td>
                <td class="admin-actions">
                    <button class="admin-btn view-btn" onclick="viewTestimonial(${index})">Ver</button>
                    <button class="admin-btn delete-btn" onclick="deleteTestimonial(${index})">Eliminar</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

function viewInscription(index) {
    const inscription = inscriptions[index];
    const details = `
        <h3>Información del Estudiante</h3>
        <p><strong>Nombre:</strong> ${inscription.firstName} ${inscription.lastName}</p>
        <p><strong>Cédula:</strong> ${inscription.cedula}</p>
        <p><strong>Fecha Nacimiento:</strong> ${inscription.birthdate}</p>
        <p><strong>Teléfono:</strong> ${inscription.phone}</p>
        <p><strong>Email:</strong> ${inscription.email}</p>
        
        <h3>Dirección</h3>
        <p><strong>Provincia:</strong> ${inscription.province}</p>
        <p><strong>Cantón:</strong> ${inscription.canton}</p>
        <p><strong>Parroquia:</strong> ${inscription.parish}</p>
        <p><strong>Barrio:</strong> ${inscription.neighborhood}</p>
        
        <h3>Curso Seleccionado</h3>
        <p><strong>Programa:</strong> ${courseNames[inscription.course] || inscription.course}</p>
        ${inscription.message ? `<p><strong>Mensaje:</strong> ${inscription.message}</p>` : ''}
        
        <p><strong>Fecha de inscripción:</strong> ${new Date(inscription.date).toLocaleString()}</p>
    `;
    
    document.getElementById('inscriptionDetails').innerHTML = details;
    document.getElementById('viewInscriptionModal').style.display = 'flex';
}

function viewTestimonial(index) {
    const testimonial = testimonials[index];
    const details = `
        <h3>Información del Estudiante</h3>
        <p><strong>Nombre:</strong> ${testimonial.name}</p>
        <p><strong>Curso:</strong> ${courseNames[testimonial.course] || testimonial.course}</p>
        <p><strong>Calificación:</strong> ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}</p>
        
        <h3>Testimonio</h3>
        <p>${testimonial.text}</p>
        
        ${testimonial.video ? `
        <h3>Video</h3>
        <div class="testimonial-video-preview">
            <video controls>
                <source src="${testimonial.video}" type="video/mp4">
                Tu navegador no soporta videos.
            </video>
        </div>
        ` : ''}
        
        <p><strong>Fecha:</strong> ${new Date(testimonial.date).toLocaleString()}</p>
    `;
    
    document.getElementById('testimonialDetails').innerHTML = details;
    document.getElementById('viewTestimonialModal').style.display = 'flex';
}

function deleteInscription(index) {
    if (confirm('¿Estás seguro de eliminar esta inscripción?')) {
        inscriptions.splice(index, 1);
        localStorage.setItem('inscriptions', JSON.stringify(inscriptions));
        loadInscriptions();
    }
}

function deleteTestimonial(index) {
    if (confirm('¿Estás seguro de eliminar este testimonio?')) {
        testimonials.splice(index, 1);
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        loadTestimonials();
        displayTestimonials(); // Actualizar la visualización de testimonios
    }
}

function exportToCSV() {
    if (inscriptions.length === 0) {
        alert('No hay inscripciones para exportar');
        return;
    }
    
    let csv = 'Nombre,Email,Teléfono,Curso,Fecha\n';
    inscriptions.forEach(inscription => {
        csv += `"${inscription.firstName} ${inscription.lastName}",${inscription.email},${inscription.phone},"${courseNames[inscription.course] || inscription.course}",${new Date(inscription.date).toLocaleDateString()}\n`;
    });
    
    downloadCSV(csv, 'inscripciones_elite_academy.csv');
}

function exportTestimonialsToCSV() {
    if (testimonials.length === 0) {
        alert('No hay testimonios para exportar');
        return;
    }
    
    let csv = 'Nombre,Curso,Calificación,Fecha,Testimonio,Video\n';
    testimonials.forEach(testimonial => {
        csv += `"${testimonial.name}","${courseNames[testimonial.course] || testimonial.course}",${testimonial.rating},${new Date(testimonial.date).toLocaleDateString()},"${testimonial.text.replace(/"/g, '""')}","${testimonial.video || ''}"\n`;
    });
    
    downloadCSV(csv, 'testimonios_elite_academy.csv');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllInscriptions() {
    if (confirm('¿Estás seguro de eliminar TODAS las inscripciones? Esta acción no se puede deshacer.')) {
        inscriptions = [];
        localStorage.setItem('inscriptions', JSON.stringify(inscriptions));
        loadInscriptions();
        alert('Todas las inscripciones han sido eliminadas');
    }
}

function clearAllTestimonials() {
    if (confirm('¿Estás seguro de eliminar TODOS los testimonios? Esta acción no se puede deshacer.')) {
        testimonials = [];
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
        loadTestimonials();
        displayTestimonials(); // Actualizar la visualización
        alert('Todos los testimonios han sido eliminados');
    }
}

// ===== FORMULARIOS =====
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de inscripción
    const inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inscription = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                cedula: document.getElementById('cedula').value,
                birthdate: document.getElementById('birthdate').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                province: document.getElementById('province').value,
                canton: document.getElementById('canton').value,
                parish: document.getElementById('parish').value,
                neighborhood: document.getElementById('neighborhood').value,
                course: document.getElementById('course').value,
                message: document.getElementById('message').value,
                date: new Date().toISOString()
            };
            
            inscriptions.push(inscription);
            localStorage.setItem('inscriptions', JSON.stringify(inscriptions));
            
            alert('¡Inscripción enviada con éxito! Nos comunicaremos contigo pronto.');
            this.reset();
        });
    }

    // Formulario de testimonios
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const testimonial = {
                name: document.getElementById('testimonialName').value,
                course: document.getElementById('testimonialCourse').value,
                text: document.getElementById('testimonialText').value,
                rating: currentRating,
                video: document.getElementById('testimonialVideo').value,
                date: new Date().toISOString()
            };
            
            // Validar que tenga al menos una calificación
            if (currentRating === 0) {
                alert('Por favor, califica el curso con al menos una estrella');
                return;
            }
            
            testimonials.push(testimonial);
            localStorage.setItem('testimonials', JSON.stringify(testimonials));
            
            alert('¡Testimonio enviado con éxito! Gracias por compartir tu experiencia.');
            this.reset();
            resetRating();
            closeTestimonialModal();
            displayTestimonials();
        });
    }
});

// ===== VISUALIZACIÓN DE TESTIMONIOS =====
function displayTestimonials() {
    const testimonialGrid = document.getElementById('testimonialGrid');
    if (!testimonialGrid) return;
    
    testimonialGrid.innerHTML = '';
    
    // Si no hay testimonios, mostrar un mensaje
    if (testimonials.length === 0) {
        testimonialGrid.innerHTML = `
            <div class="no-testimonials">
                <p>No hay testimonios aún. ¡Sé el primero en compartir tu experiencia!</p>
            </div>
        `;
        return;
    }
    
    // Mostrar los testimonios
    testimonials.forEach(testimonial => {
        const testimonialHTML = `
            <div class="testimonial fade-in">
                <div class="testimonial-content">
                    <div class="testimonial-text">
                        "${testimonial.text}"
                    </div>
                    <div class="testimonial-author">
                        <div class="author-info">
                            <h4>${testimonial.name}</h4>
                            <p>Estudiante de ${courseNames[testimonial.course] || testimonial.course}</p>
                            <div class="rating">
                                ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5-testimonial.rating)}
                            </div>
                        </div>
                    </div>
                    ${testimonial.video ? `
<div class="testimonial-video">
    <iframe src="${testimonial.video}" 
            frameborder="0" 
            allowfullscreen>
    </iframe>
</div>
` : ''}
                </div>
            </div>
        `;
        testimonialGrid.innerHTML += testimonialHTML;
    });
}
