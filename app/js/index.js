//公有的变量
var ip_url = 'http://180.76.167.144/'; //服务器地址
var fs = require("fs");
var http = require("http");
var local_info; //本地数据保存的对象
var right_len; //3d查看库右侧内容显示的最后一个的下标
var li_obj_win; //正在查看的对象分类
var li_active_win; //正在查看的对象li的焦点
var gui = require('nw.gui');
var win = gui.Window.get();

//扩展事件 ***********数组删除事件
Array.prototype.indexOf = function(val) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == val) return i;
	}
	return -1;
};
Array.prototype.remove = function(val) {
	var index = this.indexOf(val);
	if(index > -1) {
		this.splice(index, 1);
	}
};
//对象数组删除事件
Array.prototype.objindexOf = function(val) {
	for(var i = 0; i < this.length; i++) {
		if(this[i].id == val) return i;
	}
	return -1;
};
Array.prototype.objremove = function(val) {
	var index = this.objindexOf(val);
	if(index > -1) {
		this.splice(index, 1);
	}
};
//读取本地的json存储
fs.readFile('dir/default.json', 'utf-8', function(err, data) {
	if(err) {
		console.log(err);
	} else {
		local_info = eval("(" + data + ")");
		console.log(local_info);
	}
});

//主要内容的载入***************************************************内容初始化*****************************************

$.ajax({
	type: 'get',
	url: ip_url,
	async: true,
	cache: false,
	success: function(data) {
		$("#iframe").html(data);
		setTimeout(function() {
			$('#loading').css('opacity', 0);
			setTimeout(function() {
				$('#loading').hide();
			}, 1000);
		}, 1000)

		//推出和最小化事件
		//缩小按钮事件
		$("#min").click(function() {
			win.minimize();
		});
		//关闭软件事件
		$("#close").click(function() {
			var layer_confirm = layer.confirm('请问您确定退出吗？', {
				btn: ['是', '否'] //按钮
			}, function() {
				win.close();
			}, function() {

			});
		});

		//************************素材库 页面********************加载初始数据放入
		$.ajax({
			type: "get",
			url: ip_url + "material_library/",
			async: true,
			cache: false,
			success: function(data) {
				var html = data;
				$("#sck-right .section1").html(data);
			},
			error: function(a, b, c) {
				console.log(a, b, c);
			}
		});

		sckcb();

		//***********************全部企业页面***************************加载初始数据放入
		$.ajax({
			type: "get",
			url: ip_url + "all_enterprise/",
			async: true,
			cache: false,
			success: function(data) {
				var html = data;
				$("#sck-right .section2").html(data);
			},
			error: function(a, b, c) {
				console.log(a, b, c);
			}
		});

		//***********************打印库页面***************************加载初始数据放入
		$.ajax({
			type: "get",
			url: ip_url + "print_library/",
			async: true,
			cache: false,
			success: function(data) {
				var html = data;
				$("#dyk-right .section1").html(data);
			},
			error: function(a, b, c) {
				console.log(a, b, c);
			}
		});

		dykcb();

		//************************3d查看库的js事件触发*******************************
		right_len = 0;
		three_look();
		three_right_bind(local_info.my_material_library.my_foot, ".material-foot");
		//让查看器显示第一个文件
		$("#iframe3d").attr('src', "stl.html?src=" + local_info.my_material_library.my_foot[0].file);
		//3d查看库右侧滚动事件
		$("#3d-right").scroll(function() {
			var height = $("#3d-right ul").height() - 530;
			var scrolltop = document.getElementById("3d-right").scrollTop;
			if(height === scrolltop) {
				three_right_bind(li_obj_win, li_active_win);
			}
		});
	},
	error: function() {
		//关闭软件事件
		$("#close").click(function() {
			var layer_confirm = layer.confirm('请问您确定退出吗？', {
				btn: ['是', '否'] //按钮
			}, function() {
				win.close();
			}, function() {

			});
		});
		setTimeout(function(){
			layer.confirm("连接服务器失败，是否再次连接？",{
				btn:["是","否"]
			},function(){
				window.location.reload();
			},function(){
				win.close();
			});
		},10000);
	}
});

