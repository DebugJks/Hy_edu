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
        .then(res => {
            if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (!Array.isArray(data)) throw new Error("데이터 형식 오류");
            
            // 게시판타입이 'notice'인 것만 필터링
            const noticePosts = data.filter(post => 
                post["게시판타입"] && post["게시판타입"].toLowerCase() === 'notice'
            );
            
            const latest = noticePosts.slice().reverse().slice(0, 5);

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
                    const isHidden = contentRow.style.display === 'none';
                    document.querySelectorAll('.post-content').forEach(row => {
                        row.style.display = 'none';
                    });
                    contentRow.style.display = isHidden ? 'table-row' : 'none';
                });

                latestPostsTable.appendChild(titleRow);
                latestPostsTable.appendChild(contentRow);
            });
        })
        .catch(err => {
            console.error('공지사항 로딩 오류:', err);
            latestPostsTable.innerHTML = `
                <tr><td colspan="2">최신 게시글을 불러오지 못했습니다. (${err.message})</td></tr>`;
        });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

document.addEventListener('DOMContentLoaded', fetchLatestPosts);





// 문의 폼 제출 처리
document.getElementById('inquiryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // 로딩 상태 표시
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
    submitBtn.disabled = true;
    
    try {
        // FormData 객체 생성
        const formData = new FormData(form);
        
        // Google Apps Script 웹 앱 URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbyZOKq9jtYpEMQy0_jNfUATEBp7t9GDr4OCxMc9VMCKapB58eCeNOU0tPuFCCBxDq5XWQ/exec';
        
        // 폼 데이터를 URLSearchParams로 변환
        const urlEncodedData = new URLSearchParams();
        for (const pair of formData) {
            urlEncodedData.append(pair[0], pair[1]);
        }
        
        // 서버로 요청 전송
        const response = await fetch(scriptURL, {
            method: 'POST',
            body: urlEncodedData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        // 응답 처리
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.result === 'success') {
            alert('문의가 성공적으로 접수되었습니다!');
            form.reset(); // 폼 초기화
        } else {
            throw new Error(result.error || '서버 처리 중 오류 발생');
        }
    } catch (error) {
        console.error('문의 제출 오류:', error);
        alert(`문의 제출에 실패했습니다: ${error.message}`);
    } finally {
        // 버튼 상태 원복
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});