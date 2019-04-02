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
	$$('.forKwsloading').show();
	processArray(current_project.pr['keywords']);
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

function delay() {
  return new Promise(resolve => setTimeout(resolve, 500));
}

async function delayedLog(item,i) {
  await delay();
  var key = 0;
  checking_kw(item.name,i,key, handling);
}

function handling(st,i,cod,kw){
	console.log(kw);
	console.log(st + ' '+cod);
	if(st == 'next'){
		checking_kw(kw,i, cod,handling);
	}
	if(st == 'detected' || st == 'not_found'){
		current_project.pr['keywords'][i].ranking = cod;
		window.localStorage.setItem("projects", JSON.stringify(projects));		
		getKeywords();
	}
	
	var length = current_project.pr['keywords'].length;	
	if(length-1 == i){
		$$('.forKwsloading').hide();
	}
}

async function processArray(array) {
  array.forEach(async (item,i) => {
    await delayedLog(item,i);
  });
}

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
	 var average = 0;
	 var my_length = 0;
	current_project.pr['keywords'].forEach(function(obj, i){
			var ranking = obj.ranking;
			if(ranking <0){
				ranking = 'Unchecked';
			}else{
				average += ranking;
				my_length +=1;
			}
			 $$('table.keywords tbody').append($$("<tr><td class='label-cell' data-i='"+i+"'>"+obj.name+"</td><td>"+ ranking+"</td><td class='tablet-only'><a class='col button button-fill color-blue editKeyword' data-i='"+i+"'>Edit</a></td></tr>"));
		 });
	$$('.kwLength').html($$('table.keywords tbody tr').length);
	$$('.averageRanking').html((average/my_length).toFixed(2));
}

function checking_kw(kw,i,key, handleData){
	var stop =0;
	var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyCTbadO5lqdtSr8p40CFmmnUE9HB3R731Y&cx=011335488892386467744:96umecgyezo&filter=0&q='+kw;
	if(key){
		url += '&start='+key;
	}
		$.ajax({
			  url: url,
			  success: function(response){
				  if (typeof response.items === 'undefined') {
					  return handleData('not_found',i, 0);
					}
				  var item_length = response.items.length;
				 
				  for(var rowi = 0; rowi<item_length; rowi++){
					if(response.items[rowi].displayLink.indexOf(current_project.pr.project_name.toLowerCase()) > -1){			return handleData('detected',i, key);
					}
					key++;
				}
				if(key > 50){
					return handleData('not_found',i, 0);
				}
					if(key==10)key +=1;
					return handleData('next',i, key, kw);
			},
			error:function(request){
				myApp.alert("Something went wrong. Please try again later");
				$$('.forKwsloading').hide();
				console.log('status :' +request.status);
			}
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