//***************************************************************素材库更新分页的按钮事件************************************************
function update_page_btn(json, wrap, href) {
	update_list_btn(json, wrap, href);

	//给列表添加查看详情事件
	$(wrap + " .sck-group .col-xs-4 .content").on("click", function() {
		var src = $(this).attr("data-src");
		add_details_module('#sck-right .details', src, "my_material_library");
	});
	//给列表添加事件
	add_sck_fun(wrap, "my_material_library");

}

//*************************************************************素材库企业更新的事件***********************************************************************

function update_company_page(json, wrap, href) {
	update_list_btn(json, wrap, href);

	//给列表添加查看详情事件
	$(wrap + " .sck-group .col-xs-4 .content").on("click", function() {
		var src = $(this).attr("data-src");
		add_details_module('#sck-right .details', src);
	});

	//给列表增加 默认企业事件
	$(wrap + " .sck-group .col-xs-4 .span25 .download").on("click", function() {

	});

	//给列表增加查看事件
	$(wrap + " .sck-group .col-xs-4 .span25 .look").on("click", function() {

	});

	//给列表增加收藏事件
	$(wrap + " .sck-group .col-xs-4 .span25 .collect").on("click", function() {

	});

	//给列表增加 关注事件
	$(wrap + " .sck-group .col-xs-4 .span25 .report").on("click", function() {

	});
}

//**************************************************************更新列表按钮事件和添加总数****************************************************
function update_list_btn(json, wrap, href) {
	var html = ""; //申明一个存储代码的变量
	//更新总数
	var allTotal = json.allTotal;
	$(wrap + " .shu").text(allTotal);
	//上一页的代码
	if(!!json.prev.prevPage) {
		html += '<button type="button" class="btn btn-default" url="' + json.prev['firstPage.html'] + '">首页</button>';
		html += '<button type="button" class="btn btn-default" url="' + json.prev.prevPage + '"><span class="glyphicon glyphicon-chevron-left"></span></button>';
	}
	//中间的代码
	if(!!json.content) {
		var len = json.content.length;
		for(var i = 1; i < len; i++) {
			if(!json.content[i].src) {
				html += '<button type="button" class="btn btn-default active" url="' + json.content[i].src + '">' + json.content[i]._index + '</span></button>';
			} else {
				html += '<button type="button" class="btn btn-default" url="' + json.content[i].src + '">' + json.content[i]._index + '</span></button>';
			}
		}
	}
	//下一页的代码
	if(!!json.next.lastPage) {
		html += '<button type="button" class="btn btn-default" url="' + json.next.nextPage + '"><span class="glyphicon glyphicon-chevron-right"></span></button>';
		html += '<button type="button" class="btn btn-default" url="' + json.next.lastPage + '">末页</button>';
	}
	$(wrap + " .btn-group-wrap .btn-group").html(html);

	//给分页按钮加上事件
	$(wrap + " .btn-group-wrap .btn-group button").on("click", function() {
		var url = $(this).attr('url');
		if(url) {
			//请求新的页面
			$.ajax({
				type: "get",
				url: url,
				async: true,
				cache: false,
				success: function(data) {
					var html = data;
					$(wrap).html(data);
				},
				error: function(a, b, c) {
					console.log(a, b, c);
				}
			});
		}
	});

	//更新导航的背景样式
	var len = $(wrap + " .btn-wrap .btn-wrap-button button").length;
	for(var i = 0; i < len; i++) {
		var src = $(wrap + " .btn-wrap .btn-wrap-button button").eq(i).attr("data-url");
		if(src == href) {
			$(wrap + " .btn-wrap .btn-wrap-button button").eq(i).addClass("btn-success").removeClass("btn-default").siblings().addClass("btn-default").removeClass("btn-success");
		}
	}

	//给列表导航添加更新内容事件
	$(wrap + " .btn-wrap .btn-wrap-button button").on("click", function() {
		var url = $(this).attr("data-url");
		var script = '<script>var href_name = "' + url + '"</script>';
		if(url) {
			//请求新的页面
			$.ajax({
				type: "get",
				url: url,
				async: true,
				cache: false,
				success: function(data) {
					var html = script + data;
					$(wrap).html(html);
				},
				error: function(a, b, c) {
					console.log(a, b, c);
				}
			});
		}
	});
}

