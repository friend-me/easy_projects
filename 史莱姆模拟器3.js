// 史莱姆模拟器主逻辑 - 完整的 script.js

class SlimeSimulator {
  constructor() {
    this.canvas = document.getElementById('slimeArea');
    this.particlesContainer = document.getElementById('particlesContainer');
    this.particles = [];
    this.mouseX = null;
    this.mouseY = null;
    this.isMouseDown = false;
    this.physicsEnabled = true;
    this.viscosity = 0.95;
    this.elasticity = 0.8;
    this.particleCount = 150;
    this.currentColor = 'blue';
    this.currentShape = 'circle';
    
    this.init();
    this.setupEventListeners();
    this.setupControlPanel();
    this.animate();
  }

  init() {
    this.createParticles();
  }

  createParticles() {
    // 清除现有粒子
    this.particlesContainer.innerHTML = '';
    this.particles = [];
    
    // 创建新粒子
    for(let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 随机初始位置
      const x = Math.random() * this.canvas.offsetWidth;
      const y = Math.random() * this.canvas.offsetHeight;
      
      // 设置粒子样式
      particle.style.width = (2 + Math.random() * 3) + 'px';
      particle.style.height = particle.style.width;
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.backgroundColor = this.getParticleColor();
      particle.style.boxShadow = this.getParticleShadow();
      
      this.particlesContainer.appendChild(particle);
      
      this.particles.push({
        element: particle,
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        radius: parseFloat(particle.style.width) / 2
      });
    }
  }

  getParticleColor() {
    const colors = {
      blue: `rgba(${Math.floor(50 + Math.random()*100)}, ${Math.floor(150+Math.random()*100)}, ${Math.floor(200+Math.random()*55)}, ${0.7 + Math.random() * 0.3})`,
      green: `rgba(${Math.floor(50 + Math.random()*100)}, ${Math.floor(200+Math.random()*55)}, ${Math.floor(100+Math.random()*100)}, ${0.7 + Math.random() * 0.3})`,
      red: `rgba(${Math.floor(200 + Math.random()*55)}, ${Math.floor(50+Math.random()*100)}, ${Math.floor(100+Math.random()*100)}, ${0.7 + Math.random() * 0.3})`,
      purple: `rgba(${Math.floor(150 + Math.random()*100)}, ${Math.floor(50+Math.random()*100)}, ${Math.floor(200+Math.random()*55)}, ${0.7 + Math.random() * 0.3})`,
      rainbow: `hsla(${Math.floor(Math.random()*360)}, 80%, 60%, ${0.7 + Math.random() * 0.3})`,
      glow: `rgba(255, 255, 255, ${0.5 + Math.random() * 0.3})`,
      magma: `rgba(${Math.floor(200 + Math.random()*55)}, ${Math.floor(50+Math.random()*50)}, 0, ${0.7 + Math.random() * 0.3})`
    };
    return colors[this.currentColor] || colors.blue;
  }

  getParticleShadow() {
    const shadows = {
      glow: '0 0 10px #fff, 0 0 20px #fff',
      magma: '0 0 10px #ff5500, 0 0 20px #ff3300',
      rainbow: '0 0 10px currentColor, 0 0 20px currentColor'
    };
    return shadows[this.currentColor] || 'none';
  }

