
var AwardRotate = function (el, options) {
    this.el = el;
    this.canvas = document.getElementById(el);
    this.defaults = {
        angle: 0,
        startAngle: 0
    };
    this.options = extend(this.defaults, options);
    this.params = {
        randomData: [],
        preparing: false, // 等待用户点击 '停'
        luckyIndex: -1,
        manual: this.options.luckyPer === 1, // 是否是自动抽奖
        luckyUsers: [],
        luckyList: document.getElementById('lucky-list').getElementsByTagName('li')
    };
    this.pointer = document.getElementById('pointer'); // 点击抽奖
    this.luckyer = document.getElementById('luckyer'); // 中奖的人
    this.luckyers =  document.getElementById('lucky-group');
    this.canvasLuckyer = this.luckyers.getElementsByTagName('img'); // canvas 里面的未抽奖人


    this._init();
};

AwardRotate.prototype._init = function () {
    var self = this;
    //for(var i = 0; i < self.canvasLuckyer.length; i++) {
    //    (function (i) {
    //        var img = new Image(); //创建一个Image对象，实现图片的预下载
    //        img.src = self.canvasLuckyer[i].getAttribute('src');
    //        img.onload = function(){
    //            img.onload = null;
    //            console.log(i);
    //            if (i == self.canvasLuckyer.length - 1) {
    //                // 等待图片加载完毕, 调用渲染.
    //                console.log('in');
    //                self._bindEvetns();
    //                self._drawRouletteWheel();
    //            }
    //        };
    //    })(i);
    //}

    if (self.canvasLuckyer.length < self.options.luckySize && self.options.luckyRemain > 0) {
        self.pointer.innerHTML = '抽奖条件不足';
        self.pointer.setAttribute('disabled', true);
    }

    window.onload = function () {
        self._bindEvetns();
        self._drawRouletteWheel();
    };

};

AwardRotate.prototype._bindEvetns = function () {
    this.pointer.addEventListener('click', this._handleStart.bind(this));
};


AwardRotate.prototype._shuffle = function (array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
};

AwardRotate.prototype._getRandom = function (n, m, callback) {
    var arr = [];
    for (var i = 0; i < m; i++) {
        arr.push(i);
    }
    var result = this._shuffle(arr).slice(0, n);
    setTimeout(function () {
        callback(result);
    }, 0);
};

// 页面写入DOM
AwardRotate.prototype._writeUser = function (luckyUser) {
    var self = this,
        userName = luckyUser.getAttribute('data-name').trim(),
        userAvatar = luckyUser.src;

    // 中奖人DOM
    var Luckyer = '<div id="luckyer__img"><img src="'+ userAvatar +'"></div>' +
        '<div id="luckyer__text">'+ userName +'</div>';

    self.luckyer.innerHTML = Luckyer;

    // 抽奖结束之后得出抽奖的信息
    var userHtml =
        '<div class="lucky-list__img"><img src='+ userAvatar +'></div>' +
        '<div class="lucky-list__name text-overflow">'+ userName +'</div>';
    var userDiv = document.createElement('li');
    userDiv.setAttribute('class', 'lucky-list__item');
    userDiv.innerHTML = userHtml;

    var luckyListBar = document.getElementById('lucky-list');
    luckyListBar.insertBefore(userDiv, luckyListBar.childNodes[0]);
};