//*********************************************************************************素材库的左侧列表事件*********************************************

//关闭素材库内容显示页面
function close_details() {
	$(".details").hide();
}

//素材库左侧触发的事件
function sckcb() {
	//素材库页面切换事件
	function qihuan(item) {
		$("#sck-right > .section").hide();
		$("#sck-right " + item).fadeIn();
		close_details();
	}
	//全部素材
	$("#sck-left .all-material").click(function() {
		qihuan(".section1");
	});

	//全部企业切换
	$("#sck-left .all-enterprise").click(function() {
		qihuan(".section2");
	});

	//我的3d切换
	$("#sck-left .my-3d").click(function() {
		qihuan(".section3");
	});

	//我的足迹切换
	$("#sck-left .footprints").click(function() {
		qihuan(".section4");
		$("#sck-right .section4").Fenye({
			list_src: local_info.my_material_library.my_foot,
			library: "my_material_library"
		});
		//$("#sck-right .section4").Fenye("_update");
	});

	//我的收藏事件
	$("#sck-left .keep").click(function() {
		qihuan(".section5");
		$("#sck-right .section5").Fenye({
			list_src: local_info.my_material_library.my_collection,
			library: "my_material_library"
		});
		//$("#sck-right .section5").Fenye("_update");
	});

	//我关注的企业事件
	$("#sck-left .my-enterprise").click(function() {
		qihuan(".section6");
	});

	//注册账号事件
	$("#sck-left .registrations").click(function() {
		qihuan(".section7");
	});

	//更多素材事件
	$("#sck-left .more-material").click(function() {
		qihuan(".section8");
	});

	//我要上传事件
	$("#sck-left .my-upload").click(function() {
		qihuan(".section2");
	});

}

//*********************************************************************************打印库事件*********************************************************
function update_page_dyk(json, wrap, href) {
	update_list_btn(json, wrap, href);

	//给列表添加查看详情事件
	$(wrap + " .dyk-group .col-xs-4 .content").on("click", function() {
		var src = $(this).attr("data-src");
		add_details_module('#dyk-right .details', src, "my_print_library");
	});

	//添加打印库列表事件
	add_sck_fun(wrap, "my_print_library");

}

