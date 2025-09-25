// ===== CONFIGURACIÓN Y CONSTANTES =====
const ADMIN_PASSWORD = "elite2024"; // Contraseña del administrador
const CONFIG = {
    animationDuration: 400,
    scrollOffset: 100,
    storageKeys: {
        inscriptions: 'eliteInscriptions',
        testimonials: 'eliteTestimonials',
        certifications: 'eliteCertifications'
    }
};

// ===== ESTADO GLOBAL DE LA APLICACIÓN =====
const AppState = {
    currentTestimonialRating: 0,
    currentUploadRating: 0,
    testimonialMediaFile: null,
    isAdminAuthenticated: false,
    activeLocation: 'puyo',
    certificationsData: []
};

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    try {
        // Preloader
        handlePreloader();
        
        // Event listeners globales
        setupGlobalEventListeners();
        
        // Inicializar componentes
        initializeComponents();
        
        // Cargar datos existentes
        loadExistingData();
        
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        showNotification('Error al inicializar la aplicación', 'error');
    }
}

// ===== PRELOADER =====
function handlePreloader() {
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 1500);
}

// ===== EVENT LISTENERS GLOBALES =====
function setupGlobalEventListeners() {
    // Scroll effects
    window.addEventListener('scroll', handleScrollEffects);
    
    // Cerrar modales al hacer clic fuera - CORREGIDO
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function handleScrollEffects() {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    animateOnScroll();
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.classList.add('visible');
        }
    });
}

// ===== INICIALIZACIÓN DE COMPONENTES =====
function initializeComponents() {
    initializeMobileMenu();
    initializeCourses();
    initializeForms();
    initializeLocationTabs();
    initializeModals();
    initializeIntersectionObserver();
    initializeCertificationSystem();
    initializeRatingSystem();
    initializeMediaUpload(); // NUEVO: Inicializar subida de archivos
}

// ===== MENÚ MÓVIL MEJORADO =====
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Cerrar menú al hacer clic en enlace
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// ===== SISTEMA DE CURSOS - CORREGIDO =====
function initializeCourses() {
    const courseHeaders = document.querySelectorAll('.course-header');
    
    courseHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleCourse(this);
        });
        
        header.style.cursor = 'pointer';
    });
}

function toggleCourse(header) {
    const courseBody = header.nextElementSibling;
    const isExpanded = courseBody.classList.contains('expanded');
    const icon = header.querySelector('.fa-chevron-down');
    
    // Cerrar todos los cursos primero
    document.querySelectorAll('.course-body').forEach(body => {
        body.classList.remove('expanded');
        if (body.previousElementSibling) {
            body.previousElementSibling.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.course-header .fa-chevron-down').forEach(chevron => {
        chevron.style.transform = 'rotate(0deg)';
    });
    
    // Abrir el curso clickeado si no estaba expandido
    if (!isExpanded) {
        courseBody.classList.add('expanded');
        header.classList.add('active');
        if (icon) {
            icon.style.transform = 'rotate(180deg)';
        }
    }
}

// ===== FORMULARIOS =====
function initializeForms() {
    // Formulario de inscripción
    const inscriptionForm = document.getElementById('inscriptionForm');
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', handleInscriptionSubmit);
    }
    
    // Formulario de testimonios
    const testimonialForm = document.getElementById('testimonialForm');
    if (testimonialForm) {
        testimonialForm.addEventListener('submit', handleTestimonialSubmit);
    }
    
    // Botón abrir testimonio
    const openTestimonialBtn = document.getElementById('openTestimonialBtn');
    if (openTestimonialBtn) {
        openTestimonialBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openTestimonialModal();
        });
    }
}

// ===== NUEVO: SISTEMA DE SUBIDA DE ARCHIVOS PARA TESTIMONIOS =====
function initializeMediaUpload() {
    const mediaInput = document.getElementById('testimonialMedia');
    if (mediaInput) {
        mediaInput.addEventListener('change', function(e) {
            handleMediaUpload(e);
        });
    }
}

function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tamaño máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showNotification('El archivo es demasiado grande. Máximo 10MB.', 'error');
        e.target.value = '';
        return;
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
        showNotification('Formato de archivo no válido. Use imágenes (JPG, PNG, GIF) o videos (MP4, AVI, MOV).', 'error');
        e.target.value = '';
        return;
    }
    
    AppState.testimonialMediaFile = file;
    showNotification(`Archivo "${file.name}" listo para subir ✅`, 'success');
}

// ===== SISTEMA DE RATING - CORREGIDO Y MEJORADO =====
function initializeRatingSystem() {
    // Rating para testimonio modal
    const stars = document.querySelectorAll('#testimonialRating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            setRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', function() {
            updateRatingStars('testimonialRating', AppState.currentTestimonialRating);
        });
    });
}

function setRating(rating) {
    AppState.currentTestimonialRating = rating;
    updateRatingStars('testimonialRating', rating);
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#testimonialRating .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#ffc107';
            star.style.transform = 'scale(1.2)';
        } else {
            star.style.color = '#ddd';
            star.style.transform = 'scale(1)';
        }
    });
}

function updateRatingStars(containerId, rating) {
    const stars = document.querySelectorAll(`#${containerId} .star`);
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('selected');
            star.style.color = '#ffc107';
            star.style.transform = 'scale(1.2)';
        } else {
            star.classList.remove('selected');
            star.style.color = '#ddd';
            star.style.transform = 'scale(1)';
        }
    });
}

function resetTestimonialRating() {
    AppState.currentTestimonialRating = 0;
    updateRatingStars('testimonialRating', 0);
}