  updateParticles() {
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    
    for(let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // 应用力场影响
      if(this.physicsEnabled && this.mouseX !== null && this.mouseY !== null) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if(distance < 100) {
          const force = (100 - distance) / 50;
          p.vx += dx * force * 0.05;
          p.vy += dy * force * 0.05;
        }
      }

      // 边界反弹
      if(p.x <= 0 || p.x >= width) {
        p.vx *= -this.elasticity;
        p.x = p.x <= 0 ? 0 : width;
      }
      if(p.y <= 0 || p.y >= height) {
        p.vy *= -this.elasticity;
        p.y = p.y <= 0 ? 0 : height;
      }

      // 更新坐标
      p.x += p.vx;
      p.y += p.vy;

      // 减速阻尼
      p.vx *= this.viscosity;
      p.vy *= this.viscosity;

      // 更新元素位置
      p.element.style.transform = `translate(${p.x - p.radius}px, ${p.y - p.radius}px)`;
    }
  }

  animate() {
    this.updateParticles();
    requestAnimationFrame(() => this.animate());
  }

  setupEventListeners() {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.handleMouseMove(e);
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.mouseX = null;
      this.mouseY = null;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
      this.mouseX = null;
      this.mouseY = null;
    });

    // 触摸事件
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isMouseDown = true;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isMouseDown) return;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = touch.clientX - rect.left;
      this.mouseY = touch.clientY - rect.top;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.mouseX = null;
      this.mouseY = null;
    });
  }

  handleMouseMove(e) {
    if(!this.isMouseDown) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  setupControlPanel() {
    // 重置按钮
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.createParticles();
    });

    // 物理开关
    document.getElementById('physicsBtn').addEventListener('click', () => {
      this.physicsEnabled = !this.physicsEnabled;
      document.getElementById('physicsText').textContent = this.physicsEnabled ? '关闭物理' : '开启物理';
    });

    // 换色按钮
    document.getElementById('colorBtn').addEventListener('click', () => {
      const colors = ['blue', 'green', 'red', 'purple', 'rainbow', 'glow', 'magma'];
      const currentIndex = colors.indexOf(this.currentColor);
      this.currentColor = colors[(currentIndex + 1) % colors.length];
      this.updateParticleColors();
    });

    // 变形按钮（暂时设置为改变粒子大小）
    document.getElementById('shapeBtn').addEventListener('click', () => {
      const sizes = ['small', 'medium', 'large'];
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
      
      this.particles.forEach(p => {
        let size;
        switch(randomSize) {
          case 'small':
            size = 1 + Math.random() * 2;
            break;
          case 'medium':
            size = 3 + Math.random() * 3;
            break;
          case 'large':
            size = 6 + Math.random() * 4;
            break;
        }
        p.element.style.width = size + 'px';
        p.element.style.height = size + 'px';
        p.radius = size / 2;
      });
    });

    // 滑块控制
    document.getElementById('viscositySlider').addEventListener('input', (e) => {
      this.viscosity = parseFloat(e.target.value);
      document.getElementById('viscosityValue').textContent = this.viscosity.toFixed(2);
    });

    document.getElementById('elasticitySlider').addEventListener('input', (e) => {
      this.elasticity = parseFloat(e.target.value);
      document.getElementById('elasticityValue').textContent = this.elasticity.toFixed(1);
    });

    document.getElementById('particleCountSlider').addEventListener('input', (e) => {
      this.particleCount = parseInt(e.target.value);
      document.getElementById('particleCountValue').textContent = this.particleCount;
      this.createParticles();
    });

    // 预设样式
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }

  updateParticleColors() {
    this.particles.forEach(p => {
      p.element.style.backgroundColor = this.getParticleColor();
      p.element.style.boxShadow = this.getParticleShadow();
    });
  }

  applyPreset(preset) {
    switch(preset) {
      case 'water':
        this.viscosity = 0.8;
        this.elasticity = 0.2;
        this.currentColor = 'blue';
        break;
      case 'honey':
        this.viscosity = 0.99;
        this.elasticity = 0.1;
        this.currentColor = 'glow';
        break;
      case 'jelly':
        this.viscosity = 0.9;
        this.elasticity = 0.9;
        this.currentColor = 'purple';
        break;
      case 'magma':
        this.viscosity = 0.85;
        this.elasticity = 0.5;
        this.currentColor = 'magma';
        break;
      case 'glow':
        this.viscosity = 0.92;
        this.elasticity = 0.6;
        this.currentColor = 'glow';
        break;
      case 'rainbow':
        this.viscosity = 0.88;
        this.elasticity = 0.7;
        this.currentColor = 'rainbow';
        break;
    }
    
    // 更新滑块显示
    document.getElementById('viscositySlider').value = this.viscosity;
    document.getElementById('viscosityValue').textContent = this.viscosity.toFixed(2);
    document.getElementById('elasticitySlider').value = this.elasticity;
    document.getElementById('elasticityValue').textContent = this.elasticity.toFixed(1);
    
    // 更新粒子颜色
    this.updateParticleColors();
  }
}

// 页面加载完成后初始化模拟器
window.addEventListener('DOMContentLoaded', () => {
  new SlimeSimulator();
});