// 更新DOM
AwardRotate.prototype._updateDOM = function () {

    var self = this;

    var luckyUser = self.canvasLuckyer[self.params.luckyIndex],
        userName = luckyUser.getAttribute('data-name').trim(),
        userAvatar = luckyUser.src,
        userId = luckyUser.getAttribute('data-userid');

    //// 存储已经抽奖中的
    //self.params.luckyUsers.push(self.params.luckyIndex);
    //
    //// 标示需要去除的元素
    //luckyUser.setAttribute('class', 'lucky-group__item lucky-group__item--active');
    //
    //self._writeUser(luckyUser);
    //
    //if (self.params.luckyUsers.length === self.options.luckyRemain) {
    //    setTimeout(function () {
    //        Dialog.show({
    //            cls: 'lucky-dialog',
    //            title: $('.lucky-type').html(),
    //            msg: $('.lucky-list')[0].outerHTML,
    //            width: '90%',
    //            closable: false,
    //            buttons: [
    //                {
    //                    text: '关闭',
    //                    handler: function () {
    //                        Dialog.hide();
    //                    }
    //                }
    //            ]
    //        });
    //    }, 500);
    //}
    $.post('/'+ window.SITE_DIR_NAME +'/meeting/award_log/' + self.options.meetingID + '/' + self.options.awardID, {
        name: userName,
        avatar: userAvatar,
        userId: userId
    }, function (result) {
        if (result.code == 0) {
            // 存储已经抽奖中的
            self.params.luckyUsers.push(self.params.luckyIndex);

            // 标示需要去除的元素
            luckyUser.setAttribute('class', 'lucky-group__item lucky-group__item--active');

            self._writeUser(luckyUser);

            if (self.params.luckyUsers.length === self.options.luckyRemain) {
                setTimeout(function () {
                    Dialog.show({
                        cls: 'lucky-dialog',
                        title: $('.lucky-type').html(),
                        msg: $('.lucky-list')[0].outerHTML,
                        width: '90%',
                        closable: false,
                        buttons: [
                            {
                                text: '关闭',
                                handler: function () {
                                    Dialog.hide();
                                }
                            }
                        ]
                    });
                }, 500);
            }

        } else {
            Dialog.show('抽奖失败');
            setTimeout(function () {
                window.location.reload();
            }, 1500)
        }
    }, 'json');

};

// 处理结果
AwardRotate.prototype._handleResult = function () {
    var self = this;
    self.luckyer.style.display = 'block';

    self._updateDOM();

    if (!self.params.randomData.length) {
        if (self.params.luckyUsers.length == self.options.luckyRemain) {
            // 整个抽奖结束
            self.pointer.innerHTML = '抽奖结束';
            self.pointer.setAttribute('disabled', true);
        } else {
            setTimeout(function () {
                self.luckyer.style.display = 'none';
            }, 1000);
            // 本次抽奖结束，点击开始按钮可以开始下一次抽奖
            self.pointer.innerHTML = '开始抽奖';
            self.pointer.removeAttribute('disabled');
        }
        return;
    }

    setTimeout(function () {
        self.luckyer.style.display = 'none';
        self._getRealLuckyer();
        setTimeout(function () {
            // 根据设置的时间来暂停
            self.stopRotate();
        }, self.options.luckyRate);
    }, 1000);
};

AwardRotate.prototype._getRealLuckyer = function () {
    //获取随机数
    var self = this;
    if (!self.params.randomData.length) {

        var luckyPer = self.options.luckyPer;
        var luckyRemain = self.options.luckySize - self.params.luckyList.length; // 还剩下的未抽奖的数量
        if (self.options.luckyPer > luckyRemain) {
            luckyPer = luckyRemain;
        }
        // 获取随机数
        this._getRandom(luckyPer, self.canvasLuckyer.length, function (data) {
            self.params.randomData = data;
        });
    }
    setTimeout(function () {
        var luckyIndex = self.params.randomData.pop();
        // 加入抽中的人不在转盘里面,就把这个人拉到列表的第一个,重新排列,并且把抽奖人定位到第一个

        if (luckyIndex > self.options.initSize) {
            var newImg = self.canvasLuckyer[luckyIndex];
            self.luckyers.insertBefore(newImg, self.luckyers.childNodes[0]);
            // 重新排版滚轮的头像
            self._drawRouletteWheel();
            luckyIndex = 0;
        }
        self.params.luckyIndex = luckyIndex;
        self._handleRotate()
    }, 0);

};

AwardRotate.prototype._removeLuckyer = function () {
    var self = this;
    var nodelist = self.canvasLuckyer;
    for (var i = 0; i < nodelist.length; i++) {
        var attr = nodelist[i].getAttribute('class');
        if (attr == 'lucky-group__item lucky-group__item--active') {
            nodelist[i].remove();
            i -= 1;
        }
    }
};

