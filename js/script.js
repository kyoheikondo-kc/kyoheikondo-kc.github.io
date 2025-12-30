document.addEventListener('DOMContentLoaded', () => {
    // === Language Switching ===
    const langSwitchBtn = document.getElementById('lang-switch');
    let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en');

    function setLanguage(lang) {
        document.documentElement.lang = lang;
        document.body.setAttribute('data-lang', lang);
        localStorage.setItem('lang', lang);
        currentLang = lang;

        // Update button text
        if (langSwitchBtn) langSwitchBtn.textContent = lang === 'en' ? 'JP' : 'EN';
    }

    // Initialize
    setLanguage(currentLang);

    if (langSwitchBtn) {
        langSwitchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = currentLang === 'en' ? 'ja' : 'en';
            setLanguage(newLang);
        });
    }

    // === Dark Mode ===
    const themeSwitchBtn = document.getElementById('theme-switch');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDarkMode = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark);

    function setTheme(dark) {
        if (dark) {
            document.body.classList.add('dark-mode');
            if (themeSwitchBtn) themeSwitchBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            if (themeSwitchBtn) themeSwitchBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        isDarkMode = dark;
    }

    setTheme(isDarkMode);

    if (themeSwitchBtn) {
        themeSwitchBtn.addEventListener('click', () => {
            setTheme(!isDarkMode);
        });
    }

    // === Scroll Animations ===
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

    // === Dynamic Publications ===
    const publicationsContainer = document.getElementById('publications-list');
    const filterContainer = document.getElementById('filter-container');

    function loadPublications() {
        if (!publicationsContainer) return;

        // Use global variable from publications.js
        if (typeof publicationsData !== 'undefined') {
            renderFilterButtons(publicationsData);
            renderPublications(publicationsData);
        } else {
            console.error('Error loading publications: publicationsData is undefined');
            publicationsContainer.innerHTML = '<p>Error loading publications. Please try again later.</p>';
        }
    }

    function renderPublications(publications) {
        publicationsContainer.innerHTML = '';
        publications.forEach(pub => {
            const article = document.createElement('article');
            article.className = 'col-6 col-12-xsmall publication-item';
            article.setAttribute('data-tags', JSON.stringify(pub.tags || []));

            const link = pub.doi ? `https://doi.org/${pub.doi}` : pub.link;

            article.innerHTML = `
                <a href="${link}" class="image fit thumb" target="_blank" rel="noopener noreferrer">
                    <img src="${pub.image}" alt="${pub.title}" loading="lazy" />
                </a>
                <h3>${pub.title}</h3>
                <p><b>Published in ${pub.journal}</b><br>${pub.year}</p>
            `;
            publicationsContainer.appendChild(article);
        });
    }

    function renderFilterButtons(publications) {
        if (!filterContainer) return;

        // Extract unique tags
        const allTags = publications.flatMap(pub => pub.tags || []);
        const uniqueTags = [...new Set(allTags)].sort();

        // Add "All" button
        const allBtn = document.createElement('button');
        allBtn.textContent = 'All';
        allBtn.className = 'filter-btn active';
        allBtn.dataset.filter = 'all';
        allBtn.addEventListener('click', handleFilterClick);
        filterContainer.appendChild(allBtn);

        // Add tag buttons
        uniqueTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.textContent = tag;
            btn.className = 'filter-btn';
            btn.dataset.filter = tag;
            btn.addEventListener('click', handleFilterClick);
            filterContainer.appendChild(btn);
        });
    }

    function handleFilterClick(e) {
        const btn = e.target;
        const filter = btn.dataset.filter;

        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter items
        const items = document.querySelectorAll('.publication-item');
        items.forEach(item => {
            const tags = JSON.parse(item.getAttribute('data-tags'));
            if (filter === 'all' || tags.includes(filter)) {
                item.classList.remove('hidden');
                item.style.display = 'block'; // Ensure it's shown
                setTimeout(() => item.style.opacity = '1', 10);
            } else {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    // Initialize
    setLanguage(currentLang);
    loadPublications();
});
