document.addEventListener('DOMContentLoaded', () => {
    // 0. 데이터 준비 (CSV 파싱 포함)
    prepareData();

    // 1. 초기 데이터 설정
    initSite();

    // 2. 섹션 전환 네비게이션
    initNavigation();

    // 3. Home: 랜덤 무한 피드
    initHomeFeed();

    // 4. Works: 무한 스크롤 및 그리드 렌더링
    initWorks();

    // 5. CV: 데이터 렌더링
    initCV();

    // 6. Contact: 메일 전송 로직
    initContact();

    // 7. Modal: 닫기 로직
    initModal();
});

// 사이트 기본 정보 설정
function initSite() {
    document.title = SITE_CONFIG.title;
    document.getElementById('site-logo').textContent = SITE_CONFIG.logoText;

    // Contact 정보 설정 (있을 경우만)
    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    if (contactName) contactName.textContent = SITE_CONFIG.artistName;
    if (contactEmail) contactEmail.textContent = SITE_CONFIG.email;
}

// 네비게이션 로직
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section');
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');

    // 햄버거 토글
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('data-section');

            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            // 모바일 메뉴 닫기
            if (nav.classList.contains('active')) {
                hamburger.classList.remove('active');
                nav.classList.remove('active');
            }

            // 페이지 상단으로 이동
            window.scrollTo(0, 0);
        });
    });

    document.getElementById('site-logo').addEventListener('click', () => {
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('home').classList.add('active');

        // 모바일 메뉴 닫기
        if (nav.classList.contains('active')) {
            hamburger.classList.remove('active');
            nav.classList.remove('active');
        }

        window.scrollTo(0, 0);
    });

    // 저작권 연도 자동 설정
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// 데이터 셔플 함수
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 전역 데이터 관리
let FINAL_WORKS = [];
let SHUFFLED_WORKS = [];
let CV_EDUCATION = [];
let CV_EXHIBITIONS = [];
let CV_AWARDS = [];

// 데이터 준비
function prepareData() {
    if (typeof WORKS_CSV !== 'undefined' && WORKS_CSV.trim()) {
        FINAL_WORKS = WORKS_CSV.trim().split('\n').map((line, index) => {
            const [title, size, material, year, imgPath] = line.split(/[,\t]/).map(p => p.trim());
            return {
                id: `csv-${index}`,
                title, size, material, year,
                image: imgPath.startsWith('http') ? imgPath : `images/${imgPath}`
            };
        });
    }

    const parseCSV = (csv) => csv?.trim() ? csv.trim().split('\n').map(l => l.trim()).filter(Boolean) : [];
    CV_EDUCATION = parseCSV(CV_EDUCATION_CSV);
    CV_EXHIBITIONS = parseCSV(CV_EXHIBITIONS_CSV);
    CV_AWARDS = parseCSV(CV_AWARDS_CSV);

    SHUFFLED_WORKS = shuffleArray(FINAL_WORKS);
}

// 무한 스크롤 공통 로직
function setupInfiniteScroll(containerId, sentinelId, data, batchSize, renderFn) {
    const container = document.getElementById(containerId);
    const sentinel = document.getElementById(sentinelId);
    let loadedCount = 0;

    const loadBatch = () => {
        const batch = data.slice(loadedCount, loadedCount + batchSize);
        batch.forEach(item => container.appendChild(renderFn(item)));
        loadedCount += batch.length;
    };

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && loadedCount < data.length) loadBatch();
    }, { threshold: 0.1 }).observe(sentinel);
}

// Home: 랜덤 무한 피드
function initHomeFeed() {
    setupInfiniteScroll('home-feed', 'sentinel-home', SHUFFLED_WORKS, 5, (work) => {
        const div = document.createElement('div');
        div.className = 'home-feed-item';
        div.innerHTML = `<img src="${work.image}" alt="${work.title}" loading="lazy">`;
        return div;
    });
}

// Works: 무한 스크롤
function initWorks() {
    setupInfiniteScroll('works-grid', 'sentinel', FINAL_WORKS, 12, (work) => {
        const div = document.createElement('div');
        div.className = 'work-item';
        div.innerHTML = `
            <div class="work-thumb-wrapper">
                <img src="${work.image}" alt="${work.title}" loading="lazy">
            </div>
            <div class="work-title-small">${work.title}</div>
        `;
        div.onclick = () => openModal(work);
        return div;
    });
}

// CV 렌더링
function initCV() {
    const sections = [
        { title: 'Education', data: CV_EDUCATION },
        { title: 'Exhibitions', data: CV_EXHIBITIONS },
        { title: 'Awards', data: CV_AWARDS }
    ];

    document.getElementById('cv-content').innerHTML = sections
        .filter(s => s.data.length > 0)
        .map(s => `
            <div class="cv-section">
                <h3>${s.title}</h3>
                <ul class="cv-list">${s.data.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
        `).join('');
}

// Contact 메일 전송
function initContact() {
    document.getElementById('contact-email-btn').onclick = (e) => {
        e.preventDefault();
        location.href = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent('[Portfolio Inquiry]')}`;
    };
}

// Modal 로직
function openModal(work) {
    const modal = document.getElementById('work-modal');
    document.getElementById('modal-img').src = work.image;
    document.getElementById('modal-title').textContent = work.title;
    document.getElementById('modal-detail').textContent = `${work.material}, ${work.size}, ${work.year}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function initModal() {
    const modal = document.getElementById('work-modal');
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    document.getElementById('modal-img').onclick = closeModal;
    window.onclick = (e) => { if (e.target === modal) closeModal(); };
}
