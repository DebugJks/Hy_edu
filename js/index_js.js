// 모바일 메뉴 토글
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('mainNav').classList.toggle('active');
});

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// 폼 제출 처리
document.querySelector('.contact-form form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
    this.reset();
});


// 아래로 스크롤 할때 헤더 숨기기
let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    let currentScroll = window.scrollY;

    if (currentScroll > lastScrollTop && currentScroll > 50) {
        // 아래로 스크롤 → 헤더 숨김
        header.classList.add("hide");
    } else {
        // 위로 스크롤 → 헤더 나타남
        header.classList.remove("hide");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // iOS 스크롤 방지
});


//  게시글 5개 보이게 하기
const scriptURL = 'https://script.google.com/macros/s/AKfycbyZOKq9jtYpEMQy0_jNfUATEBp7t9GDr4OCxMc9VMCKapB58eCeNOU0tPuFCCBxDq5XWQ/exec';
const latestPostsTable = document.querySelector('#latestPostsTable tbody');

function fetchLatestPosts() {
    const timestamp = new Date().getTime();
    const url = `${scriptURL}?boardType=notice&_=${timestamp}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) throw new Error("데이터 오류");
            const latest = data.slice().reverse().slice(0, 5);

            latestPostsTable.innerHTML = '';
            latest.forEach((post, index) => {
                const postId = `post-${index}`;
                const titleRow = document.createElement('tr');
                titleRow.className = 'post-title';
                titleRow.innerHTML = `
    <td colspan="2">
        ${post["제목"] || "제목 없음"}
        <span style="float: right; font-size: 12px; color: #999;">
            ${formatDate(post["작성일"])}
        </span>
    </td>
    `;

                const contentRow = document.createElement('tr');
                contentRow.className = 'post-content';
                contentRow.innerHTML = `
    <td colspan="2" style="white-space: pre-line; padding: 15px 20px;">
        ${post["내용"] || "내용 없음"}
    </td>
    `;

                titleRow.addEventListener('click', () => {
                    const allContents = document.querySelectorAll('.post-content');
                    allContents.forEach(row => {
                        if (row !== contentRow) row.style.display = 'none';
                    });
                    contentRow.style.display = contentRow.style.display === 'table-row' ? 'none' : 'table-row';
                });

                latestPostsTable.appendChild(titleRow);
                latestPostsTable.appendChild(contentRow);
            });
        })
        .catch(err => {
            latestPostsTable.innerHTML = `
                <tr><td colspan="2">최신 게시글을 불러오지 못했습니다.</td></tr>`;
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

document.addEventListener('DOMContentLoaded', fetchLatestPosts);