//查看详情处理接受数据并添加事件
function add_details_module(wrap,src,library){
	var text = `
		<nav class="navbar navbar-default">
			<div class="container-fluid">
				<div class="navbar-header">
					<a class="navbar-brand pagetitle" href="#">
						加载中...
					</a>
				</div>
				<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
					<form class="navbar-form navbar-right" role="search">
						<button type="button" class="btn btn-default back">
									返回
									</button>
					</form>
				</div>
			</div>
		</nav>
		<div class="xiangqing container-fluid">
			<p class="text-center">正在加载中....</p>
		</div>
	`;
	$(wrap).html(text).fadeIn();
	//添加关闭事件
	$(wrap).find('.back').click(function() {
		$(wrap).fadeOut();
	});
	//给列表添加查看详情事件
	$.ajax({
		type: "get",
		url: src,
		async: true,
		cache: false,
		success: function(data_strings) {
			let data = eval("("+ data_strings +")");
			var html;
			$(wrap).find(".pagetitle").text(data.pagetitle);
			if(library){
				html=`
					<div class="row">
						<div class="col-xs-7">
							<img src="${data.image}" width="100%" id="neirong-pic" />
						</div>
						<div class="col-xs-5">
							<div class="row">
								<div class="col-xs-4">
									品牌：
								</div>
								<div class="col-xs-8 pp">
									&nbsp;${data.brand}
								</div>
								<div class="col-xs-4">
									型号：
								</div>
								<div class="col-xs-8 xh">
									&nbsp;${data.model}
								</div>
								<div class="col-xs-4">
									材质：
								</div>
								<div class="col-xs-8 cz">
									&nbsp;${data.material}
								</div>
								<div class="col-xs-4">
									规格：
								</div>
								<div class="col-xs-8 gg">
									&nbsp;${data.specifications}
								</div>
								<div class="col-xs-4">
									上传时间：
								</div>
								<div class="col-xs-8 scsj">
									&nbsp;${data.newstime}
								</div>
								<div class="chaozuo col-xs-9">
									<div class="span25 ">
										<a href="#" class="download" data-file="${data.file}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
											<span class="glyphicon glyphicon-download"></span> 下载
										</a>
									</div>
									<div class="span25">
										<a href="#" class="look" data-file="${data.file}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
											<span class="glyphicon glyphicon-eye-open"></span> 查看
										</a>
									</div>
									<div class="span25">
										<a href="#" class="collect" data-id="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
											<span class="glyphicon glyphicon-star"></span> 收藏
										</a>
									</div>
									<div class="span25">
										<a href="#" class="report" data-id="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
											<span class="glyphicon glyphicon-warning-sign"></span> 举报
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-xs-12">
							<p>
								产品介绍：
								<div class="cpjs">
									&nbsp;${data.newstext}
								</div>
							</p>
						</div>
					</div>
				`;
			}else{
				html=`
					<div class="row">
						<div class="col-xs-7">
							<img src="${data.image}" width="100%" id="neirong-pic" />
							<div class="fbtn">
								<div class="span25">
								<a href="#" class="download" data-file="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
										<span class="glyphicon glyphicon-registration-mark"></span> 默认
									</a>
								</div>
								<div class="span25">
									<a href="#" class="look" data-file="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
										<span class="glyphicon glyphicon-eye-open"></span> 查看
									</a>
								</div>
								<div class="span25">
									<a href="#" class="collect" data-id="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
										<span class="glyphicon glyphicon-star"></span> 收藏
									</a>
								</div>
								<div class="span25">
									<a href="#" class="report" data-id="${data.id}" data-obj="{id:'${data.id}',file:'${data.file}',list_pic:'${data.titlepic}',name:'${data.title}'}">
										<span class="glyphicon glyphicon-heart"></span> 关注
									</a>
								</div>
							</div>
						</div>
						<div class="col-xs-5">
							<div class="company">
								<h2>企业名称：${data.pagetitle}</h2>
								<button type="button" class="btn btn-lg btn-primary">设为首页</button>
								<button type="button" class="btn btn-lg btn-primary">公司产品</button>
								<button type="button" class="btn btn-lg btn-primary">收藏企业</button>
							</div>
						</div>
					</div>
					<div class="row">
						<div class="col-xs-12">
							<p>
								产品介绍：
								<div class="cpjs">
									&nbsp;${data.newstext}
								</div>
							</p>
						</div>
					</div>
				`;
			}
			$(wrap).find(".xiangqing").html(html);
			//添加打印库列表事件
			if(library)add_sck_fun(wrap, library);
		}
	});	
}

//打印库左侧触发的事件
function dykcb() {
	//素材库页面切换事件
	function qihuan(item) {
		$("#dyk-right > .section").hide();
		$("#dyk-right " + item).fadeIn();
		close_details();
	}
	//全部素材
	$("#dyk-left .all-material").click(function() {
		qihuan(".section1");
	});

	//我的3d切换
	$("#dyk-left .my-3d").click(function() {
		qihuan(".section2");
	});

	//我的足迹切换
	$("#dyk-left .footprints").click(function() {
		qihuan(".section3");
		$("#dyk-right .section3").Fenye({
			list_src: local_info.my_print_library.my_foot,
			library: "my_print_library"
		});
		//$("#dyk-right .section3").Fenye("_update");
	});

	//我的收藏事件
	$("#dyk-left .keep").click(function() {
		qihuan(".section4");
		$("#dyk-right .section4").Fenye({
			list_src: local_info.my_print_library.my_collection,
			library: "my_print_library"
		});
		//$("#dyk-right .section4").Fenye("_update");
	});

	//我关注的企业事件
	$("#dyk-left .my-enterprise").click(function() {
		qihuan(".section5");
	});

	//注册账号事件
	$("#dyk-left .registrations").click(function() {
		qihuan(".section6");
	});

	//更多素材事件
	$("#dyk-left .more-material").click(function() {
		qihuan(".section7");
	});

	//我要上传事件
	$("#dyk-left .my-upload").click(function() {
		qihuan(".section8");
	});

}

