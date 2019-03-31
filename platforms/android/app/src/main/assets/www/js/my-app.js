var myApp = new Framework7( {input: {
    scrollIntoViewOnFocus: true,
    scrollIntoViewCentered: true,
}});
var connectionStatus = false;

if(window.localStorage.getItem('projects')){
	var projects = JSON.parse(window.localStorage.getItem('projects'));
}else{
	var projects = [];
}

var current_project;
var current_keyword;
var key = 0;
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

$$(document).on('deviceready', function() {
		
		setInterval(function () {
			connectionStatus = navigator.onLine;
			if(!connectionStatus){
				myApp.popup('.popup-loading');
			}else{
				myApp.closeModal('.popup-loading');
			}
		}, 2000);
		getProjects();
});

$$(document).on('pageInit', function (e) {

    var page = e.detail.page;
	/* PROJECT */
	showMenus(page.name);
	if(page.name == 'index'){
		getProjects();		
	}
	if (page.name === 'add_project') {
		if(current_project){
			$$('.deleteProject').show();
			$$('.center.sliding').html("Edit Project");
			$$('[name="web_site"]').val(current_project.pr.project_name);
			$$('[name="search_engine"]').val(current_project.pr.google);
		}else{
			$$('button.deleteProject').hide();
		}
		$$('.saveProject').on('click', function (e) {
			var project_name = $$('[name="web_site"]').val();
			var google = $$('[name="search_engine"]').val();
			project_name = replacer(project_name);
			google = replacer(google);
			if(!project_name || (project_name.indexOf(".") == -1)){
				$$('[name="web_site"]').addClass('red_border');
				
				$$('[name="web_site"]').parent().find('.item-input-info').append('<span class="color_red">Please fill the correct web site</span>');
				setTimeout(function(){ $$('.red_border').removeClass('red_border'); $$('.color_red').hide(1000,function(){$$(this).remove()}) }, 3000);
				return false;
			}	
			if(!google || (google.indexOf(".") == -1)){
				$$('[name="search_engine"]').addClass('red_border');
				
				$$('[name="search_engine"]').parent().find('.item-input-info').append('<span class="color_red">Please fill the correct web site</span>');
				setTimeout(function(){ $$('.red_border').removeClass('red_border'); $$('.color_red').hide(1000,function(){$$(this).remove()}) }, 3000);
				return false;
			}
			if(current_project){
				projects[current_project.i]['project_name'] = project_name;
				projects[current_project.i]['google'] = google;
			}else{
				projects.push({
					'project_name': project_name,
					'google': google,
					'keywords':[]
				});
			}
				window.localStorage.setItem("projects", JSON.stringify(projects));				  
				window.location = 'index.html';				
		});
		
    }
	/* PROJECT */
	/* KEYWORDS */
		if(page.name === 'view_project'){
			getKeywords();
		}
		if (page.name === 'add_keywords') {
			myApp.closePanel();			
			if(!current_keyword){
				$$('.deleteKeyword').hide();	
				$$('.center.sliding').html('Add Keywords');
			}else{
				$$('.deleteKeyword').show();
				$$("[name='keywords']").val(current_keyword.name);
				$$('.center.sliding').html('Edit Keyword');
			}
			
		}
	/* KEYWORDS */
});