// ===== INSCRIPCIONES =====
function handleInscriptionSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = {
            id: Date.now(),
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            cedula: document.getElementById('cedula').value.trim(),
            birthdate: document.getElementById('birthdate').value,
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            province: document.getElementById('province').value.trim(),
            canton: document.getElementById('canton').value.trim(),
            parish: document.getElementById('parish').value.trim(),
            neighborhood: document.getElementById('neighborhood').value.trim(),
            course: document.getElementById('course').value,
            message: document.getElementById('message').value.trim(),
            date: new Date().toLocaleString('es-EC'),
            timestamp: Date.now()
        };
        
        if (!validateInscription(formData)) {
            return;
        }
        
        saveInscription(formData);
        showNotification('¡Inscripción enviada correctamente! 🎉', 'success');
        e.target.reset();
        
    } catch (error) {
        console.error('Error en inscripción:', error);
        showNotification('Error al enviar la inscripción', 'error');
    }
}

function validateInscription(data) {
    const required = ['firstName', 'lastName', 'cedula', 'birthdate', 'phone', 'email', 'course'];
    
    for (let field of required) {
        if (!data[field]) {
            showNotification(`Por favor completa el campo: ${getFieldName(field)}`, 'error');
            return false;
        }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return false;
    }
    
    return true;
}

function getFieldName(field) {
    const names = {
        'firstName': 'Nombres',
        'lastName': 'Apellidos',
        'cedula': 'Cédula',
        'birthdate': 'Fecha de Nacimiento',
        'phone': 'Teléfono',
        'email': 'Email',
        'course': 'Curso'
    };
    return names[field] || field;
}

function saveInscription(inscription) {
    try {
        let inscriptions = JSON.parse(localStorage.getItem(CONFIG.storageKeys.inscriptions)) || [];
        inscriptions.push(inscription);
        localStorage.setItem(CONFIG.storageKeys.inscriptions, JSON.stringify(inscriptions));
    } catch (error) {
        console.error('Error guardando inscripción:', error);
        throw error;
    }
}

function loadInscriptions() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG.storageKeys.inscriptions)) || [];
    } catch (error) {
        console.error('Error cargando inscripciones:', error);
        return [];
    }
}

// ===== SISTEMA DE TESTIMONIOS MEJORADO CON SOPORTE PARA MEDIA - CORREGIDO =====
async function handleTestimonialSubmit(e) {
    e.preventDefault();
    
    try {
        const testimonialData = {
            id: Date.now(),
            name: document.getElementById('testimonialName').value.trim(),
            course: document.getElementById('testimonialCourse').value,
            rating: AppState.currentTestimonialRating,
            text: document.getElementById('testimonialText').value.trim(),
            date: new Date().toLocaleDateString('es-EC'),
            timestamp: Date.now(),
            hasMedia: false,
            mediaType: null,
            mediaUrl: null
        };
        
        if (!validateTestimonial(testimonialData)) {
            return;
        }
        
        // Procesar archivo multimedia si existe
        if (AppState.testimonialMediaFile) {
            try {
                const mediaInfo = await processMediaFile(AppState.testimonialMediaFile);
                testimonialData.hasMedia = true;
                testimonialData.mediaType = mediaInfo.type;
                testimonialData.mediaUrl = mediaInfo.url;
            } catch (error) {
                console.error('Error procesando archivo multimedia:', error);
                showNotification('Error al procesar el archivo multimedia', 'error');
                return;
            }
        }
        
        saveTestimonial(testimonialData);
        showNotification('¡Testimonio publicado correctamente! 🌟', 'success');
        closeTestimonialModal();
        e.target.reset();
        resetTestimonialRating();
        resetMediaUpload();
        
    } catch (error) {
        console.error('Error en testimonio:', error);
        showNotification('Error al publicar el testimonio', 'error');
    }
}

// CORREGIDO: Función async para procesar archivos
async function processMediaFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            resolve({
                type: file.type.startsWith('image/') ? 'image' : 'video',
                url: e.target.result,
                name: file.name,
                size: file.size
            });
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

function resetMediaUpload() {
    AppState.testimonialMediaFile = null;
    const mediaInput = document.getElementById('testimonialMedia');
    if (mediaInput) mediaInput.value = '';
}

function validateTestimonial(data) {
    if (!data.name || !data.course || !data.text) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return false;
    }
    
    if (AppState.currentTestimonialRating === 0) {
        showNotification('Por favor selecciona una calificación con las estrellas', 'error');
        return false;
    }
    
    return true;
}

function saveTestimonial(testimonial) {
    try {
        let testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
        testimonials.push(testimonial);
        localStorage.setItem(CONFIG.storageKeys.testimonials, JSON.stringify(testimonials));
        loadTestimonials();
    } catch (error) {
        console.error('Error guardando testimonio:', error);
        throw error;
    }
}