// 点击开始
AwardRotate.prototype._handleStart = function () {
    var self = this;

    // 连续抽奖
    if (self.params.preparing) {
        self.params.preparing = false;
        self.pointer.innerHTML = '正在抽奖...';
        self.pointer.setAttribute('disabled', true);
        self.stopRotate();
        return;
    }

    self._removeLuckyer();
    // 重新排版滚轮的头像
    self._drawRouletteWheel();

    self._getRealLuckyer();
    self.pointer.innerHTML = '停';
    self.params.preparing = true;
};

AwardRotate.prototype._handleRotate = function () {
    var self = this;
    // 抽奖人居中所需要的角度
    var randomIndex = self.params.luckyIndex + 1;
    var angles = randomIndex * (360 / self.options.initSize) - (360 / (self.options.initSize * 2));
    if(angles < 270){
        angles = 270 - angles;
    }else{
        angles = 360 - angles + 270;
    }
    self.options.angles = angles;
    //self.stopRotate();
    self.rotate({
        animateTo:self.options.angles + 1800,
        duration: -1
    });
};

AwardRotate.prototype._drawRouletteWheel = function () {
    var canvas = this.canvas,
        self = this;
    if (canvas.getContext) {
        // 根据奖品个数计算圆周角度
        if (this.canvasLuckyer.length < self.options.initSize) {
            self.options.initSize = this.canvasLuckyer.length;
        }
        var arc = Math.PI / (self.options.initSize / 2);
        var ctx = canvas.getContext("2d");
        // 在给定矩形内清空一个矩形
        ctx.clearRect(0,0,988,988);
        for(var i = 0; i < self.options.initSize; i++) {
            var angle = self.options.startAngle + i * arc;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.fill();
            // 锁画布(为了保存之前的画布状态)
            ctx.save();

            // ----绘制奖品开始----

            ctx.translate(494 + Math.cos(angle + arc / 2) * self.options.textRadius, 494 + Math.sin(angle + arc / 2) * self.options.textRadius);

            // rotate方法旋转当前的绘图
            ctx.rotate(angle + arc / 2 + Math.PI / 2);

            var img = this.canvasLuckyer[i];
            //ctx.fillText(img.getAttribute('data-name'), -ctx.measureText(img.getAttribute('data-name')).width / 2, 100);

            // 绘制圆角图形
            self.roundedImage(-50, -50, 100, 100, 20, ctx);
            ctx.clip();
            ctx.drawImage(img,-50,-50, 100, 100);

            // 绘制边框
            ctx.rect(-50, -50, 100, 100);
            ctx.strokeStyle = '#8f1915';
            ctx.lineWidth = 3;
            ctx.stroke();


            ctx.restore();
            //----绘制奖品结束----
        }
    }
};

AwardRotate.prototype.roundedImage = function (x, y, width, height, radius, ctx) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};

AwardRotate.prototype.rotate = function (parameters) {
    var canvas = $('#' + this.el);
    if (canvas.length===0||typeof parameters=="undefined") return;
    if (typeof parameters=="number") parameters={angle:parameters};
    var returned=[];
    for (var i=0,i0=canvas.length;i<i0;i++)
    {
        var element=canvas.get(i);
        if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

            var paramClone = $.extend(true, {}, parameters);
            var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

            returned.push($(newRotObject));
        }
        else {
            element.Wilq32.PhotoEffect._handleRotation(parameters);
        }
    }
};

AwardRotate.prototype.getRotateAngle = function () {
    var ret = [];
    for (var i=0,i0=this.length;i<i0;i++)
    {
        var element=this.get(i);
        if (element.Wilq32 && element.Wilq32.PhotoEffect) {
            ret[i] = element.Wilq32.PhotoEffect._angle;
        }
    }
    return ret;
};

AwardRotate.prototype.stopRotate = function () {
    var self = this;
    self.rotate({
        animateTo:self.options.angles+1800,
        duration: 4500,
        callback:function (){
            // 回调
            self._handleResult();
        }
    });
};

window.AwardRotate = AwardRotate;

