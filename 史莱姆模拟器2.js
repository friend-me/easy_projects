
// 获取Canvas上下文
const canvas = document.getElementById('slimeCanvas');
const ctx = canvas.getContext('2d');

// 设置Canvas尺寸
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
    requestAnimationFrame(resizeCanvas);
});

// 初始化参数
let particles = [];
const particleCount = 150;
let mouseX = null;
let mouseY = null;
let isMouseDown = false;
let physicsEnabled = true;

// 创建粒子系统
for(let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        radius: 2 + Math.random() * 3,
        color: `rgba(${Math.floor(50 + Math.random()*100)}, ${Math.floor(150+Math.random()*100)}, ${Math.floor(200+Math.random()*55)}, ${0.7 + Math.random() * 0.3})`
    });
}

// 更新粒子位置
function updateParticles() {
    for(let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // 应用力场影响
        if(physicsEnabled && mouseX !== null && mouseY !== null) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if(distance < 100) {
                const force = (100 - distance) / 50;
                p.vx += dx * force * 0.05;
                p.vy += dy * force * 0.05;
            }
        }

        // 边界反弹
        if(p.x <= 0 || p.x >= canvas.width) p.vx *= -0.8;
        if(p.y <= 0 || p.y >= canvas.height) p.vy *= -0.8;

        // 更新坐标
        p.x += p.vx;
        p.y += p.vy;

        // 减速阻尼
        p.vx *= 0.95;
        p.vy *= 0.95;
    }
}

// 渲染画面
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制连接线段形成粘稠感
    for(let i = 0; i < particles.length; i++) {
        for(let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < 50) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 * (1 - dist/50)})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }

    // 绘制圆形粒子
    for(let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
}

// 动画循环
function animate() {
    updateParticles();
    render();
    requestAnimationFrame(animate);
}
animate();

// 用户输入事件监听
canvas.addEventListener('mousedown', e => {
    isMouseDown = true;
    handleMouseMove(e);
});
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    mouseX = null;
    mouseY = null;
});
canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
    mouseX = null;
    mouseY = null;
});

function handleMouseMove(e) {
    if(!isMouseDown) return;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
}

// 移动设备触摸支持
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    isMouseDown = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isMouseDown) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
    mouseX = null;
    mouseY = null;
});

// 公共控制接口
function resetSlime() {
    particles.forEach(p => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
        p.vx = 0;
        p.vy = 0;
    });
}

function togglePhysics() {
    physicsEnabled = !physicsEnabled;
    document.getElementById("physicsBtnText").textContent = physicsEnabled ? "关闭物理" : "开启物理";
}