/***************************************************列表所用到的方法*******************************************************/

//给每个内容的四个选项添加上事件
function add_sck_fun(wrap, library) {
	//查看是否已下载
	$(wrap).find(" .span25 .download").each(function() {
		var obj = eval("(" + $(this).attr("data-obj") + ")");
		var id = local_info[library].my_load.objindexOf(obj.id);
		if(id != -1) {
			$(this).addClass("disabled").html('<span class="glyphicon glyphicon-download"></span><span style="color:red"> 已下载</span>');
		}
	});
	//给列表增加下载事件
	$(wrap).find(" .span25 ").delegate(".download", "click", function() {
		var obj = local_info[library].my_load;
		var val = eval("(" + $(this).attr("data-obj") + ")");
		var me = this;
		if($(this).hasClass("disabled")) {
			return false;
		} else {
			layer.confirm("您确定下载吗?", {
				btn: ["确定", "取消"]
			}, function() {
				layer.msg("正在拼尽全力下载...");
				//创建文件夹
				var time = Date.parse(new Date())
				var dirname = "dir/" + time;
				fs.mkdir(dirname, function(err) {
					if(err) {
						layer.msg("文件夹创建失败");
						return false;
					}
					console.log("已创建文件夹");
					fs.exists(dirname, function(exists) {
						if(exists) {
							//判断文件是否存在
							http.get(val.file, function(res) {
								var responseText = [];
								var size = 0;
								res.on('data', function(data) {
									responseText.push(data);
									size += data.length;
									console.log(size);
								});
								res.on('end', function() {
									// 将抓取的内容保存到本地文件中
									responseText = Buffer.concat(responseText, size);
									//将缓存的文件写入文件夹内
									fs.writeFile(dirname + '/' + time + '.stl', responseText, function(err) {
										if(err) {
											layer.msg('出现错误!', err);
											return false;
										}
										console.log('已输出至stl中');
										//如果全部下载成功，则弹出成功提示
										$(me).addClass("disabled").html('<span class="glyphicon glyphicon-download"></span><span style="color:red"> 已下载</span>');
										val.file = dirname + '/' + time + '.stl';
										obj.objremove(val.id);
										obj.unshift(val);
										save_local_info();
									})
								})
							}).on('error', function(err) {
								console.log('错误信息：' + err);
								return false;
							});
						} else {
							return false;
						}
					});
				});
			}, function() {
				return false;
			})
		}
	});

	//给列表增加查看事件
	$(wrap).find(" .span25 ").delegate(".look", "click", function() {
		var file = $(this).attr('data-file');
		$("#iframe3d").attr('src', "stl.html?src=" + file);
		$("#iframe > .section").hide();
		$("#iframe > .section").eq(1).fadeIn();
		//将信息添加到本地
		var obj = local_info[library].my_foot;
		//var val = {"id":25,"file":"","list_pic":""};
		var val = eval("(" + $(this).attr("data-obj") + ")");
		obj.objremove(val.id);
		obj.unshift(val);
		save_local_info();

		//3d-查看器的更新事件
		right_len = 0;
		if(library === "my_material_library") {
			three_right_bind(obj, ".material-foot");
		} else if(library === "my_print_library") {
			three_right_bind(obj, ".print-foot");
		}

	});

	//查看是否已收藏
	$(wrap).find(" .span25 .collect").each(function() {
		var obj = eval("(" + $(this).attr("data-obj") + ")");
		var id = local_info[library].my_collection.objindexOf(obj.id);
		if(id != -1) {
			$(this).addClass("disabled").html('<span class="glyphicon glyphicon-star"></span><span style="color:red"> 已收藏</span>');
		}
	});

	//给列表增加收藏事件
	$(wrap).find(" .span25 ").delegate(".collect", "click", function() {
		//获取所在的页面和当前li的对象
		var obj = local_info[library].my_collection;
		var val = eval("(" + $(this).attr("data-obj") + ")");
		if($(this).hasClass("disabled")) {
			var me = this;
			layer.confirm('您确定取消收藏吗？', {
				btn: ['确定', '取消'] //按钮
			}, function() {
				//改变状态
				$(me).removeClass("disabled").html('<span class="glyphicon glyphicon-star"></span> 收藏');
				//在列表内删除本地信息
				obj.objremove(val.id);
				save_local_info();
				layer.msg('已取消收藏');
			}, function() {

			});
		} else {
			//添加已收藏状态
			$(this).addClass("disabled").html('<span class="glyphicon glyphicon-star"></span><span style="color:red"> 已收藏</span>');
			//添加本地信息
			obj.objremove(val.id);
			obj.unshift(val);
			save_local_info();
		}
	});

	//给列表增加举报事件
	$(wrap).find(" .span25 ").on(".report", "click", function() {

	});
}