$$('.add_project').on('click', function (e) {
	current_project = '';
	myApp.closePanel();
});
$$(document).on('click', '.editProject', function (e) {
			current_project = {'i':$$(this).data('i'), 'pr' : projects[$$(this).data('i')]};
			mainView.router.loadPage('add_project.html');
});
$$(document).on('click', '.editKeyword', function (e) {
			current_keyword =  {'i':$$(this).data('i'), 'name' : current_project.pr['keywords'][$$(this).data('i')].name};
			mainView.router.loadPage('add_keywords.html');
});
$$(document).on('click', '.projects .label-cell', function(e){
			current_project = {'i':$$(this).data('i'), 'pr' : projects[$$(this).data('i')]};
			mainView.router.loadPage('view_project.html');
});
$$(document).on('click', '.deleteProject', function(){
			projects.splice(current_project.i, 1);
			window.localStorage.setItem("projects", JSON.stringify(projects));
			window.location = 'index.html';
});
$$(document).on('click', '.deleteKeyword', function(){
			projects[current_project.i]['keywords'].splice(current_keyword.i, 1);
			window.localStorage.setItem("projects", JSON.stringify(projects));
			mainView.router.loadPage('view_project.html');
});
$$(document).on('click', '.add_keywords',function(){
	current_keyword = '';
});
$$(document).on('click', '.refresh_rankings',function(){
	myApp.closePanel();
	$('.forKwsloading').show();
	refresh_rankings(0);
});
$$(document).on('click', '.saveKeyword', function (e) {
				if(!current_keyword){
					var keywords = $$('[name="keywords"]').val().split("\n");
					keywords.forEach(function(name,i){
						if(name){
							var my_obj = {'name' : name, 'ranking':-1};
							current_project.pr['keywords'].push(my_obj);
						}					
					});
				}else{
					projects[current_project.i]['keywords'][current_keyword.i].name = $$('[name="keywords"]').val();
				}
				window.localStorage.setItem("projects", JSON.stringify(projects));
				mainView.router.loadPage('view_project.html');
});

function showMenus(name){
	if(name == 'view_project'){
		$$('.center.sliding').html(current_project.pr.project_name);
			$$('.add_project').hide();
			$$('.showForKeywords').show();
	}else{
		$$('.add_project').show();
		$$('.showForKeywords').hide();
	}
}
function getProjects(){
	 $$('table.projects tbody').html('');
	projects.forEach(function(project, i){
			favicon = getFavicon("http://"+project.project_name);
			 $$('table.projects tbody').append($$("<tr><td class='label-cell' data-i='"+i+"'><img src='"+favicon+"' class='favicon' /> "+project.project_name+" <i class='fas fa-chevron-right'></i></td><td class='tablet-only'><a class='col button button-fill color-blue editProject' data-i='"+i+"'>Edit</a></td></tr>"));
		 });
}

function getKeywords(){
	 $$('table.keywords tbody').html('');
	current_project.pr['keywords'].forEach(function(obj, i){
			var ranking = obj.ranking;
			if(ranking <0)ranking = 'Unchecked';
			 $$('table.keywords tbody').append($$("<tr><td class='label-cell' data-i='"+i+"'>"+obj.name+"</td><td>"+ ranking+"</td><td class='tablet-only'><a class='col button button-fill color-blue editKeyword' data-i='"+i+"'>Edit</a></td></tr>"));
		 });
	$$('.kwLength').html($$('table.keywords tbody tr').length);
}

function refresh_rankings(i){
	console.log(current_project.pr['keywords'][i].name);
		var length = current_project.pr['keywords'].length;
		var kw = encodeURI(current_project.pr['keywords'][i].name);
		var checking=-1;
		checking_kw(kw,function(checking){
				current_project.pr['keywords'][i].ranking = checking;
				window.localStorage.setItem("projects", JSON.stringify(projects));		
				if(i<length-1){
					return refresh_rankings(i+1);
				}
		});
	getKeywords();
	if(i == length-1){
		$('.forKwsloading').hide();
	}
}

function checking_kw(kw,callback){
	var stop = 0;
	var url = 'https://www.google.ge/search?q='+kw+'&start='+key;
			const options = {
			  method: 'GET' 
			};
			 cordova.plugin.http.sendRequest(url, options, function(response) {
				 var test = $("<div class='test' style='display:none'></div>");
				 test.html(response.data);				
					test.find('.g').each(function(){
					if($(this).find('a').attr('href').indexOf(current_project.pr.project_name) > -1){
						stop = 1;
						return callback(key-1);
					}
					key++;
				});	
				if(key > 50){
					stop=1;
					return callback(0);
				}
				if(!stop)
					checking_kw(kw,callback);
			}, function(response) {
				
			});			
}

function replacer(st){
			st = st.replace(':','');
			st = st.replace(';','');
			st = st.replace('/','');
			st = st.replace('/','');
			st = st.replace('http','');
			st = st.replace('https','');
			return st;
}

function getFavicon(link){ 
    return "https://www.google.com/s2/favicons?domain="+link;        
}