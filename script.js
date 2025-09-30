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
const SUPABASE_CONFIG = {
    url: 'https://mgvznxviinfsevzvbsvd.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndnpueHZpaW5mc2V2enZic3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTI0NzcsImV4cCI6MjA3NDc2ODQ3N30.D9N5_iWH9HXuXKCbagV5HCV32wCJ4SBH7CW8Mb0ENMQ'  // ← Pega tu anon key aquí cuando lo tengas
};

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// ===== ESTADO GLOBAL DE LA APLICACIÓN =====
const AppState = {
    currentTestimonialRating: 0,
    currentUploadRating: 0,
    testimonialMediaFile: null,
    isAdminAuthenticated: false,
    activeLocation: 'puyo',
    certificationsData: [],
    testimonials: []
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
        
        // CARGAR EXCEL AUTOMÁTICAMENTE AL INICIAR
        loadExcelDataAutomatically();
        
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        showNotification('Error al inicializar la aplicación', 'error');
    }
}

// ===== NUEVA FUNCIÓN: CARGAR EXCEL AUTOMÁTICAMENTE =====
async function loadExcelDataAutomatically() {
    try {
        console.log('📂 Intentando cargar archivo Excel automáticamente...');
        
        // Intentar cargar desde el archivo Excel en el servidor
        const response = await fetch('certificados_elite_academy.xlsx');
        
        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length > 0) {
                const certifications = convertExcelToCertifications(jsonData);
                AppState.certificationsData = certifications;
                localStorage.setItem(CONFIG.storageKeys.certifications, JSON.stringify(certifications));
                console.log(`✅ Excel cargado automáticamente: ${certifications.length} certificados`);
                showNotification('Base de datos de certificados actualizada ✅', 'success');
            } else {
                console.warn('⚠️ El archivo Excel está vacío');
                loadBackupCertifications();
            }
        } else {
            console.warn('⚠️ No se pudo cargar el archivo Excel, usando datos de respaldo');
            loadBackupCertifications();
        }
    } catch (error) {
        console.error('❌ Error cargando Excel automáticamente:', error);
        loadBackupCertifications();
    }
}

// ===== FUNCIÓN MEJORADA: CARGAR CERTIFICADOS DE RESPALDO =====
function loadBackupCertifications() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKeys.certifications);
        
        if (savedData) {
            AppState.certificationsData = JSON.parse(savedData);
            console.log('✅ Certificaciones cargadas desde localStorage');
        } else {
            // Datos de ejemplo como respaldo
            AppState.certificationsData = [
                {
                    "cedula": "1234567890",
                    "nombre": "MARÍA FERNANDA GÓMEZ LÓPEZ",
                    "curso": "Auxiliar de Enfermería",
                    "fecha": "2024-01-15",
                    "fechaExpiracion": "2026-01-15"
                },
                {
                    "cedula": "0987654321",
                    "nombre": "CARLOS ANDRÉS MARTÍNEZ RÍOS",
                    "curso": "Técnico en Mecánica Automotriz",
                    "fecha": "2024-02-20",
                    "fechaExpiracion": "2026-02-20"
                }
            ];
            console.log('✅ Usando certificados de respaldo');
        }
    } catch (error) {
        console.error('Error cargando certificaciones de respaldo:', error);
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
    initializeMediaUpload();
}