//保存本地数据的方法
function save_local_info() {
	var str = JSON.stringify(local_info);
	fs.writeFile("dir/default.json", str, function(err) {
		if(err) {
			console.log("保存本地失败");
		}
		console.log("保存本地成功");
	});
}

/**********************************************3d查看库所需要的js******************************************************/

function three_look() {
	//3d查看库所需的变量
	var li_active; //获取焦点的变量
	var li_obj; //选中的查看的列表的存储变量

	//我的足迹和我的收藏事件
	$("#3d-left .list").click(function() {
		//判断是点击的哪一个li标签 获取数据列表
		if($(this).hasClass("material-foot")) {
			li_obj = local_info.my_material_library.my_foot;
			li_active = ".material-foot";
		} else if($(this).hasClass("material-collection")) {
			li_obj = local_info.my_material_library.my_collection;
			li_active = ".material-collection";
		} else if($(this).hasClass("material-load")) {
			li_obj = local_info.my_material_library.my_load;
			li_active = ".material-load";
		} else if($(this).hasClass("print-foot")) {
			li_obj = local_info.my_print_library.my_foot;
			li_active = ".print-foot";
		} else if($(this).hasClass("print-collection")) {
			li_obj = local_info.my_print_library.my_collection;
			li_active = ".print-collection";
		} else if($(this).hasClass("print-load")) {
			li_obj = local_info.my_print_library.my_load;
			li_active = ".print-load";
		}
		right_len = 0;
		//处理更新3d查看库
		three_right_bind(li_obj, li_active);
	});

	//添加滚动底部加载额外信息事件
}

//给信息绑定事件
function three_right_bind(li_obj, li_active) {
	li_active_win = li_active;
	li_obj_win = li_obj;
	if(right_len === 0) {
		var append_html = true;
	} else {
		var append_html = false;
	}
	//处理左侧active事件
	if(li_active) {
		$("#3d-left .list").removeClass("active");
		$("#3d-left " + li_active).addClass("active");
	}
	//console.log("#3d-left "+li_active);
	//将十个信息放入列表
	var len = li_obj.length;
	console.log(len, right_len);
	var html = "";
	if(len == 1 && len != right_len) {
		i = 0;
		right_len = 1;
	} else if(len == right_len) {

	} else {
		if(len - 1 > right_len + 10) {
			var i = right_len;
			right_len += 10;
		} else {
			var i = right_len;
			right_len = len;
		}
	}
	//判断是否到底部了
	/*if(i === right_len && i != 0 ){
		layer.alert("亲，已经到最后了~~~~");
		return false;
	}*/
	for(i; i < right_len; i++) {
		var file = li_obj[i].file;
		var img = li_obj[i].list_pic;
		var name = li_obj[i].name;
		html += '<li>\
                <a href="#" class="" data-file="' + file + '">\
                <img src="' + img + '">\
                <span>' + name + '</span>\
                </a>\
                </li>';
	}
	//console.log(html);
	//判断是否清除之前的数据
	if(append_html) {
		$("#3d-right ul").html(html);
		$("#3d-right").animate({
			scrollTop: 0
		}, 50);
	} else {
		$("#3d-right ul").append(html);
	}
	//重新绑定事件
	$("#3d-right ul li a").off("click");
	$("#3d-right ul li a").click(function() {
		var file = $(this).attr("data-file");
		$("#iframe3d").attr('src', "stl.html?src=" + file);
	});
}