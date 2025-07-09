// 오디오 객체 초기화
const sounds = {
    success: new Audio('assets/Ascending 3.mp3'),
    fail: new Audio('assets/fail_02.mp3'),
    finalSuccess: new Audio('assets/suc_01.wav')
};

// 게임 상태 관리
const gameState = {
    currentScore: 0,
    timeLeft: 5000, // 5초
    timerInterval: null,
    currentProblem: null,
    isGameActive: false
};

// DOM 요소
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    fail: document.getElementById('fail-screen'),
    success: document.getElementById('success-screen')
};

const elements = {
    timerBar: document.getElementById('timer-bar'),
    score: document.getElementById('score'),
    problem: document.getElementById('problem'),
    answerInput: document.getElementById('answer-input'),
    submitButton: document.getElementById('submit-button'),
    failAnimation: document.getElementById('fail-animation'),
    couponCanvas: document.getElementById('coupon-canvas')
};

// 화면 전환 함수
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenId].classList.add('active');
}

// 랜덤 숫자 생성 (10~50)
function getRandomNumber() {
    return Math.floor(Math.random() * 41) + 10;
}

// 새로운 문제 생성
function generateProblem() {
    const num1 = getRandomNumber();
    const num2 = getRandomNumber();
    gameState.currentProblem = {
        num1,
        num2,
        answer: num1 + num2
    };
    elements.problem.textContent = `${num1} + ${num2} = ?`;
}

// 타이머 시작
function startTimer() {
    gameState.timeLeft = 5000;
    elements.timerBar.style.width = '100%';
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    const startTime = Date.now();
    gameState.timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        gameState.timeLeft = Math.max(0, 5000 - elapsed);
        const percentage = (gameState.timeLeft / 5000) * 100;
        elements.timerBar.style.width = `${percentage}%`;

        if (gameState.timeLeft <= 0) {
            handleFailure('시간 초과!');
        }
    }, 10);
}

// 실패 처리
function handleFailure(message) {
    clearInterval(gameState.timerInterval);
    gameState.currentScore = 0;
    gameState.isGameActive = false;
    
    sounds.fail.play();
    document.getElementById('fail-message').textContent = message;
    
    // 실패 애니메이션
    elements.failAnimation.style.left = '-100px';
    showScreen('fail');
    
    // 이미지 애니메이션
    elements.failAnimation.style.transition = 'left 4s linear';
    setTimeout(() => {
        elements.failAnimation.style.left = '100%';
    }, 100);
}

// 성공 처리
function handleSuccess() {
    clearInterval(gameState.timerInterval);
    gameState.currentScore++;
    elements.score.textContent = `연속 정답: ${gameState.currentScore}/3`;
    
    if (gameState.currentScore === 3) {
        showFinalSuccess();
    } else {
        sounds.success.play();
        setTimeout(() => {
            if (gameState.isGameActive) {
                startNewProblem();
            }
        }, 1000);
    }
}

// 최종 성공 화면
function showFinalSuccess() {
    sounds.finalSuccess.play();
    showScreen('success');
    generateCoupon();
}

// 쿠폰 생성
function generateCoupon() {
    const canvas = elements.couponCanvas;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 300;
    canvas.height = 200;
    
    // 배경
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 테두리
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // 텍스트
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px "Noto Sans KR"';
    ctx.textAlign = 'center';
    ctx.fillText('🥤 음료수 1잔 무료 쿠폰', canvas.width / 2, 80);
    
    // 날짜
    const date = new Date();
    ctx.font = '16px "Noto Sans KR"';
    ctx.fillText(`발급일: ${date.toLocaleDateString()}`, canvas.width / 2, 120);
}

// 새로운 문제 시작
function startNewProblem() {
    elements.answerInput.value = '';
    elements.answerInput.focus();
    generateProblem();
    startTimer();
}

// 이벤트 리스너 설정
document.getElementById('start-button').addEventListener('click', () => {
    gameState.isGameActive = true;
    gameState.currentScore = 0;
    elements.score.textContent = '연속 정답: 0/3';
    showScreen('game');
    startNewProblem();
});

elements.submitButton.addEventListener('click', () => {
    if (!gameState.isGameActive) return;
    
    const userAnswer = parseInt(elements.answerInput.value);
    if (isNaN(userAnswer)) {
        handleFailure('숫자를 입력해주세요!');
        return;
    }
    
    if (userAnswer === gameState.currentProblem.answer) {
        handleSuccess();
    } else {
        handleFailure('틀렸습니다!');
    }
});

elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.submitButton.click();
    }
});

// 홈으로 돌아가기 버튼들
document.querySelectorAll('#home-button, #success-home').forEach(button => {
    button.addEventListener('click', () => {
        gameState.isGameActive = false;
        showScreen('start');
    });
});

// 다시하기 버튼
document.getElementById('retry-button').addEventListener('click', () => {
    gameState.isGameActive = true;
    gameState.currentScore = 0;
    elements.score.textContent = '연속 정답: 0/3';
    showScreen('game');
    startNewProblem();
});

// 쿠폰 저장하기 버튼
document.getElementById('save-coupon').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = '음료수_쿠폰.png';
    link.href = elements.couponCanvas.toDataURL();
    link.click();
}); 