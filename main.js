// 초기화 로직 수정
document.addEventListener('DOMContentLoaded', () => {
    prepareData();
    initSite();
    initNavigation();
    initHomeFeed();
    initWorks();
    initCV();
    initContact();
    initModal();

    // 초기 라우팅 처리
    handleRouting();
    window.addEventListener('hashchange', handleRouting);
});

// 라우팅 처리 함수
function handleRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');

    sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === hash) {
            s.classList.add('active');
        }
    });

    // 네비게이션 활성화 상태 업데이트
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${hash}`) {
            link.classList.add('active');
        }
    });

    // 페이지 상단으로 스크롤
    window.scrollTo(0, 0);

    // 섹션 전환 시 햄버거 메뉴 닫기 (모바일 전용)
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');
    if (nav && nav.classList.contains('active')) {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
    }
}

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

// 네비게이션 로직 (이벤트 위임 방식으로 간소화)
function initNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');

    // 햄버거 토글
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    // 로고 클릭 시 홈으로 이동 (해시 변경)
    document.getElementById('site-logo').addEventListener('click', () => {
        window.location.hash = 'home';
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

    // 초기 데이터 로드 (첫 번째 배치는 즉시 로드)
    loadBatch();

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && loadedCount < data.length) loadBatch();
    }, {
        threshold: 0.1,
        rootMargin: '200px' // 미리 로드하여 끊김 방지
    }).observe(sentinel);
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
