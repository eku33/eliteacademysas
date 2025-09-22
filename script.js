const ADMIN_PASSWORD = "elite2025";
const courseNames = {
    "farmacia": "Auxiliar de Farmacia",
    "enfermeria": "Auxiliar de Enfermería",
    "parvularia": "Parvularia o Educación Inicial",
    "belleza": "Técnico en Belleza Integral",
    "contabilidad": "Gestión administrativa y contabilidad",
    "cocteleria": "Técnico en Coctelería",
    "automotriz": "Técnico en Mecánica Automotriz",
    "motos": "Técnico en Mecánica de Motos",
    "fisioterapia": "Auxiliar de Fisioterapia",
    "soldadura": "Técnico en Soldadura",
    "electricidad": "Técnico en Electricidad",
    "uñas": "Técnico en Uñas",
    "forense": "Auxiliar Forense",
    "Celulares": "Mantenimiento de celulares y computadoras",
    "barberia": "Barber Shop Profesional",
    "podologia": "Auxiliar de Podología"
};
let inscriptions = JSON.parse(localStorage.getItem('inscriptions')) || [];
let testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
let currentRating = 0;
document.addEventListener('DOMContentLoaded', function() {
const isMobile = window.matchMedia("(max-width: 768px)").matches;
if (isMobile) {
    document.querySelectorAll('.course-body').forEach(body => {
        body.classList.remove('expanded');
        body.style.maxHeight = '0';
        body.style.padding = '0 20px';
    });
    
    document.querySelectorAll('.course-header .fa-chevron-up').forEach(icon => {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    });
}
    setTimeout(function() {
        const preloader = document.querySelector('.preloader');
        if (preloader) preloader.classList.add('hidden');
    }, 1500);
    initAnimations();
    initMobileMenu();
    initForms();
    displayTestimonials();
    initAdminTabs();
    initLocationSelector();
    initModalClose();
});

function initModalClose() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}
function initAnimations() {
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
    document.querySelectorAll('section, .fade-in').forEach(element => {
        observer.observe(element);
    });
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}
function initMobileMenu() {
    const menuBtn = document.querySelector('.fa-bars');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            const navMenu = document.querySelector('nav ul');
            if (navMenu) {
                navMenu.classList.toggle('show');
            }
        });
    }
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.querySelector('nav ul');
            if (navMenu && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });
    });
}
function toggleCourse(element) {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    if (isMobile) {
        const courseBody = element.nextElementSibling;
        const icon = element.querySelector('.fa-chevron-down, .fa-chevron-up');
        
        if (courseBody.classList.contains('expanded')) {
            courseBody.classList.remove('expanded');
            courseBody.style.maxHeight = '0';
            courseBody.style.padding = '0 25px';
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        } else {
            courseBody.classList.add('expanded');
            courseBody.style.maxHeight = '1000px';
            courseBody.style.padding = '20px 25px';
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        }
    } else {
        const courseBody = element.nextElementSibling;
        const icon = element.querySelector('.fa-chevron-down, .fa-chevron-up');
        document.querySelectorAll('.course-body.expanded').forEach(expandedBody => {
            if (expandedBody !== courseBody) {
                expandedBody.classList.remove('expanded');
                expandedBody.style.maxHeight = '0';
                expandedBody.style.padding = '0 25px';
                
                const expandedIcon = expandedBody.previousElementSibling.querySelector('.fa-chevron-down, .fa-chevron-up');
                if (expandedIcon) {
                    expandedIcon.classList.remove('fa-chevron-up');
                    expandedIcon.classList.add('fa-chevron-down');
                }
            }
        });
        if (courseBody.classList.contains('expanded')) {
            courseBody.classList.remove('expanded');
            courseBody.style.maxHeight = '0';
            courseBody.style.padding = '0 25px';
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        } else {
            courseBody.classList.add('expanded');
            courseBody.style.maxHeight = '1000px';
            courseBody.style.padding = '20px 25px';
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        }
    }
}
function initLocationSelector() {
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            document.querySelectorAll('.location-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.querySelectorAll('.location-content').forEach(content => {
                content.classList.remove('active');
            });
            const contentToShow = document.getElementById(`${location}-content`);
            if (contentToShow) {
                contentToShow.classList.add('active');
            }
        });
    });
}
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
    stars.forEach(star => {
        star.classList.remove('selected');
    });
    currentRating = 0;
}