// ===== MENÚ MÓVIL MEJORADO - PROBLEMA 2 SOLUCIONADO =====
function initializeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        // CORREGIDO: Usar evento click directo
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = this.classList.contains('active');
            
            // Cerrar todos los menús primero
            document.querySelectorAll('.menu-toggle').forEach(toggle => {
                toggle.classList.remove('active');
            });
            document.querySelectorAll('.nav-menu').forEach(menu => {
                menu.classList.remove('active');
            });
            
            // Abrir/cerrar menú actual
            if (!isActive) {
                this.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                this.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Cerrar menú al hacer clic en enlace
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
        
        // Cerrar menú al hacer clic fuera - MEJORADO
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

// ===== SISTEMA DE SUBIDA DE ARCHIVOS PARA TESTIMONIOS =====
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
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showNotification('El archivo es demasiado grande. Máximo 50MB.', 'error');
        e.target.value = '';
        return;
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov', 'video/webm'];
    if (!validTypes.includes(file.type)) {
        showNotification('Formato de archivo no válido. Use imágenes (JPG, PNG, GIF) o videos (MP4, AVI, MOV, WEBM).', 'error');
        e.target.value = '';
        return;
    }
    
    AppState.testimonialMediaFile = file;
    showNotification(`Archivo "${file.name}" listo para subir ✅ (${(file.size / (1024*1024)).toFixed(1)}MB)`, 'success');
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
    
    if (!/^\d{10}$/.test(data.cedula)) {
        showNotification('La cédula debe tener exactamente 10 dígitos numéricos', 'error');
        return false;
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

// ===== SISTEMA DE TESTIMONIOS =====
// ===== FUNCIÓN CORREGIDA: GUARDAR TESTIMONIO =====
async function handleTestimonialSubmit(e) {
    e.preventDefault();
    
    try {
        console.log('🔄 Iniciando envío de testimonio...');
        
        const testimonialData = {
            name: document.getElementById('testimonialName').value.trim(),
            course: document.getElementById('testimonialCourse').value,
            rating: AppState.currentTestimonialRating,
            text: document.getElementById('testimonialText').value.trim(),
            mediaUrl: null,
            mediaType: null
        };
        
        console.log('📝 Datos del testimonio:', testimonialData);
        
        // Validaciones básicas
        if (!testimonialData.name || !testimonialData.course || !testimonialData.text) {
            showNotification('❌ Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (AppState.currentTestimonialRating === 0) {
            showNotification('❌ Por favor selecciona una calificación con las estrellas', 'error');
            return;
        }
        
        // Procesar archivo multimedia si existe
        if (AppState.testimonialMediaFile) {
            console.log('📁 Procesando archivo multimedia...');
            try {
                const mediaInfo = await processMediaFile(AppState.testimonialMediaFile);
                testimonialData.mediaUrl = mediaInfo.url;
                testimonialData.mediaType = mediaInfo.type;
                console.log('✅ Archivo procesado:', mediaInfo);
            } catch (error) {
                console.error('❌ Error procesando archivo:', error);
                showNotification('❌ Error al procesar el archivo multimedia', 'error');
                return;
            }
        }
        
        // Guardar en Supabase
        console.log('💾 Guardando en Supabase...');
        const { data, error } = await supabase
            .from('testimonials')
            .insert([{
                student_name: testimonialData.name,
                student_course: testimonialData.course,
                testimonial_text: testimonialData.text,
                rating: testimonialData.rating,
                status: 'pending',
                media_url: testimonialData.mediaUrl,
                media_type: testimonialData.mediaType,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('❌ Error de Supabase:', error);
            throw new Error(`Error de Supabase: ${error.message}`);
        }

        console.log('✅ Testimonio guardado exitosamente:', data);
        
        // Limpiar formulario
        showNotification('✅ ¡Testimonio enviado para moderación! Los administradores lo revisarán pronto.', 'success');
        closeTestimonialModal();
        e.target.reset();
        resetTestimonialRating();
        resetMediaUpload();
        
    } catch (error) {
        console.error('❌ Error crítico en testimonio:', error);
        showNotification('❌ Error al enviar el testimonio: ' + error.message, 'error');
    }
}

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

// ===== FUNCIÓN CORREGIDA: GUARDAR TESTIMONIO =====
async function handleTestimonialSubmit(e) {
    e.preventDefault();
    
    try {
        console.log('🔄 Iniciando envío de testimonio...');
        
        const testimonialData = {
            name: document.getElementById('testimonialName').value.trim(),
            course: document.getElementById('testimonialCourse').value,
            rating: AppState.currentTestimonialRating,
            text: document.getElementById('testimonialText').value.trim(),
            mediaUrl: null,
            mediaType: null
        };
        
        console.log('📝 Datos del testimonio:', testimonialData);
        
        // Validaciones básicas
        if (!testimonialData.name || !testimonialData.course || !testimonialData.text) {
            showNotification('❌ Por favor completa todos los campos obligatorios', 'error');
            return;
        }
        
        if (AppState.currentTestimonialRating === 0) {
            showNotification('❌ Por favor selecciona una calificación con las estrellas', 'error');
            return;
        }
        
        // Procesar archivo multimedia si existe
        if (AppState.testimonialMediaFile) {
            console.log('📁 Procesando archivo multimedia...');
            try {
                const mediaInfo = await processMediaFile(AppState.testimonialMediaFile);
                testimonialData.mediaUrl = mediaInfo.url;
                testimonialData.mediaType = mediaInfo.type;
                console.log('✅ Archivo procesado:', mediaInfo);
            } catch (error) {
                console.error('❌ Error procesando archivo:', error);
                showNotification('❌ Error al procesar el archivo multimedia', 'error');
                return;
            }
        }
        
        // Guardar en Supabase
        console.log('💾 Guardando en Supabase...');
        const { data, error } = await supabase
            .from('testimonials')
            .insert([{
                student_name: testimonialData.name,
                student_course: testimonialData.course,
                testimonial_text: testimonialData.text,
                rating: testimonialData.rating,
                status: 'pending',
                media_url: testimonialData.mediaUrl,
                media_type: testimonialData.mediaType,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('❌ Error de Supabase:', error);
            throw new Error(`Error de Supabase: ${error.message}`);
        }

        console.log('✅ Testimonio guardado exitosamente:', data);
        
        // Limpiar formulario
        showNotification('✅ ¡Testimonio enviado para moderación! Los administradores lo revisarán pronto.', 'success');
        closeTestimonialModal();
        e.target.reset();
        resetTestimonialRating();
        resetMediaUpload();
        
    } catch (error) {
        console.error('❌ Error crítico en testimonio:', error);
        showNotification('❌ Error al enviar el testimonio: ' + error.message, 'error');
    }
}

// ===== SISTEMA DE TESTIMONIOS CON SUPABASE =====
async function loadTestimonials() {
    try {
        const grid = document.getElementById('testimonialGrid');
        if (!grid) return;

        console.log('🔄 Cargando testimonios públicos...');

        // Cargar SOLO testimonios aprobados de Supabase
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando testimonios:', error);
            throw error;
        }

        console.log('📝 Testimonios públicos cargados:', data);

        AppState.testimonials = data || [];
        renderTestimonials();
        
    } catch (error) {
        console.error('❌ Error cargando testimonios:', error);
        AppState.testimonials = [];
        renderTestimonials();
    }
}

function renderTestimonials() {
    const grid = document.getElementById('testimonialGrid');
    if (!grid) return;

    if (AppState.testimonials.length === 0) {
        grid.innerHTML = `
            <div class="no-testimonials" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-comments" style="font-size: 4rem; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No hay testimonios aún</h3>
                <p style="color: #999;">Sé el primero en compartir tu experiencia</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = AppState.testimonials.map(testimonial => `
        <div class="testimonial-card fade-in visible">
            <div class="testimonial-header">
                <div class="testimonial-author">
                    <div class="author-avatar">
                        ${testimonial.student_name?.charAt(0).toUpperCase() || testimonial.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div class="author-info">
                        <h4>${escapeHTML(testimonial.student_name || testimonial.name)}</h4>
                        <span class="testimonial-course">${getCourseName(testimonial.student_course || testimonial.course)}</span>
                    </div>
                </div>
                <div class="testimonial-rating">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
            </div>
            <div class="testimonial-content">
                ${testimonial.media_url || testimonial.hasMedia ? `
                    <div class="testimonial-media">
                        ${(testimonial.media_type === 'image' || testimonial.mediaType === 'image') ? 
                            `<img src="${testimonial.media_url || testimonial.mediaUrl}" 
                                  alt="Testimonio de ${escapeHTML(testimonial.student_name || testimonial.name)}" 
                                  loading="lazy" 
                                  style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;" 
                                  onerror="this.style.display='none'">` : 
                            `<video controls style="width: 100%; max-height: 300px; border-radius: 8px; background: #000;" 
                                    onerror="this.style.display='none'">
                                <source src="${testimonial.media_url || testimonial.mediaUrl}" type="video/mp4">
                                Tu navegador no soporta el elemento de video.
                            </video>`
                        }
                    </div>
                ` : ''}
                <div class="testimonial-text">
                    <p>${escapeHTML(testimonial.testimonial_text || testimonial.text)}</p>
                </div>
                <div class="testimonial-date">
                    ${new Date(testimonial.created_at || testimonial.timestamp).toLocaleDateString('es-EC')}
                </div>
            </div>
        </div>
    `).join('');
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
    // Modal de administrador - PROBLEMA 3 SOLUCIONADO
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
    
    // Botones de certificado - PROBLEMA 4 SOLUCIONADO
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closeCertificateModal = document.getElementById('closeCertificateModal');
    
    if (printCertificateBtn) printCertificateBtn.addEventListener('click', printCertificate);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadCertificatePDF);
    if (closeCertificateModal) closeCertificateModal.addEventListener('click', closeCertificateModalFunc);
    
    // Configurar input de Excel
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.addEventListener('change', handleExcelFileSelect);
    }
    
    // Inicializar eventos de certificado
    initializeCertificateEventListeners();
}

// ===== SISTEMA DE CERTIFICACIONES INTEGRADO =====
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
        
        cedulaSearch.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d]/g, '').slice(0, 10);
        });
    }
}

// ===== FUNCIÓN MEJORADA: BUSCAR CERTIFICADO =====
function searchCertificate() {
    const cedulaInput = document.getElementById('cedulaSearch');
    const resultsContainer = document.getElementById('certificationResults');
    
    if (!cedulaInput || !resultsContainer) return;
    
    const cedula = cedulaInput.value.trim();
    
    if (!cedula) {
        showNotification('Por favor ingresa un número de cédula', 'warning');
        return;
    }
    
    if (!/^\d{10}$/.test(cedula)) {
        showNotification('La cédula debe tener exactamente 10 dígitos numéricos', 'error');
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
            const fechaEmision = formatDisplayDate(certificado.fecha);
            const fechaExpiracion = certificado.fechaExpiracion ? formatDisplayDate(certificado.fechaExpiracion) : 'No expira';
            const estado = checkCertificateStatus(certificado.fechaExpiracion);
            
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
                            <span class="detail-label">Programa:</span>
                            <span class="detail-value">${escapeHTML(certificado.curso)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Emisión:</span>
                            <span class="detail-value">${fechaEmision}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fecha de Expiración:</span>
                            <span class="detail-value">${fechaExpiracion}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Estado:</span>
                            <span class="detail-value ${estado === 'VÁLIDO' ? 'status-valid' : 'status-expired'}">${estado}</span>
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
    }, 800);
}

// ===== NUEVA FUNCIÓN: VERIFICAR ESTADO DEL CERTIFICADO =====
function checkCertificateStatus(fechaExpiracion) {
    if (!fechaExpiracion) return 'VÁLIDO';
    
    try {
        const fechaExp = new Date(fechaExpiracion);
        const hoy = new Date();
        
        if (fechaExp < hoy) {
            return 'EXPIRADO';
        }
        
        const diffTime = fechaExp.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30) {
            return `VÁLIDO (Expira en ${diffDays} días)`;
        }
        
        return 'VÁLIDO';
    } catch (error) {
        return 'VÁLIDO';
    }
}

// ===== FUNCIÓN AUXILIAR: FORMATEAR FECHA PARA MOSTRAR =====
function formatDisplayDate(dateString) {
    try {
        if (!isNaN(dateString) && dateString > 25569) {
            const excelDate = new Date((dateString - 25569) * 86400 * 1000);
            return excelDate.toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-EC', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        return dateString;
    } catch (error) {
        return dateString;
    }
}

// ===== SISTEMA DE CERTIFICADOS - PROBLEMAS 1, 4, 5 SOLUCIONADOS =====
function openCertificateModal(cedula) {
    const certificado = AppState.certificationsData.find(cert => cert.cedula === cedula);
    if (!certificado) {
        showNotification('Certificado no encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('certificateModal');
    if (!modal) {
        showNotification('Error: Modal no encontrado', 'error');
        return;
    }
    
    try {
        const studentNameElem = document.getElementById('certificateStudentName');
        const programElem = document.getElementById('certificateProgram');
        const cedulaElem = document.getElementById('certificateCedula');
        const issueDateElem = document.getElementById('certificateIssueDate');
        
        if (studentNameElem) studentNameElem.textContent = certificado.nombre;
        if (programElem) programElem.textContent = certificado.curso;
        if (cedulaElem) cedulaElem.textContent = `Cédula: ${certificado.cedula}`;
        if (issueDateElem) {
            issueDateElem.textContent = `Fecha de certificación: ${formatDisplayDate(certificado.fecha)}`;
        }
        
        modal.style.display = 'flex';
        modal.style.alignItems = 'flex-start';
        modal.style.paddingTop = '20px';
        modal.style.paddingBottom = '20px';
        document.body.style.overflow = 'hidden';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflowY = 'auto';
        }
        
    } catch (error) {
        console.error('Error abriendo modal de certificado:', error);
        showNotification('Error al mostrar el certificado', 'error');
    }
}

// ===== FUNCIÓN MEJORADA: IMPRIMIR CERTIFICADO - PROBLEMA 4 SOLUCIONADO =====
function printCertificate() {
    try {
        const certificadoContent = document.querySelector('.certificado-horizontal');
        if (!certificadoContent) {
            showNotification('Error: Contenido del certificado no encontrado', 'error');
            return;
        }
        
        // Crear una ventana de impresión optimizada
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        
        // Estilos optimizados para impresión centrada
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificado Elite Academy</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: 'Arial', sans-serif;
                        background: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                    }
                    .certificado-horizontal { 
                        width: 29.7cm;
                        height: 21cm;
                        border: 15px solid #1a4b8c;
                        padding: 30px;
                        background: url('images/certificado_fondo.jpg') no-repeat center center;
                        background-size: cover;
                        position: relative;
                        box-shadow: none;
                        margin: 0 auto;
                    }
                    .certificado-header { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e4e6eb;
                    }
                    .logo-left, .logo-right { 
                        width: 120px;
                        height: 120px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .escudo-ecuador, .logo-academia { 
                        max-width: 100%;
                        max-height: 100%;
                        border: 2px solid #1a4b8c;
                        border-radius: 8px;
                        padding: 8px;
                        background: white;
                    }
                    .titulo-centro { 
                        text-align: center; 
                        flex: 1;
                        margin: 0 20px;
                    }
                    .titulo-centro h1 { 
                        font-size: 18px; 
                        margin: 0; 
                        color: #1a4b8c;
                        font-weight: bold;
                    }
                    .titulo-centro h2 { 
                        font-size: 16px; 
                        margin: 5px 0 0 0;
                        color: #2c3e50;
                        font-style: italic;
                    }
                    .certificado-body {
                        text-align: center;
                        padding: 0 20px;
                    }
                    .certificado-titulo h3 {
                        font-size: 32px;
                        color: #e74c3c;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                        margin-bottom: 8px;
                        font-weight: 800;
                    }
                    .nombre-estudiante { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin: 20px 0;
                        color: #1a4b8c;
                        text-transform: uppercase;
                        border-bottom: 2px solid #e4e6eb;
                        padding-bottom: 10px;
                    }
                    .programa-estudiante { 
                        font-size: 22px; 
                        font-weight: bold; 
                        margin: 15px 0;
                        color: #1a4b8c;
                        padding: 12px;
                        background: #f8f9fa;
                        border-left: 4px solid #e74c3c;
                        border-radius: 8px;
                    }
                    .certificado-firmas { 
                        display: flex; 
                        justify-content: space-around; 
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #e4e6eb;
                    }
                    .firma-item { 
                        text-align: center; 
                        width: 45%;
                    }
                    .linea-firma { 
                        border-top: 2px solid #000; 
                        width: 200px; 
                        margin: 0 auto 10px;
                    }
                    .nombre-firma {
                        font-size: 12px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin-bottom: 3px;
                    }
                    .cargo-firma {
                        font-size: 10px;
                        color: #4a5568;
                        margin-bottom: 2px;
                    }
                    .institucion-firma {
                        font-size: 9px;
                        color: #718096;
                        font-style: italic;
                    }
                    @media print {
                        body { margin: 0; }
                        .certificado-horizontal { 
                            border-width: 20px;
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                ${certificadoContent.outerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    }
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        showNotification('Preparando impresión...', 'info');
        
    } catch (error) {
        console.error('Error imprimiendo certificado:', error);
        showNotification('Error al imprimir el certificado', 'error');
    }
}

// ===== FUNCIÓN MEJORADA: DESCARGAR PDF - PROBLEMA 5 SOLUCIONADO =====
function downloadCertificatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            showNotification('Error: Librería PDF no disponible', 'error');
            return;
        }
        
        const certificado = AppState.certificationsData.find(cert => 
            cert.cedula === document.getElementById('certificateCedula')?.textContent?.replace('Cédula: ', '')
        );
        
        if (!certificado) {
            showNotification('No se pudo obtener la información del certificado', 'error');
            return;
        }
        
        // Crear PDF en orientación horizontal
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configuración
        doc.setFont('helvetica');
        
        // Fondo del certificado (bordes decorativos)
        doc.setDrawColor(26, 75, 140);
        doc.setLineWidth(15);
        doc.rect(7.5, 7.5, 277, 190);
        
        // Borde interior decorativo
        doc.setDrawColor(231, 76, 60);
        doc.setLineWidth(2);
        doc.rect(20, 20, 252, 165);
        
        // Encabezado con logos
        doc.setFontSize(16);
        doc.setTextColor(26, 75, 140);
        doc.text('ACADEMIA DE CAPACITACIÓN & INNOVACIÓN', 148, 35, { align: 'center' });
        doc.setFontSize(14);
        doc.text('"ELITE ACADEMY" S.A.S.', 148, 45, { align: 'center' });
        
        // Título del certificado
        doc.setFontSize(28);
        doc.setTextColor(231, 76, 60);
        doc.text('CERTIFICADO', 148, 70, { align: 'center' });
        
        // Contenido principal
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Se otorga el presente certificado a:', 148, 90, { align: 'center' });
        
        // Nombre del estudiante
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 75, 140);
        doc.text(certificado.nombre.toUpperCase(), 148, 110, { align: 'center' });
        
        // Cédula
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Cédula: ${certificado.cedula}`, 148, 125, { align: 'center' });
        
        // Programa
        doc.text('Por haber aprobado con éxito el programa de formación', 148, 140, { align: 'center' });
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 75, 140);
        doc.text(certificado.curso.toUpperCase(), 148, 155, { align: 'center' });
        
        // Fecha
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha de certificación: ${formatDisplayDate(certificado.fecha)}`, 148, 175, { align: 'center' });
        
        // Firmas - MEJORADAS PARA CABER MEJOR
        doc.setFontSize(10);
        const firmaY = 200;
        
        // Firma izquierda
        doc.text('_________________________', 80, firmaY, { align: 'center' });
        doc.text('Ing. Esín Maldonado Edison R.', 80, firmaY + 8, { align: 'center' });
        doc.text('Gerente General', 80, firmaY + 14, { align: 'center' });
        doc.text('Elite Academy S.A.S.', 80, firmaY + 20, { align: 'center' });
        
        // Firma derecha
        doc.text('_________________________', 216, firmaY, { align: 'center' });
        doc.text('Tnlga. López Tapia Evelyn Cristina', 216, firmaY + 8, { align: 'center' });
        doc.text('Coordinación Académica', 216, firmaY + 14, { align: 'center' });
        doc.text('Elite Academy', 216, firmaY + 20, { align: 'center' });
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Válido mediante código QR o en www.eliteacademy.edu.ec/validar', 148, 280, { align: 'center' });
        
        // Guardar PDF
        const fileName = `certificado_${certificado.cedula}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        showNotification('Certificado descargado en PDF ✅', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error al generar el PDF del certificado', 'error');
    }
}

// ===== FUNCIÓN MEJORADA: CERRAR MODAL DE CERTIFICADO =====
function closeCertificateModalFunc() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        modal.style.alignItems = 'center';
        modal.style.paddingTop = '0';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.maxHeight = 'none';
            modalContent.style.overflowY = 'visible';
        }
    }
}

// ===== INICIALIZACIÓN DE EVENT LISTENERS PARA CERTIFICADO =====
function initializeCertificateEventListeners() {
    const printBtn = document.getElementById('printCertificateBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const closeCertificateModal = document.getElementById('closeCertificateModal');
    
    if (printBtn) printBtn.addEventListener('click', printCertificate);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', downloadCertificatePDF);
    if (closeCertificateModal) closeCertificateModal.addEventListener('click', closeCertificateModalFunc);
}

// ===== SISTEMA DE EXCEL =====
function handleExcelUpload() {
    const excelFileInput = document.getElementById('excelFileInput');
    if (excelFileInput) {
        excelFileInput.click();
    }
}

function handleExcelFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        showNotification('Por favor selecciona un archivo Excel (.xlsx o .xls)', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length === 0) {
                showNotification('El archivo Excel está vacío', 'warning');
                return;
            }
            
            const certifications = convertExcelToCertifications(jsonData);
            
            if (certifications.length === 0) {
                showNotification('No se pudieron procesar los datos del Excel', 'error');
                return;
            }
            
            AppState.certificationsData = certifications;
            localStorage.setItem(CONFIG.storageKeys.certifications, JSON.stringify(certifications));
            
            showNotification(`✅ Se actualizaron ${certifications.length} certificados desde el Excel`, 'success');
            
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
            const cedula = findColumnValue(row, ['cedula', 'cédula', 'identificación', 'dni', 'ci']);
            const nombre = findColumnValue(row, ['nombre', 'estudiante', 'alumno', 'aprendiz', 'estudiante']);
            const curso = findColumnValue(row, ['curso', 'programa', 'carrera', 'especialidad', 'título']);
            const fecha = findColumnValue(row, ['fecha', 'fecha emisión', 'fecha_emision', 'emisión', 'fechaemision']);
            const fechaExpiracion = findColumnValue(row, ['expiración', 'expiracion', 'fecha expiración', 'fecha_expiracion', 'validez', 'vigencia']);
            
            if (cedula && nombre && curso && fecha) {
                certifications.push({
                    cedula: cedula.toString().trim(),
                    nombre: nombre.toString().trim().toUpperCase(),
                    curso: curso.toString().trim(),
                    fecha: formatExcelDate(fecha),
                    fechaExpiracion: fechaExpiracion ? formatExcelDate(fechaExpiracion) : null
                });
            }
        } catch (error) {
            console.warn(`Error procesando fila ${index + 1}:`, error);
        }
    });
    
    return certifications;
}

