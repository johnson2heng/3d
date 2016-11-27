(function($) {
	"use strict";
	
	let Fenye = (function() {
		//方法的构造函数  
		function Fenye(element, options) {
			this.settings = options;
			this.element = element;
			this.init();
		}
		//方法的原型方法  
		Fenye.prototype = {
			init: function() {
				var me = this;
				var src = this.settings.list_src;
				var len = this.settings.con_len;
				this._index = 1;
				this.element.html(`
                	<nav class="navbar navbar-default sck-list-top">
						<div class="container-fluid">
							<div class="navbar-header">
								<a class="navbar-brand" href="#">
									全部素材共 <span class="shu" style="color: green;"> ${src.length}&nbsp;</span> 款
								</a>
							</div>
							<div class="collapse navbar-collapse bs-example-navbar-collapse-1">
								<form class="navbar-form navbar-right" role="search">
									<div class="form-group">
										<input type="text" class="form-control" placeholder="">
									</div>
									<button type="button" class="btn btn-default">
									搜索
									</button>
								</form>
							</div>
						</div>
					</nav>
					<div class="btn-wrap">
						<div class="btn-wrap-button">
							<button type="button" class="btn btn-success btn-xs" data-url="">
							全部素材
							</button>
						</div>
					</div>
					<div class="container-fluid sck-group">
						<div class="row list-wrap">
							
						</div>
						<div class="btn-group-wrap">
							<div class="btn-group">
								
							</div>
						</div>
					</div>
				`);
				this._update();
			},
			/*更新内容列表*/
			update_con: function(index) {
				var src = this.settings.list_src;
				var len = this.settings.con_len;
				var stop;
				var start = (index - 1) * this.settings.con_len;
				if(this.settings.list_src.length >= this.settings.con_len * (index)) {
					stop = this.settings.con_len * index
				} else {
					stop = this.settings.list_src.length;
				};
				var html = "";
				for(let i = start; i < stop; i++) {
					html += `
            			<div class="col-xs-4">
							<a href="#" class="content" data-src="${src[i].url}">
								<img src="${src[i].list_pic}" />
								<span>${src[i].name}</span>
							</a>
							<div>
								<div class="span25">
									<a href="#" class="download" data-file="${src[i].file}" data-obj='${JSON.stringify(src[i])}'>
										<span class="glyphicon glyphicon-download"></span> 下载
									</a>
									</div>
									<div class="span25">
									<a href="#" class="look" data-file="${src[i].file}" data-obj='${JSON.stringify(src[i])}'>
										<span class="glyphicon glyphicon-eye-open"></span> 查看
									</a>
									</div>
									<div class="span25">
									<a href="#" class="collect" data-id="${src[i].id}" data-obj='${JSON.stringify(src[i])}'>
										<span class="glyphicon glyphicon-star"></span> 收藏
									</a>
									</div>
									<div class="span25">
									<a href="#" class="report" data-id="${src[i].id}" data-obj='${JSON.stringify(src[i])}'>
										<span class="glyphicon glyphicon-warning-sign"></span> 举报
									</a>
								</div>
							</div>
						</div>`;
				}
				this.element.find(".list-wrap").html(html);
				this.add_con(this.element, this.settings.library);
			},
			/*更新按钮列表*/
			update_btn: function(index) {
				var len = Math.ceil(this.settings.list_src.length / this.settings.con_len); //获取按钮个数
				var start, stop; //申明按钮开始的数字,和结束的位置
				if(index - Math.floor(this.settings.btn_len/2) <= 0) { //判断生成的下标的位置
					start = 0;
					if(len >= this.settings.btn_len) {
						stop = this.settings.btn_len;
					} else {
						stop = len;
					}
				} else if(index + Math.floor(this.settings.btn_len/2) >= len) {
					stop = len;
					if(len - this.settings.btn_len <= 0) {
						start = 0;
					} else {
						start = len - this.settings.btn_len;
					}
				} else {
					start = index - Math.ceil(this.settings.btn_len/2);
					stop = index + Math.floor(this.settings.btn_len/2);
				}
				var html = `
            		<button type="button" class="btn btn-default first" url="javascript:;">首页</span></button>
            		<button type="button" class="btn btn-default prev" url="javascript:;"><span class="glyphicon glyphicon-chevron-left"></span></button>
            	`;
				for(let i = start; i < stop; i++) {
					if(i == index - 1) {
						html += `<button type="button" class="btn btn-default num active" url="javascript:;">${i+1}</button>`;
					} else {
						html += `<button type="button" class="btn btn-default num" url="javascript:;">${i+1}</button>`;
					}
				}
				html += `
            		<button type="button" class="btn btn-default next" url="javascript:;"><span class="glyphicon glyphicon-chevron-right"></span></button>
            		<button type="button" class="btn btn-default last" url="javascript:;">末页</span></button>
            	`;

				this.element.find(".btn-group-wrap .btn-group").html(html);

				this.add_list();
			},
			/*为内容列表添加事件*/
			add_con: function(wrap, library) {
				//给列表添加查看详情事件
				$(wrap).find(".sck-group .col-xs-4 .content").on("click", function() {
					var src = $(this).attr("data-src");
					add_details_module(wrap.parent().find(".details"), src, library);
				});
				//给列表添加事件
				add_sck_fun(wrap, library);
			},
			/*为按钮添加事件*/
			add_list: function() {
				var me = this;
				var list_wrap = $(this.element).find(this.settings.list_content); //获取页面切换按钮父盒子
				var active = list_wrap.find(".active").text(); //获取现在所在页面
				var len = Math.ceil(this.settings.list_src.length / this.settings.con_len); //获取按钮个数
				list_wrap.find(".first").click(function() {
					if(active == 1) {
						layer.msg("已经在首页了!");
						return;
					}
					me._index = 1;
					me._update();
				});
				list_wrap.find(".prev").click(function() {
					if(active - 1 < 1) {
						layer.msg("已经到最前面了!");
						return;
					} else {
						me._index = active - 1;
						me._update();
					}
				});
				list_wrap.find('.num').click(function() {
					me._index = parseInt($(this).text());
					me._update();
				});
				list_wrap.find('.next').click(function() {
					if(parseInt(active) + 1 > len) {
						layer.msg("已经是最后一页了!");
						return;
					}
					me._index = parseInt(active) + 1;
					me._update();
				});
				list_wrap.find(".last").click(function() {
					if(active == len) {
						layer.msg("已经在末页了!");
						return;
					}
					me._index = len;
					me._update();
				});
			},
			_update:function(){
				this.update_con(this._index);
				this.update_btn(this._index);
			}
		}
		return Fenye; //一定要return，要不然无法调用构造函数  
	})();

	$.fn.Fenye = function(options) {
		return this.each(function() {
			let me = $(this);
			let	instance = $(me).data("Fenye");
			let option = $.extend($.fn.Fenye.defaults, options || {});
			//判断是否实例化，如果没有，则创建实例  
			if(!instance) {
				me.data("Fenye", (instance = new Fenye(me, option)));
			}
			//new Fenye(me,options);
			//根据传入的数据类型，可以调用实例里面的方法  
			if($.type(options) === "string") return instance[options]();
		});
	};

	$.fn.Fenye.defaults = {
		//此处书写默认值  
		content: ".list-wrap", //列表内容显示区域
		con_len: 6, //列表内容每页显示个数
		btn_len: 7, //列表换页按钮生成个数
		list_content: ".btn-group-wrap .btn-group", //分页按钮区域
		list_src: "local_info", //获取列表的地方
		show_button: "", //触发更新内容的按钮
		library: "my_material_library", //列表属于素材库还是下载库
		ip:"http://180.76.167.144/"
	};
})(jQuery);