function displayTestimonials() {
    const testimonialGrid = document.getElementById('testimonialGrid');
    if (!testimonialGrid) return;
    
    testimonialGrid.innerHTML = '';
    
    if (testimonials.length === 0) {
        testimonialGrid.innerHTML = `
            <div class="no-testimonials">
                <p>No hay testimonios aún. ¡Sé el primero en compartir tu experiencia!</p>
            </div>
        `;
        return;
    }
    
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
                            <div class="testimonial-rating">
                                ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                            </div>
                        </div>
                    </div>
                    ${testimonial.video ? `
                    <div class="testimonial-video">
                        <iframe src="${testimonial.video}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    ` : ''}
                    <div class="testimonial-date">
                        ${new Date(testimonial.date).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
        testimonialGrid.innerHTML += testimonialHTML;
    });
}
function initForms() {
    const inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                alert('Por favor, completa todos los campos obligatorios.');
                return;
            }
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
            
            // Redirigir a WhatsApp
            const phoneNumber = '593960755054';
            const message = `Hola, me interesa el curso de ${courseNames[inscription.course] || inscription.course}. Mi nombre es ${inscription.firstName} ${inscription.lastName}.`;
            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
        });
    }

    // Formulario de testimonios
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar campos
            if (currentRating === 0) {
                alert('Por favor, califica el curso con al menos una estrella');
                return;
            }
            
            const testimonial = {
                name: document.getElementById('testimonialName').value,
                course: document.getElementById('testimonialCourse').value,
                text: document.getElementById('testimonialText').value,
                rating: currentRating,
                video: document.getElementById('testimonialVideo').value,
                date: new Date().toISOString()
            };
            
            // Guardar testimonio
            testimonials.push(testimonial);
            localStorage.setItem('testimonials', JSON.stringify(testimonials));
            
            // Mensaje de éxito y reset
            alert('¡Testimonio enviado con éxito! Gracias por compartir tu experiencia.');
            this.reset();
            resetRating();
            closeTestimonialModal();
            displayTestimonials();
        });
    }
}

// ===== PANEL DE ADMINISTRACIÓN =====
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
}

function initAdminTabs() {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Quitar active de todos los botones
            document.querySelectorAll('.admin-tab-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Añadir active al botón clickeado
            this.classList.add('active');
            
            // Ocultar todos los contenidos
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido correspondiente
            const contentToShow = document.getElementById(`${tab}Tab`);
            if (contentToShow) {
                contentToShow.classList.add('active');
            }
        });
    });
}

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
                <td>${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</td>
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
        <p><strong>Curse:</strong> ${courseNames[testimonial.course] || testimonial.course}</p>
        <p><strong>Calificación:</strong> ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</p>
        
        <h3>Testimonio</h3>
        <p>${testimonial.text}</p>
        
        ${testimonial.video ? `
        <h3>Video</h3>
        <div class="testimonial-video-preview">
            <iframe src="${testimonial.video}" frameborder="0" allowfullscreen></iframe>
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
        displayTestimonials();
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
        displayTestimonials();
        alert('Todos los testimonios han sido eliminados');
    }
}

// ===== FUNCIONES DE CIERRE DE MODALES =====
function closeViewModal() {
    document.getElementById('viewInscriptionModal').style.display = 'none';
}

function closeTestimonialViewModal() {
    document.getElementById('viewTestimonialModal').style.display = 'none';
}

function closeTestimonialModal() {
    document.getElementById('testimonialModal').style.display = 'none';
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) testimonialForm.reset();
    resetRating();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) adminPassword.value = '';
}

// ===== VALIDACIONES =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9+\s()-]{10,}$/;
    return re.test(phone);
}