function formatExcelDate(dateValue) {
    try {
        if (typeof dateValue === 'number') {
            const excelEpoch = new Date(1900, 0, 1);
            const excelDate = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
            return excelDate.toISOString().split('T')[0];
        }
        
        if (typeof dateValue === 'string') {
            const dateFormats = [
                /(\d{4})-(\d{2})-(\d{2})/,
                /(\d{2})\/(\d{2})\/(\d{4})/,
                /(\d{2})-(\d{2})-(\d{4})/
            ];
            
            for (const format of dateFormats) {
                const match = dateValue.match(format);
                if (match) {
                    let year, month, day;
                    
                    if (format.source.includes('YYYY')) {
                        year = match[1];
                        month = match[2];
                        day = match[3];
                    } else {
                        day = match[1];
                        month = match[2];
                        year = match[3];
                    }
                    
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
            }
        }
        
        return dateValue;
    } catch (error) {
        return dateValue;
    }
}

function findColumnValue(row, possibleColumnNames) {
    for (const colName of possibleColumnNames) {
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

// ===== MODAL DE ADMINISTRADOR - PROBLEMA 3 SOLUCIONADO =====
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

// ===== FUNCIÓN CORREGIDA: CARGAR TESTIMONIOS EN PANEL ADMIN =====
// ===== FUNCIÓN CORREGIDA: CARGAR TESTIMONIOS EN PANEL ADMIN =====
async function loadTestimonialsTable() {
    if (!AppState.isAdminAuthenticated) {
        console.log('🔒 No autenticado para cargar testimonios');
        return;
    }

    try {
        console.log('🔄 Cargando testimonios para moderación...');
        
        const tableBody = document.getElementById('testimonialsTable');
        if (!tableBody) {
            console.error('❌ No se encontró la tabla de testimonios');
            return;
        }
        
        // Mostrar loading
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-spinner fa-spin"></i><br>
                    Cargando testimonios...
                </td>
            </tr>
        `;

        // Cargar TODOS los testimonios para moderación
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error de Supabase:', error);
            throw error;
        }

        console.log('📊 Testimonios cargados:', data);

        if (!data || data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #666;">No hay testimonios para moderar</td></tr>';
            return;
        }

        tableBody.innerHTML = data.map(testimonial => `
            <tr>
                <td><strong>${escapeHTML(testimonial.student_name || 'Sin nombre')}</strong></td>
                <td>${getCourseName(testimonial.student_course)}</td>
                <td style="color: #ffc107; font-size: 16px;">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</td>
                <td>${new Date(testimonial.created_at).toLocaleDateString('es-EC')}</td>
                <td>
                    <span class="status-${testimonial.status}">${testimonial.status.toUpperCase()}</span>
                </td>
                <td style="white-space: nowrap;">
                    <button class="admin-btn view-btn" onclick="viewTestimonialAdmin('${testimonial.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${testimonial.status === 'pending' ? `
                        <button class="admin-btn approve-btn" onclick="approveTestimonial('${testimonial.id}')" title="Aprobar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="admin-btn reject-btn" onclick="rejectTestimonial('${testimonial.id}')" title="Rechazar">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="admin-btn delete-btn" onclick="deleteTestimonialAdmin('${testimonial.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Tabla de testimonios cargada correctamente');

    } catch (error) {
        console.error('❌ Error cargando testimonios para admin:', error);
        
        const tableBody = document.getElementById('testimonialsTable');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle"></i><br>
                        Error al cargar testimonios<br>
                        <small>Verifica la conexión a internet</small>
                    </td>
                </tr>
            `;
        }
    }
}
// ===== FUNCIONES DE MODERACIÓN DESDE EL PANEL =====
async function approveTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de APROBAR este testimonio? Aparecerá públicamente en el sitio.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ 
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            showNotification('✅ Testimonio APROBADO - Ahora es público', 'success');
            
            // Recargar ambas tablas
            loadTestimonialsTable(); // Tabla de moderación
            loadTestimonials();      // Testimonios públicos
            
        } catch (error) {
            console.error('Error aprobando testimonio:', error);
            showNotification('❌ Error al aprobar el testimonio', 'error');
        }
    }
}
// ===== FUNCIONES DE MODERACIÓN DESDE EL PANEL =====
async function approveTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de APROBAR este testimonio? Aparecerá públicamente en el sitio.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ 
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            showNotification('✅ Testimonio APROBADO - Ahora es público', 'success');
            
            // Recargar ambas tablas
            loadTestimonialsTable(); // Tabla de moderación
            loadTestimonials();      // Testimonios públicos
            
        } catch (error) {
            console.error('Error aprobando testimonio:', error);
            showNotification('❌ Error al aprobar el testimonio', 'error');
        }
    }
}

async function rejectTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de RECHAZAR este testimonio? No aparecerá en el sitio.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ 
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            showNotification('❌ Testimonio RECHAZADO', 'success');
            loadTestimonialsTable(); // Recargar tabla de moderación
            
        } catch (error) {
            console.error('Error rechazando testimonio:', error);
            showNotification('❌ Error al rechazar el testimonio', 'error');
        }
    }
}

async function deleteTestimonialAdmin(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿ELIMINAR PERMANENTEMENTE este testimonio? Esta acción no se puede deshacer.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showNotification('🗑️ Testimonio ELIMINADO permanentemente', 'success');
            loadTestimonialsTable(); // Recargar tabla de moderación
            
        } catch (error) {
            console.error('Error eliminando testimonio:', error);
            showNotification('❌ Error al eliminar el testimonio', 'error');
        }
    }
}

function viewTestimonialAdmin(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    // Buscar el testimonio en los datos actuales
    const testimonial = AppState.testimonials.find(t => t.id === id);
    
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
                    <div class="author-avatar" style="width: 50px; height: 50px;">
                        ${testimonial.student_name?.charAt(0).toUpperCase() || testimonial.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h3 style="margin: 0; color: var(--primary);">${escapeHTML(testimonial.student_name || testimonial.name)}</h3>
                        <p style="margin: 5px 0 0 0; color: #666;">${getCourseName(testimonial.student_course || testimonial.course)}</p>
                        <p style="margin: 2px 0 0 0; color: #999; font-size: 12px;">
                            Estado: <span class="status-${testimonial.status}">${testimonial.status.toUpperCase()}</span>
                        </p>
                    </div>
                </div>
                
                <div class="testimonial-rating" style="margin-bottom: 20px; font-size: 18px;">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
                
                ${testimonial.media_url || testimonial.mediaUrl ? `
                    <div class="testimonial-media" style="margin-bottom: 20px;">
                        ${(testimonial.media_type === 'image' || testimonial.mediaType === 'image') ? 
                            `<img src="${testimonial.media_url || testimonial.mediaUrl}" 
                                  alt="Testimonio de ${escapeHTML(testimonial.student_name || testimonial.name)}" 
                                  style="max-width: 100%; border-radius: 8px;" 
                                  onerror="this.style.display='none'">` : 
                            `<video controls style="max-width: 100%; border-radius: 8px; background: #000;" 
                                    onerror="this.style.display='none'">
                                <source src="${testimonial.media_url || testimonial.mediaUrl}" type="video/mp4">
                                Tu navegador no soporta el elemento de video.
                            </video>`
                        }
                    </div>
                ` : ''}
                
                <div class="testimonial-text" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="margin: 0; line-height: 1.6; font-style: italic;">"${escapeHTML(testimonial.testimonial_text || testimonial.text)}"</p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    ${testimonial.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveTestimonial('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn btn-danger" onclick="rejectTestimonial('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    <button class="btn btn-warning" onclick="deleteTestimonialAdmin('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                
                <p style="color: #666; text-align: right; border-top: 1px solid #e4e6eb; padding-top: 15px; margin-top: 20px;">
                    <strong>Fecha de envío:</strong> ${new Date(testimonial.created_at || testimonial.timestamp).toLocaleString('es-EC')}
                </p>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}
async function rejectTestimonial(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿Estás seguro de RECHAZAR este testimonio? No aparecerá en el sitio.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ 
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            showNotification('❌ Testimonio RECHAZADO', 'success');
            loadTestimonialsTable(); // Recargar tabla de moderación
            
        } catch (error) {
            console.error('Error rechazando testimonio:', error);
            showNotification('❌ Error al rechazar el testimonio', 'error');
        }
    }
}

async function deleteTestimonialAdmin(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    if (confirm('¿ELIMINAR PERMANENTEMENTE este testimonio? Esta acción no se puede deshacer.')) {
        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            showNotification('🗑️ Testimonio ELIMINADO permanentemente', 'success');
            loadTestimonialsTable(); // Recargar tabla de moderación
            
        } catch (error) {
            console.error('Error eliminando testimonio:', error);
            showNotification('❌ Error al eliminar el testimonio', 'error');
        }
    }
}

function viewTestimonialAdmin(id) {
    if (!AppState.isAdminAuthenticated) {
        showNotification('Acceso no autorizado', 'error');
        return;
    }
    
    // Buscar el testimonio en los datos actuales
    const testimonial = AppState.testimonials.find(t => t.id === id);
    
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
                    <div class="author-avatar" style="width: 50px; height: 50px;">
                        ${testimonial.student_name?.charAt(0).toUpperCase() || testimonial.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h3 style="margin: 0; color: var(--primary);">${escapeHTML(testimonial.student_name || testimonial.name)}</h3>
                        <p style="margin: 5px 0 0 0; color: #666;">${getCourseName(testimonial.student_course || testimonial.course)}</p>
                        <p style="margin: 2px 0 0 0; color: #999; font-size: 12px;">
                            Estado: <span class="status-${testimonial.status}">${testimonial.status.toUpperCase()}</span>
                        </p>
                    </div>
                </div>
                
                <div class="testimonial-rating" style="margin-bottom: 20px; font-size: 18px;">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>
                
                ${testimonial.media_url || testimonial.mediaUrl ? `
                    <div class="testimonial-media" style="margin-bottom: 20px;">
                        ${(testimonial.media_type === 'image' || testimonial.mediaType === 'image') ? 
                            `<img src="${testimonial.media_url || testimonial.mediaUrl}" 
                                  alt="Testimonio de ${escapeHTML(testimonial.student_name || testimonial.name)}" 
                                  style="max-width: 100%; border-radius: 8px;" 
                                  onerror="this.style.display='none'">` : 
                            `<video controls style="max-width: 100%; border-radius: 8px; background: #000;" 
                                    onerror="this.style.display='none'">
                                <source src="${testimonial.media_url || testimonial.mediaUrl}" type="video/mp4">
                                Tu navegador no soporta el elemento de video.
                            </video>`
                        }
                    </div>
                ` : ''}
                
                <div class="testimonial-text" style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <p style="margin: 0; line-height: 1.6; font-style: italic;">"${escapeHTML(testimonial.testimonial_text || testimonial.text)}"</p>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    ${testimonial.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveTestimonial('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn btn-danger" onclick="rejectTestimonial('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : ''}
                    <button class="btn btn-warning" onclick="deleteTestimonialAdmin('${testimonial.id}'); document.getElementById('viewTestimonialModal').style.display='none'">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
                
                <p style="color: #666; text-align: right; border-top: 1px solid #e4e6eb; padding-top: 15px; margin-top: 20px;">
                    <strong>Fecha de envío:</strong> ${new Date(testimonial.created_at || testimonial.timestamp).toLocaleString('es-EC')}
                </p>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
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
            <td>${formatDisplayDate(cert.fecha)}</td>
            <td>${cert.fechaExpiracion ? formatDisplayDate(cert.fechaExpiracion) : 'No expira'}</td>
            <td><span class="${checkCertificateStatus(cert.fechaExpiracion) === 'VÁLIDO' ? 'status-valid' : 'status-expired'}">${checkCertificateStatus(cert.fechaExpiracion)}</span></td>
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
                `"${checkCertificateStatus(cert.fechaExpiracion)}"`
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

// ===== INICIALIZACIÓN FINAL =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

console.log('🚀 Elite Academy - Sistema completo y funcional con Excel automático');
async function testSupabaseConnection() {
    try {
        console.log('🔍 Probando conexión con Supabase...');
        
        const { data, error } = await supabase
            .from('testimonials')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ Error de conexión Supabase:', error);
            return false;
        }
        
        console.log('✅ Conexión Supabase: OK');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        testSupabaseConnection();
    }, 2000);
});