// CORREGIDO: Función para cargar testimonios con mejor manejo de multimedia
function loadTestimonials() {
    try {
        const testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
        const grid = document.getElementById('testimonialGrid');
        
        if (!grid) return;
        
        if (testimonials.length === 0) {
            grid.innerHTML = `
                <div class="no-testimonials" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-comments" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No hay testimonios aún</h3>
                    <p style="color: #999;">Sé el primero en compartir tu experiencia</p>
                </div>
            `;
            return;
        }
        
        testimonials.sort((a, b) => b.timestamp - a.timestamp);
        
        grid.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial-card fade-in visible">
                <div class="testimonial-header">
                    <div class="testimonial-author">
                        <div class="author-avatar">
                            ${testimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="author-info">
                            <h4>${escapeHTML(testimonial.name)}</h4>
                            <span class="testimonial-course">${getCourseName(testimonial.course)}</span>
                        </div>
                    </div>
                    <div class="testimonial-rating">
                        ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                    </div>
                </div>
                <div class="testimonial-content">
                    ${testimonial.hasMedia ? `
                        <div class="testimonial-media">
                            ${testimonial.mediaType === 'image' ? 
                                `<img src="${testimonial.mediaUrl}" alt="Testimonio de ${escapeHTML(testimonial.name)}" loading="lazy" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'">` : 
                                `<video controls style="width: 100%; max-height: 300px; border-radius: 8px; background: #000;" onerror="this.style.display='none'">
                                    <source src="${testimonial.mediaUrl}" type="video/mp4">
                                    <source src="${testimonial.mediaUrl}" type="video/avi">
                                    <source src="${testimonial.mediaUrl}" type="video/mov">
                                    Tu navegador no soporta el elemento de video.
                                </video>`
                            }
                        </div>
                    ` : ''}
                    <div class="testimonial-text">
                        <p>${escapeHTML(testimonial.text)}</p>
                    </div>
                    <div class="testimonial-date">
                        ${testimonial.date}
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error cargando testimonios:', error);
    }
}

// ===== SISTEMA DE UBICACIÓN (PUYO/TENA) =====
function initializeLocationTabs() {
    const locationBtns = document.querySelectorAll('.location-btn');
    
    locationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const location = this.getAttribute('data-location');
            switchLocation(location, this);
        });
    });
}

function switchLocation(location, clickedBtn) {
    document.querySelectorAll('.location-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.location-content').forEach(content => {
        content.classList.remove('active');
    });
    
    clickedBtn.classList.add('active');
    
    const content = document.getElementById(`${location}-content`);
    if (content) {
        content.classList.add('active');
    }
    
    AppState.activeLocation = location;
}

// ===== SISTEMA DE MODALES - CORREGIDO =====
function initializeModals() {
    // Modal de administrador
    const adminButton = document.getElementById('adminButton');
    const closeAdmin = document.getElementById('closeAdmin');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    
    if (adminButton) {
        adminButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openAdminModal();
        });
    }
    
    if (closeAdmin) {
        closeAdmin.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeAdminModal();
        });
    }
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            checkAdminPassword();
        });
    }
    
    // Modal de testimonios
    const closeTestimonial = document.getElementById('closeTestimonial');
    const cancelTestimonialBtn = document.getElementById('cancelTestimonialBtn');
    
    if (closeTestimonial) closeTestimonial.addEventListener('click', closeTestimonialModal);
    if (cancelTestimonialBtn) cancelTestimonialBtn.addEventListener('click', closeTestimonialModal);
    
    // Modales de visualización
    const closeViewModal = document.getElementById('closeViewModal');
    const closeTestimonialViewModal = document.getElementById('closeTestimonialViewModal');
    
    if (closeViewModal) closeViewModal.addEventListener('click', closeViewInscriptionModal);
    if (closeTestimonialViewModal) closeTestimonialViewModal.addEventListener('click', closeViewTestimonialModal);
    
    // Tabs de administrador
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            openAdminTab(tabName, this);
        });
    });
    
    // Botones de administrador
    const exportInscriptionsBtn = document.getElementById('exportInscriptionsBtn');
    const clearInscriptionsBtn = document.getElementById('clearInscriptionsBtn');
    const exportTestimonialsBtn = document.getElementById('exportTestimonialsBtn');
    const clearTestimonialsBtn = document.getElementById('clearTestimonialsBtn');
    
    if (exportInscriptionsBtn) exportInscriptionsBtn.addEventListener('click', exportToCSV);
    if (clearInscriptionsBtn) clearInscriptionsBtn.addEventListener('click', clearAllInscriptions);
    if (exportTestimonialsBtn) exportTestimonialsBtn.addEventListener('click', exportTestimonialsToCSV);
    if (clearTestimonialsBtn) clearTestimonialsBtn.addEventListener('click', clearAllTestimonials);
    
    // Botones de certificaciones
    const uploadExcelBtn = document.getElementById('uploadExcelBtn');
    const exportCertificationsBtn = document.getElementById('exportCertificationsBtn');
    
    if (uploadExcelBtn) uploadExcelBtn.addEventListener('click', handleExcelUpload);
    if (exportCertificationsBtn) exportCertificationsBtn.addEventListener('click', exportCertificationsToCSV);
    
    // NUEVO: Botones de certificado
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closeCertificateModal = document.getElementById('closeCertificateModal');
    
    if (printCertificateBtn) printCertificateBtn.addEventListener('click', printCertificate);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadCertificatePDF);
    if (closeCertificateModal) closeCertificateModal.addEventListener('click', closeCertificateModalFunc);
    
    // NUEVO: Configurar input de Excel
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', handleExcelFileSelect);
    }
}

// ===== NUEVO: SISTEMA DE CARGA DE EXCEL - IMPLEMENTADO =====
function handleExcelUpload() {
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.click();
    }
}

function handleExcelFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar que sea un archivo Excel
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showNotification('Por favor selecciona un archivo Excel (.xlsx o .xls)', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Procesar la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showNotification('El archivo Excel está vacío', 'warning');
                return;
            }
            
            // Convertir datos de Excel al formato requerido
            const certifications = convertExcelToCertifications(jsonData);
            
            if (certifications.length === 0) {
                showNotification('No se pudieron procesar los datos del Excel', 'error');
                return;
            }
            
            // Guardar certificaciones
            AppState.certificationsData = certifications;
            localStorage.setItem(CONFIG.storageKeys.certifications, JSON.stringify(certifications));
            
            showNotification(`✅ Se cargaron ${certifications.length} certificados desde el Excel`, 'success');
            
            // Recargar la tabla si está en el panel de administración
            if (AppState.isAdminAuthenticated) {
                loadCertificationsTable();
            }
            
        } catch (error) {
            console.error('Error procesando Excel:', error);
            showNotification('Error al procesar el archivo Excel', 'error');
        }
    };
    
    reader.onerror = function() {
        showNotification('Error al leer el archivo', 'error');
    };
    
    reader.readAsArrayBuffer(file);
}

function convertExcelToCertifications(excelData) {
    const certifications = [];
    
    excelData.forEach((row, index) => {
        try {
            // Buscar columnas por nombre (case insensitive)
            const cedula = findColumnValue(row, ['cedula', 'cédula', 'identificación', 'dni']);
            const nombre = findColumnValue(row, ['nombre', 'estudiante', 'alumno', 'aprendiz']);
            const curso = findColumnValue(row, ['curso', 'programa', 'carrera', 'especialidad']);
            const fecha = findColumnValue(row, ['fecha', 'fecha emisión', 'fecha_emision', 'emisión']);
            const fechaExpiracion = findColumnValue(row, ['expiración', 'expiracion', 'fecha expiración', 'fecha_expiracion', 'validez']);
            
            if (cedula && nombre && curso && fecha) {
                certifications.push({
                    cedula: cedula.toString().trim(),
                    nombre: nombre.toString().trim().toUpperCase(),
                    curso: curso.toString().trim(),
                    fecha: formatDate(fecha.toString().trim()),
                    fechaExpiracion: fechaExpiracion ? formatDate(fechaExpiracion.toString().trim()) : null
                });
            }
        } catch (error) {
            console.warn(`Error procesando fila ${index + 1}:`, error);
        }
    });
    
    return certifications;
}

function findColumnValue(row, possibleColumnNames) {
    for (const colName of possibleColumnNames) {
        // Buscar en diferentes formatos de nombre de columna
        const keys = Object.keys(row);
        const foundKey = keys.find(key => 
            key.toLowerCase().includes(colName.toLowerCase())
        );
        
        if (foundKey && row[foundKey]) {
            return row[foundKey];
        }
    }
    return null;
}

function formatDate(dateString) {
    try {
        // Intentar parsear diferentes formatos de fecha
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        }
        
        // Si es un número de Excel (días desde 1900)
        if (!isNaN(dateString)) {
            const excelDate = new Date((dateString - 25569) * 86400 * 1000);
            return excelDate.toISOString().split('T')[0];
        }
        
        return dateString; // Devolver original si no se puede parsear
    } catch (error) {
        return dateString; // Devolver original en caso de error
    }
}

// ===== MODAL DE ADMINISTRADOR - CORREGIDO =====
function openAdminModal() {
    const modal = document.getElementById('modal-admin');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        AppState.isAdminAuthenticated = false;
        showAdminLogin();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('modal-admin');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        AppState.isAdminAuthenticated = false;
        
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) passwordInput.value = '';
    }
}

function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;
    
    const password = passwordInput.value.trim();
    
    if (password === ADMIN_PASSWORD) {
        AppState.isAdminAuthenticated = true;
        showAdminPanel();
        showNotification('Acceso concedido 👑', 'success');
    } else {
        showNotification('Contraseña incorrecta ❌', 'error');
        passwordInput.value = '';
        passwordInput.focus();
        
        passwordInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

function showAdminLogin() {
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    
    if (adminLogin) adminLogin.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
}

function showAdminPanel() {
    const adminLogin = document.getElementById('adminLogin');
    const adminPanel = document.getElementById('adminPanel');
    
    if (adminLogin) adminLogin.style.display = 'none';
    if (adminPanel) adminPanel.style.display = 'block';
    
    loadAdminData();
}

function openAdminTab(tabName, clickedBtn) {
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    if (tabName === 'certificationsTab') {
        loadCertificationsTable();
    }
}

function loadAdminData() {
    if (!AppState.isAdminAuthenticated) return;
    
    loadInscriptionsTable();
    loadTestimonialsTable();
    loadCertificationsTable();
}

function loadInscriptionsTable() {
    const inscriptions = loadInscriptions();
    const tableBody = document.getElementById('inscriptionsTable');
    
    if (!tableBody) return;
    
    if (inscriptions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #666;">No hay inscripciones registradas</td></tr>';
        return;
    }
    
    inscriptions.sort((a, b) => b.timestamp - a.timestamp);
    
    tableBody.innerHTML = inscriptions.map(inscription => `
        <tr>
            <td>${escapeHTML(inscription.firstName)} ${escapeHTML(inscription.lastName)}</td>
            <td>${escapeHTML(inscription.email)}</td>
            <td>${escapeHTML(inscription.phone)}</td>
            <td>${getCourseName(inscription.course)}</td>
            <td>${inscription.date}</td>
            <td>
                <button class="admin-btn view-btn" onclick="viewInscription(${inscription.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="admin-btn delete-btn" onclick="deleteInscription(${inscription.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadTestimonialsTable() {
    const testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
    const tableBody = document.getElementById('testimonialsTable');
    
    if (!tableBody) return;
    
    if (testimonials.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #666;">No hay testimonios registrados</td></tr>';
        return;
    }
    
    testimonials.sort((a, b) => b.timestamp - a.timestamp);
    
    tableBody.innerHTML = testimonials.map(testimonial => `
        <tr>
            <td>${escapeHTML(testimonial.name)}</td>
            <td>${getCourseName(testimonial.course)}</td>
            <td>${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</td>
            <td>${testimonial.date}</td>
            <td>
                <button class="admin-btn view-btn" onclick="viewTestimonial(${testimonial.id})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="admin-btn delete-btn" onclick="deleteTestimonial(${testimonial.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== NUEVO: SISTEMA DE CERTIFICACIONES MEJORADO =====
function initializeCertificationSystem() {
    const searchBtn = document.getElementById('searchCertificateBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchCertificate);
    }
    
    const cedulaSearch = document.getElementById('cedulaSearch');
    if (cedulaSearch) {
        cedulaSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCertificate();
            }
        });
    }
    
    loadCertificationsData();
}

function loadCertificationsData() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKeys.certifications);
        if (savedData) {
            AppState.certificationsData = JSON.parse(savedData);
        }
    } catch (error) {
        console.error('Error cargando certificaciones:', error);
        AppState.certificationsData = [];
    }
}

function searchCertificate() {
    const cedulaInput = document.getElementById('cedulaSearch');
    const resultsContainer = document.getElementById('certificationResults');
    
    if (!cedulaInput || !resultsContainer) return;
    
    const cedula = cedulaInput.value.trim();
    
    if (!cedula) {
        showNotification('Por favor ingresa un número de cédula', 'warning');
        return;
    }
    
    if (!/^\d+$/.test(cedula)) {
        showNotification('La cédula debe contener solo números', 'error');
        return;
    }
    
    resultsContainer.innerHTML = `
        <div class="loading-results">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Buscando certificado...</p>
        </div>
    `;
    
    setTimeout(() => {
        const certificado = AppState.certificationsData.find(cert => cert.cedula === cedula);
        
        if (certificado) {
            resultsContainer.innerHTML = `
                <div class="certificate-found">
                    <div class="certificate-header">
                        <i class="fas fa-certificate" style="color: #27ae60; font-size: 48px;"></i>
                        <h3 style="color: var(--success); margin: 15px 0;">¡Certificado Encontrado!</h3>
                    </div>
                    <div class="certificate-details">
                        <div class="detail-row">
                            <span class="detail-label">Cédula:</span>
                            <span class="detail-value">${certificado.cedula}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Nombre:</span>
                            <span class="detail-value">${escapeHTML(certificado.nombre)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Curso:</span>
                            <span class="detail-value">${escapeHTML(certificado.curso)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Emisión:</span>
                            <span class="detail-value">${certificado.fecha}</span>
                        </div>
                        ${certificado.fechaExpiracion ? `
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Expiración:</span>
                            <span class="detail-value">${certificado.fechaExpiracion}</span>
                        </div>
                        ` : ''}
                        <div class="detail-row">
                            <span class="detail-label">Estado:</span>
                            <span class="detail-value status-valid">VÁLIDO</span>
                        </div>
                    </div>
                    <div class="certificate-actions">
                        <button class="btn btn-success" onclick="openCertificateModal('${cedula}')">
                            <i class="fas fa-print"></i> Ver e Imprimir Certificado
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="certificate-not-found">
                    <i class="fas fa-search" style="color: #e74c3c; font-size: 48px;"></i>
                    <h3 style="color: var(--accent); margin: 15px 0;">Certificado No Encontrado</h3>
                    <p>No se encontró ningún certificado asociado a la cédula: <strong>${cedula}</strong></p>
                    <p class="help-text">Verifica que el número de cédula sea correcto o contacta con la administración.</p>
                </div>
            `;
        }
    }, 1000);
}

// ===== NUEVO: SISTEMA DE CERTIFICADOS PDF =====
function openCertificateModal(cedula) {
    const certificado = AppState.certificationsData.find(cert => cert.cedula === cedula);
    if (!certificado) return;
    
    const modal = document.getElementById('certificateModal');
    const certificateContent = document.getElementById('certificateContent');
    
    if (modal && certificateContent) {
        // Actualizar contenido del certificado
        document.getElementById('certificateStudentName').textContent = certificado.nombre;
        document.getElementById('certificateProgram').textContent = certificado.curso;
        document.getElementById('certificateCedula').textContent = certificado.cedula;
        document.getElementById('certificateIssueDate').textContent = certificado.fecha;
        document.getElementById('certificateExpiryDate').textContent = certificado.fechaExpiracion || 'No expira';
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCertificateModalFunc() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function printCertificate() {
    const certificateContent = document.getElementById('certificateContent');
    if (!certificateContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificado Elite Academy</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: white;
                }
                .certificate { 
                    border: 20px solid #1a4b8c; 
                    padding: 40px; 
                    text-align: center;
                    background: white;
                }
                .logo { 
                    max-width: 150px; 
                    margin-bottom: 20px;
                }
                h1 { color: #1a4b8c; margin: 20px 0; }
                h2 { color: #2c3e50; margin: 15px 0; }
                .signature { 
                    margin-top: 40px; 
                    border-top: 2px solid #333;
                    padding-top: 10px;
                    display: inline-block;
                }
                @media print {
                    body { margin: 0; }
                    .certificate { border-width: 30px; }
                }
            </style>
        </head>
        <body>
            <div class="certificate">
                ${certificateContent.innerHTML}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function downloadCertificatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    const certificado = AppState.certificationsData.find(cert => 
        cert.cedula === document.getElementById('certificateCedula').textContent
    );
    
    if (!certificado) return;
    
    // Configuración del PDF
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(26, 75, 140); // Color primario
    
    // Título
    doc.text('CERTIFICADO DE FINALIZACIÓN', 105, 40, { align: 'center' });
    
    // Logo (simulado)
    doc.setFontSize(16);
    doc.text('Elite Academy', 105, 60, { align: 'center' });
    
    // Contenido del certificado
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Se otorga el presente certificado a:', 105, 80, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(certificado.nombre.toUpperCase(), 105, 95, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Por haber completado satisfactoriamente el programa de:', 105, 110, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(certificado.curso, 105, 125, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Cédula: ${certificado.cedula}`, 105, 145, { align: 'center' });
    doc.text(`Fecha de expedición: ${certificado.fecha}`, 105, 155, { align: 'center' });
    
    if (certificado.fechaExpiracion) {
        doc.text(`Fecha de expiración: ${certificado.fechaExpiracion}`, 105, 165, { align: 'center' });
    }
    
    // Firma
    doc.setFontSize(12);
    doc.text('_________________________', 105, 190, { align: 'center' });
    doc.text('Director Académico', 105, 200, { align: 'center' });
    doc.text('Elite Academy', 105, 210, { align: 'center' });
    
    // Guardar PDF
    doc.save(`certificado_${certificado.cedula}_${certificado.fecha}.pdf`);
    showNotification('Certificado descargado en PDF ✅', 'success');
}

function loadCertificationsTable() {
    if (!AppState.isAdminAuthenticated) return;
    
    const tableBody = document.getElementById('certificationsTable');
    if (!tableBody) return;
    
    if (AppState.certificationsData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No hay certificaciones cargadas</td></tr>';
        return;
    }
    
    tableBody.innerHTML = AppState.certificationsData.map(cert => `
        <tr>
            <td>${escapeHTML(cert.cedula)}</td>
            <td>${escapeHTML(cert.nombre)}</td>
            <td>${escapeHTML(cert.curso)}</td>
            <td>${cert.fecha}</td>
            <td>${cert.fechaExpiracion || 'No expira'}</td>
            <td><span class="status-valid">VÁLIDO</span></td>
            <td>
                <button class="admin-btn view-btn" onclick="openCertificateModal('${cert.cedula}')" title="Ver certificado">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== MODAL DE TESTIMONIOS =====
function openTestimonialModal() {
    const modal = document.getElementById('testimonialModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        resetTestimonialRating();
        resetMediaUpload();
        
        setTimeout(() => {
            const nameInput = document.getElementById('testimonialName');
            if (nameInput) nameInput.focus();
        }, 300);
    }
}

function closeTestimonialModal() {
    const modal = document.getElementById('testimonialModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        const form = document.getElementById('testimonialForm');
        if (form) form.reset();
        resetTestimonialRating();
        resetMediaUpload();
    }
}

// ===== FUNCIONES ADMINISTRATIVAS =====
function viewInscription(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    const inscriptions = loadInscriptions();
    const inscription = inscriptions.find(i => i.id === id);
    
    if (!inscription) {
        showNotification('Inscripción no encontrada', 'error');
        return;
    }
    
    const modal = document.getElementById('viewInscriptionModal');
    const details = document.getElementById('inscriptionDetails');
    
    if (modal && details) {
        details.innerHTML = `
            <div class="inscription-details">
                <h3 style="color: var(--primary); margin-bottom: 20px; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px;">Información Personal</h3>
                <p><strong>Nombre completo:</strong> ${escapeHTML(inscription.firstName)} ${escapeHTML(inscription.lastName)}</p>
                <p><strong>Cédula:</strong> ${escapeHTML(inscription.cedula)}</p>
                <p><strong>Fecha de nacimiento:</strong> ${inscription.birthdate}</p>
                <p><strong>Teléfono:</strong> ${escapeHTML(inscription.phone)}</p>
                <p><strong>Email:</strong> ${escapeHTML(inscription.email)}</p>
                
                <h3 style="color: var(--primary); margin: 30px 0 15px 0; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px;">Dirección</h3>
                <p><strong>Provincia:</strong> ${escapeHTML(inscription.province)}</p>
                <p><strong>Cantón:</strong> ${escapeHTML(inscription.canton)}</p>
                <p><strong>Parroquia:</strong> ${escapeHTML(inscription.parish)}</p>
                <p><strong>Barrio/Comunidad:</strong> ${escapeHTML(inscription.neighborhood)}</p>
                
                <h3 style="color: var(--primary); margin: 30px 0 15px 0; border-bottom: 2px solid #f0f2f5; padding-bottom: 10px;">Curso Seleccionado</h3>
                <p><strong>Programa:</strong> ${getCourseName(inscription.course)}</p>
                ${inscription.message ? `<p><strong>Mensaje adicional:</strong> ${escapeHTML(inscription.message)}</p>` : ''}
                
                <p style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #f0f2f5; color: #666;"><strong>Fecha de inscripción:</strong> ${inscription.date}</p>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// CORREGIDO: Función para ver testimonio con mejor manejo de multimedia
function viewTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    const testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
    const testimonial = testimonials.find(t => t.id === id);
    
    if (!testimonial) {
        showNotification('Testimonio no encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('viewTestimonialModal');
    const details = document.getElementById('testimonialDetails');
    
    if (modal && details) {
        details.innerHTML = `
            <div class="testimonial-details">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <div class="author-avatar" style="width: 50px; height: 50px;">${testimonial.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 style="margin: 0; color: var(--primary);">${escapeHTML(testimonial.name)}</h3>
                        <p style="margin: 5px 0 0 0; color: #666;">${getCourseName(testimonial.course)}</p>
                    </div>
                </div>
                
                <div class="testimonial-rating" style="margin-bottom: 20px; font-size: 18px;">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
                
                ${testimonial.hasMedia ? `
                    <div class="testimonial-media" style="margin-bottom: 20px;">
                        ${testimonial.mediaType === 'image' ? 
                            `<img src="${testimonial.mediaUrl}" alt="Testimonio de ${escapeHTML(testimonial.name)}" style="max-width: 100%; border-radius: 8px;" onerror="this.style.display='none'">` : 
                            `<video controls style="max-width: 100%; border-radius: 8px; background: #000;" onerror="this.style.display='none'">
                                <source src="${testimonial.mediaUrl}" type="video/mp4">
                                <source src="${testimonial.mediaUrl}" type="video/avi">
                                <source src="${testimonial.mediaUrl}" type="video/mov">
                                Tu navegador no soporta el elemento de video.
                            </video>`
                        }
                    </div>
                ` : ''}
                
                <div class="testimonial-text" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="margin: 0; line-height: 1.6; font-style: italic;">"${escapeHTML(testimonial.text)}"</p>
                </div>
                
                <p style="color: #666; text-align: right; border-top: 1px solid #e4e6eb; padding-top: 15px;">
                    <strong>Fecha:</strong> ${testimonial.date}
                </p>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function deleteInscription(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar esta inscripción? Esta acción no se puede deshacer.')) {
        try {
            let inscriptions = loadInscriptions();
            inscriptions = inscriptions.filter(i => i.id !== id);
            localStorage.setItem(CONFIG.storageKeys.inscriptions, JSON.stringify(inscriptions));
            loadInscriptionsTable();
            showNotification('Inscripción eliminada correctamente', 'success');
        } catch (error) {
            console.error('Error eliminando inscripción:', error);
            showNotification('Error al eliminar la inscripción', 'error');
        }
    }
}

function deleteTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este testimonio? Esta acción no se puede deshacer.')) {
        try {
            let testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
            testimonials = testimonials.filter(t => t.id !== id);
            localStorage.setItem(CONFIG.storageKeys.testimonials, JSON.stringify(testimonials));
            loadTestimonialsTable();
            loadTestimonials();
            showNotification('Testimonio eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error eliminando testimonio:', error);
            showNotification('Error al eliminar el testimonio', 'error');
        }
    }
}

function clearAllInscriptions() {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar TODAS las inscripciones? Esta acción es irreversible y eliminará todos los datos de inscripción.')) {
        try {
            localStorage.removeItem(CONFIG.storageKeys.inscriptions);
            loadInscriptionsTable();
            showNotification('Todas las inscripciones han sido eliminadas', 'success');
        } catch (error) {
            console.error('Error eliminando inscripciones:', error);
            showNotification('Error al eliminar las inscripciones', 'error');
        }
    }
}

function clearAllTestimonials() {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar TODOS los testimonios? Esta acción es irreversible y eliminará todos los testimonios de estudiantes.')) {
        try {
            localStorage.removeItem(CONFIG.storageKeys.testimonials);
            loadTestimonialsTable();
            loadTestimonials();
            showNotification('Todos los testimonios han sido eliminados', 'success');
        } catch (error) {
            console.error('Error eliminando testimonios:', error);
            showNotification('Error al eliminar los testimonios', 'error');
        }
    }
}

// ===== EXPORTACIÓN A CSV =====
function exportToCSV() {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    const inscriptions = loadInscriptions();
    if (inscriptions.length === 0) {
        showNotification('No hay datos para exportar', 'warning');
        return;
    }
    
    try {
        const headers = ['Nombre', 'Email', 'Teléfono', 'Curso', 'Fecha', 'Cédula', 'Provincia', 'Cantón'];
        const csvContent = [
            headers.join(','),
            ...inscriptions.map(inscription => [
                `"${inscription.firstName} ${inscription.lastName}"`,
                `"${inscription.email}"`,
                `"${inscription.phone}"`,
                `"${getCourseName(inscription.course)}"`,
                `"${inscription.date}"`,
                `"${inscription.cedula}"`,
                `"${inscription.province}"`,
                `"${inscription.canton}"`
            ].join(','))
        ].join('\n');
        
        downloadCSV(csvContent, `inscripciones_elite_academy_${new Date().toISOString().split('T')[0]}.csv`);
        showNotification('Datos exportados correctamente 📊', 'success');
    } catch (error) {
        console.error('Error exportando CSV:', error);
        showNotification('Error al exportar los datos', 'error');
    }
}

function exportTestimonialsToCSV() {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    const testimonials = JSON.parse(localStorage.getItem(CONFIG.storageKeys.testimonials)) || [];
    if (testimonials.length === 0) {
        showNotification('No hay testimonios para exportar', 'warning');
        return;
    }
    
    try {
        const headers = ['Nombre', 'Curso', 'Calificación', 'Fecha', 'Testimonio'];
        const csvContent = [
            headers.join(','),
            ...testimonials.map(testimonial => [
                `"${testimonial.name}"`,
                `"${getCourseName(testimonial.course)}"`,
                `"${testimonial.rating}"`,
                `"${testimonial.date}"`,
                `"${testimonial.text.replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');
        
        downloadCSV(csvContent, `testimonios_elite_academy_${new Date().toISOString().split('T')[0]}.csv`);
        showNotification('Testimonios exportados correctamente 📝', 'success');
    } catch (error) {
        console.error('Error exportando testimonios:', error);
        showNotification('Error al exportar los testimonios', 'error');
    }
}

function exportCertificationsToCSV() {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (AppState.certificationsData.length === 0) {
        showNotification('No hay certificaciones para exportar', 'warning');
        return;
    }
    
    try {
        const headers = ['Cédula', 'Nombre', 'Curso', 'Fecha', 'Fecha de Expiración', 'Estado'];
        const csvContent = [
            headers.join(','),
            ...AppState.certificationsData.map(cert => [
                `"${cert.cedula}"`,
                `"${cert.nombre}"`,
                `"${cert.curso}"`,
                `"${cert.fecha}"`,
                `"${cert.fechaExpiracion || 'No expira'}"`,
                '"VÁLIDO"'
            ].join(','))
        ].join('\n');
        
        downloadCSV(csvContent, `certificaciones_elite_academy_${new Date().toISOString().split('T')[0]}.csv`);
        showNotification('Certificaciones exportadas correctamente 📋', 'success');
    } catch (error) {
        console.error('Error exportando certificaciones:', error);
        showNotification('Error al exportar las certificaciones', 'error');
    }
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ===== SISTEMA DE NOTIFICACIONES =====
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <span>${icons[type] || ''} ${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">×</button>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        background: type === 'success' ? '#27ae60' : 
                   type === 'error' ? '#e74c3c' : 
                   type === 'warning' ? '#f39c12' : '#3498db',
        color: 'white',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '600',
        fontSize: '14px'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== UTILIDADES =====
function getCourseName(courseKey) {
    const courses = {
        'farmacia': 'Auxiliar de Farmacia',
        'enfermeria': 'Auxiliar de Enfermería',
        'parvularia': 'Parvularia o Educación Inicial',
        'belleza': 'Técnico en Belleza Integral',
        'contabilidad': 'Gestión Administrativa y Contabilidad',
        'cocteleria': 'Técnico en Coctelería',
        'automotriz': 'Técnico en Mecánica Automotriz',
        'motos': 'Técnico en Mecánica de Motos',
        'fisioterapia': 'Auxiliar de Fisioterapia',
        'soldadura': 'Técnico en Soldadura',
        'electricidad': 'Técnico en Electricidad',
        'uñas': 'Técnico en Uñas',
        'forense': 'Auxiliar Forense',
        'Celulares': 'Mantenimiento de Celulares y Computadoras',
        'barberia': 'Barber Shop Profesional',
        'podologia': 'Auxiliar de Podología'
    };
    return courses[courseKey] || 'Curso no especificado';
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initializeIntersectionObserver() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    } else {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }
}

function loadExistingData() {
    loadTestimonials();
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function closeViewInscriptionModal() {
    document.getElementById('viewInscriptionModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function closeViewTestimonialModal() {
    document.getElementById('viewTestimonialModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ===== ESTILOS DINÁMICOS - MEJORADOS =====
const dynamicStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
}

.notification-close:hover {
    opacity: 0.8;
}

.admin-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
    margin: 2px;
}

.view-btn {
    background: #3498db;
    color: white;
}

.view-btn:hover {
    background: #2980b9;
    transform: scale(1.05);
}

.delete-btn {
    background: #e74c3c;
    color: white;
}

.delete-btn:hover {
    background: #c0392b;
    transform: scale(1.05);
}

.no-testimonials {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.inscription-details p {
    margin: 10px 0;
    padding: 8px 0;
    border-bottom: 1px solid #f0f2f5;
}

.inscription-details h3 {
    color: var(--primary);
    margin: 25px 0 15px 0;
}

.loading-results {
    text-align: center;
    padding: 40px;
    color: var(--gray);
}

.loading-results .fa-spinner {
    font-size: 36px;
    margin-bottom: 15px;
    color: var(--primary);
}

.certificate-found, .certificate-not-found {
    text-align: center;
    padding: 20px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    padding: 8px 0;
    border-bottom: 1px solid #e4e6eb;
}

.detail-label {
    font-weight: 600;
    color: var(--dark);
}

.detail-value {
    color: var(--text);
}

.status-valid {
    background: var(--success);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.certificate-actions {
    margin-top: 20px;
}

.btn-success {
    background: var(--success);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-success:hover {
    background: #229954;
}

.help-text {
    font-size: 14px;
    color: var(--gray);
    margin-top: 10px;
}

.testimonial-media {
    margin: 15px 0;
    border-radius: 10px;
    overflow: hidden;
    max-width: 100%;
}

.testimonial-media img {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
}

.testimonial-media video {
    width: 100%;
    max-height: 300px;
    border-radius: 8px;
    background: #000;
}

.certificate-modal-content {
    max-width: 800px;
    background: linear-gradient(135deg, #f9f9f9 0%, #ffffff 100%);
    border: 10px solid var(--primary);
}

.certificate-header {
    text-align: center;
    padding: 30px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
}

.certificate-header img {
    height: 80px;
    margin-bottom: 15px;
}

.certificate-header h2 {
    font-size: 28px;
    margin: 0;
    font-weight: 800;
}

.certificate-body {
    padding: 40px;
    text-align: center;
}

.certificate-body h3 {
    font-size: 32px;
    color: var(--primary);
    margin: 20px 0;
    font-weight: 700;
}

.certificate-body h4 {
    font-size: 24px;
    color: var(--dark);
    margin: 15px 0;
    font-weight: 600;
}

.certificate-signatures {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    gap: 50px;
}

.signature {
    text-align: center;
}

.signature p:first-child {
    margin-bottom: 10px;
    font-size: 18px;
}

.certificate-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
    padding: 20px;
    background: #f8f9fa;
    border-top: 2px solid #e4e6eb;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
}

.btn-secondary {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    color: white;
}
`;

// Inyectar estilos dinámicos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// ===== INICIALIZACIÓN FINAL =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// ===== DATOS DE EJEMPLO PARA CERTIFICACIONES =====
function loadSampleCertifications() {
    const sampleData = [
        { 
            cedula: '1234567890', 
            nombre: 'MARÍA FERNANDA GÓMEZ LÓPEZ', 
            curso: 'Auxiliar de Enfermería', 
            fecha: '2024-01-15',
            fechaExpiracion: '2026-01-15'
        },
        { 
            cedula: '0987654321', 
            nombre: 'CARLOS ANDRÉS MARTÍNEZ RÍOS', 
            curso: 'Técnico en Mecánica Automotriz', 
            fecha: '2024-02-20',
            fechaExpiracion: '2026-02-20'
        },
        { 
            cedula: '1122334455', 
            nombre: 'ANA LUCÍA PÉREZ GARCÍA', 
            curso: 'Parvularia o Educación Inicial', 
            fecha: '2024-03-10',
            fechaExpiracion: '2026-03-10'
        }
    ];
    
    AppState.certificationsData = sampleData;
    localStorage.setItem(CONFIG.storageKeys.certifications, JSON.stringify(sampleData));
}

// Cargar datos de ejemplo al iniciar
setTimeout(loadSampleCertifications, 1000);

console.log('🚀 Elite Academy - Sistema completo y funcional');