function extend(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

    return target;
}

String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g,'');
};

// Library agnostic interface

var Wilq32 = window.Wilq32||{};
Wilq32.PhotoEffect=(function(){
    return function(img,parameters){
        img.Wilq32 = {
            PhotoEffect: this
        };

        this._img = this._rootObj = this._eventObj = img;
        this._handleRotation(parameters);
    }
})();

Wilq32.PhotoEffect.prototype={
    _setupParameters : function (parameters){
        this._parameters = this._parameters || {};
        this._angle = 0;
        this._parameters.animateTo = (typeof parameters.animateTo==="number") ? (parameters.animateTo) : (this._angle);

        this._parameters.easing = parameters.easing || this._parameters.easing || function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; }
        this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || function(){};
        if (parameters.bind && parameters.bind != this._parameters.bind) this._BindEvents(parameters.bind);
    },
    _handleRotation : function(parameters){
        this._setupParameters(parameters);
        if (this._angle==this._parameters.animateTo) {
            this._rotate(this._angle);
        }
        else {
            this._animateStart();
        }
    },

    _BindEvents:function(events){
        if (events && this._eventObj)
        {
            // Unbinding previous Events
            if (this._parameters.bind){
                var oldEvents = this._parameters.bind;
                for (var a in oldEvents) if (oldEvents.hasOwnProperty(a))
                // TODO: Remove jQuery dependency
                    jQuery(this._eventObj).unbind(a,oldEvents[a]);
            }

            this._parameters.bind = events;
            for (var a in events) if (events.hasOwnProperty(a))
            // TODO: Remove jQuery dependency
                jQuery(this._eventObj).bind(a,events[a]);
        }
    },

    _Loader:(function()
    {
        return function (parameters)
        {
            this._rootObj.setAttribute('id',this._img.getAttribute('id'));
            this._rootObj.className=this._img.className;

            this._width=this._img.width;
            this._height=this._img.height;

            var _widthMax=Math.sqrt((this._height)*(this._height) + (this._width) * (this._width));

            this._widthAdd = _widthMax - this._width;
            this._heightAdd = _widthMax - this._height;	// widthMax because maxWidth=maxHeight
            this._widthAddHalf=this._widthAdd/2; // used for optimisation
            this._heightAddHalf=this._heightAdd/2;// used for optimisation

            this._img.parentNode.removeChild(this._img);


            this._canvas=document.createElement('canvas');
            this._canvas.setAttribute('width',this._width);
            this._canvas.style.position="relative";
            this._canvas.style.left = -this._widthAddHalf + "px";
            this._canvas.style.top = -this._heightAddHalf + "px";
            this._canvas.Wilq32 = this._rootObj.Wilq32;

            this._rootObj.appendChild(this._canvas);
            this._rootObj.style.width=this._width+"px";
            this._rootObj.style.height=this._height+"px";
            this._eventObj = this._canvas;

            this._handleRotation(parameters);
        }
    })(),

    _animateStart:function()
    {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        this._animateStartTime = +new Date;
        this._animateStartAngle = this._angle;
        this._animate();
    },
    _animate:function()
    {
        var actualTime = +new Date;
        var checkEnd = false;
        if (this._parameters.duration > 0) {
            checkEnd = actualTime - this._animateStartTime > this._parameters.duration;
        }
        if (checkEnd)
        {
            clearTimeout(this._timer);
        } else {
            if (this._canvas||this._vimage||this._img) {
                var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
                this._rotate((~~(angle*10))/10);
            }
            var self = this;
            this._timer = setTimeout(function()
            {
                self._animate.call(self);
            }, 10);
        }

        // To fix Bug that prevents using recursive function in callback I moved this function to back
        if (this._parameters.callback && checkEnd){
            this._angle = this._parameters.animateTo;
            this._rotate(this._angle);
            this._parameters.callback.call(this._rootObj);
        }
    },

    _rotate : (function()
    {
        return function(angle){
            this._angle = angle;
            this._img.style['transform']="rotate("+(angle%360)+"deg)";
        };

    })()
};