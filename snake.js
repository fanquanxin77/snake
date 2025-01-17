/**
 * 贪吃蛇游戏主类
 */
class SnakeGame {
  /**
   * 初始化游戏
   * @param {HTMLCanvasElement} canvas - 游戏画布
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = 80;
    this.snake = [{x: 5, y: 5}]; // 蛇的初始位置
    this.food = this.generateFood();
    this.direction = 'right';
    this.gameOver = false;
    this.score = 0;
    this.nextDirection = 'right'; // 添加下一步方向

    // 加载图片
    this.snakeImg = new Image();
    this.foodImg = new Image();
    this.snakeImg.src = '一二.jpg';  // 确保图片在同一目录下
    this.foodImg.src = '布布.jpg';
    
    // 等待图片加载完成
    Promise.all([
      new Promise(resolve => this.snakeImg.onload = resolve),
      new Promise(resolve => this.foodImg.onload = resolve)
    ]).then(() => {
      this.draw(); // 首次绘制
    });

    // 替换为鼠标点击事件
    canvas.addEventListener('click', (event) => {
        event.preventDefault();
        
        // 如果游戏结束，点击重新开始
        if (this.gameOver) {
            this.resetGame();
            return;
        }
        
        // 获取鼠标点击位置相对于画布的坐标
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 获取蛇头位置
        const headX = this.snake[0].x * this.gridSize + this.gridSize/2;
        const headY = this.snake[0].y * this.gridSize + this.gridSize/2;
        
        // 计算点击位置相对于蛇头的方向
        const deltaX = clickX - headX;
        const deltaY = clickY - headY;
        
        // 判断方向（移除方向限制）
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平移动
            if (deltaX > 0) {
                this.nextDirection = 'right';
            } else {
                this.nextDirection = 'left';
            }
        } else {
            // 垂直移动
            if (deltaY > 0) {
                this.nextDirection = 'down';
            } else {
                this.nextDirection = 'up';
            }
        }
    });

    // 移除键盘事件（如果你想保留键盘控制，可以不删除这行）
    // document.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  /**
   * 生成食物的随机位置
   * @returns {{x: number, y: number}} 食物坐标
   */
  generateFood() {
    const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
    const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
    return {x, y};
  }

  /**
   * 处理键盘按键事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyPress(event) {
    // 游戏结束处理
    if (this.gameOver && event.code === 'Space') {
      this.snake = [{x: 5, y: 5}];
      this.food = this.generateFood();
      this.direction = 'right';
      this.nextDirection = 'right';
      this.gameOver = false;
      this.score = 0;
      return;
    }

    // 使用 nextDirection 存储下一步的方向
    switch(event.key) {
      case 'ArrowUp':
        if (this.direction !== 'down') this.nextDirection = 'up';
        break;
      case 'ArrowDown':
        if (this.direction !== 'up') this.nextDirection = 'down';
        break;
      case 'ArrowLeft':
        if (this.direction !== 'right') this.nextDirection = 'left';
        break;
      case 'ArrowRight':
        if (this.direction !== 'left') this.nextDirection = 'right';
        break;
    }
  }

  /**
   * 检查碰撞
   * @param {{x: number, y: number}} head - 蛇头位置
   * @returns {boolean} 是否发生碰撞
   */
  checkCollision(head) {
    // 如果超出边界，从另一边出现
    if (head.x < 0) {
        head.x = Math.floor(this.canvas.width / this.gridSize) - 1;
    } else if (head.x >= this.canvas.width / this.gridSize) {
        head.x = 0;
    }
    
    if (head.y < 0) {
        head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
    } else if (head.y >= this.canvas.height / this.gridSize) {
        head.y = 0;
    }
    
    // 移除自身碰撞检测
    return false;
  }

  /**
   * 更新游戏状态
   */
  update() {
    if (this.gameOver) return;

    // 更新方向
    this.direction = this.nextDirection;

    // 获取蛇头位置
    const head = {...this.snake[0]};

    // 根据方向移动蛇头
    switch(this.direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 检查并处理边界
    this.checkCollision(head);

    // 添加新的蛇头
    this.snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
        this.score += 10;
        this.food = this.generateFood();
    } else {
        this.snake.pop();
    }
  }

  /**
   * 绘制游戏画面
   */
  draw() {
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制网格背景
    this.drawGrid();

    // 绘制蛇
    this.snake.forEach((segment, index) => {
      // 启用图像平滑
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
      
      // 计算圆形裁剪区域
      const x = segment.x * this.gridSize + 2;
      const y = segment.y * this.gridSize + 2;
      const size = this.gridSize - 4;
      
      this.ctx.save();
      
      // 创建圆形裁剪路径
      this.ctx.beginPath();
      this.ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      this.ctx.clip();
      
      // 绘制图片
      this.ctx.drawImage(
        this.snakeImg,
        x,
        y,
        size,
        size
      );
      
      this.ctx.restore();
    });

    // 绘制食物（同样使用圆形）
    this.ctx.save();
    
    const foodX = this.food.x * this.gridSize + 2;
    const foodY = this.food.y * this.gridSize + 2;
    const foodSize = this.gridSize - 4;
    
    // 创建圆形裁剪路径
    this.ctx.beginPath();
    this.ctx.arc(foodX + foodSize/2, foodY + foodSize/2, foodSize/2, 0, Math.PI * 2);
    this.ctx.clip();
    
    this.ctx.drawImage(
      this.foodImg,
      foodX,
      foodY,
      foodSize,
      foodSize
    );
    
    this.ctx.restore();

    // 绘制分数
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = 'bold 32px Arial';  // 增大字体
    this.ctx.fillText(`分数: ${this.score}`, 20, 50);

    if (this.gameOver) {
      this.ctx.fillStyle = '#c0392b';
      this.ctx.font = 'bold 64px Arial';  // 增大字体
      this.ctx.fillText('游戏结束!', this.canvas.width/2 - 150, this.canvas.height/2);
      this.ctx.font = 'bold 32px Arial';
      this.ctx.fillText('点击屏幕重新开始', this.canvas.width/2 - 150, this.canvas.height/2 + 60);
    }
  }

  // 添加网格背景方法
  drawGrid() {
    this.ctx.strokeStyle = '#ecf0f1';
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }
  }

  // 添加重置游戏方法
  resetGame() {
    this.snake = [{x: 5, y: 5}];
    this.food = this.generateFood();
    this.direction = 'right';
    this.nextDirection = 'right';
    this.gameOver = false;
    this.score = 0;
  }
} 