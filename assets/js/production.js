// Let's polyfill this thing

Math.hypot = Math.hypot || function() {
  var y = 0;
  var length = arguments.length;

  for (var i = 0; i < length; i++) {
    if (arguments[i] === Infinity || arguments[i] === -Infinity) {
      return Infinity;
    }
    y += arguments[i] * arguments[i];
  }
  return Math.sqrt(y);
};

setTimeout(function() {
  runNetworkAnim();
}, 0);

var resizeTimeout;
window.onresize = function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(runNetworkAnim, 0);
}

var currentGlobalID = -1;

function runNetworkAnim() {
  var currentScopeID = ++currentGlobalID;
  var canvas = document.querySelector("#network");
  // var staticbg = document.querySelector("#network-static");

  if(canvas !== null){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  // Only run if canvas is over 800 px
  if (canvas !== null && canvas.width > 800) {

    canvas.style.opacity = '0.4';
    // staticbg.style.opacity = '0';

    var ctx = canvas.getContext("2d");

    var MAIN_COLOR = "#fff",
        SEC_COLOR = "#fff";

    var TAU = 2 * Math.PI;

    times = [];
    function loop() {
      if (currentGlobalID === currentScopeID ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update();
        draw();
        requestAnimationFrame(loop);
      }
    }

    function Ball (startX, startY, startVelX, startVelY) {
      this.x = startX || Math.random() * canvas.width;
      this.y = startY || Math.random() * canvas.height;
      this.vel = {
        x: startVelX || Math.random() * 2 - 1,
        y: startVelY || Math.random() * 2 - 1
      };
      this.update = function(canvas) {
        if (this.x > canvas.width + 50 || this.x < -50) {
          this.vel.x = -this.vel.x;
        }
        if (this.y > canvas.height + 50 || this.y < -50) {
          this.vel.y = -this.vel.y;
        }
        this.x += this.vel.x;
        this.y += this.vel.y;
      };
      this.draw = function(ctx, can) {
        ctx.beginPath();
        var distM = distMouse(this);
        if (distM > 150) {
          ctx.fillStyle = SEC_COLOR;
          ctx.globalAlpha = .2;
        } else {
          ctx.fillStyle = MAIN_COLOR;
          ctx.globalAlpha = 1 - distM / 240;
        }
        ctx.arc((0.5 + this.x) | 0, (0.5 + this.y) | 0, 3, 0, TAU, false);
        ctx.fill();
      }
    }

    var balls = [];
    for (var i = 0; i < canvas.width * canvas.height / (80*80); i++) {
      balls.push(new Ball(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    var lastTime = Date.now();
    function update() {
      var diff = Date.now() - lastTime;
      for (var frame = 0; frame * 16.6667 < diff; frame++) {
        for (var index = 0; index < balls.length; index++) {
          balls[index].update(canvas);
        }
      }
      lastTime = Date.now();
    }
    var mouseX = -1e9, mouseY = -1e9;
    document.addEventListener('mousemove', function(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    function distMouse(ball) {
      return Math.hypot(ball.x - mouseX, ball.y - mouseY);
    }

    function draw() {
      for (var index = 0; index < balls.length; index++) {
        var ball = balls[index];
        ctx.beginPath();
        for (var index2 = balls.length - 1; index2 > index; index2 += -1) {
          var ball2 = balls[index2];
      var dist = Math.hypot(ball.x - ball2.x, ball.y - ball2.y);
            if (dist < 100) {
              var distM = distMouse(ball2);
              if (distM > 150) {
                ctx.strokeStyle = SEC_COLOR;
                ctx.globalAlpha = .2;
              } else {
                ctx.globalAlpha = 0;
              }
              ctx.moveTo((0.5 + ball.x) | 0, (0.5 + ball.y) | 0);
              ctx.lineTo((0.5 + ball2.x) | 0, (0.5 + ball2.y) | 0);
            }
    }
        ctx.stroke();
        ball.draw(ctx, canvas);
      }
    }

    // Start
    loop();
  }

  // else if(staticbg !== null){
  //   staticbg.style.opacity = '1';
  // }
}
