/*
const builder_globals =
	{
		dragged: null,
		file_sets: {
			'default': ['index']
		},
		selected: 'default',
		selectedFileIndex: 0,
	};
*/

function load_local_filesets()
{
	const file_data_str = localStorage.getItem('HEXFIELD-FILE-DATA');
	const file_data = JSON.parse(file_data_str);
	
	builder_globals.file_data = file_data;
	
	const file_set = builder_globals.cur_set;
	
	const file_list = document.querySelector('#file-list');
	file_list.innerHTML = '';
	
	for (var i = 0; i < file_set.length; i++)
	{
		create_file_div( file_set[i].name, i );
	}
	
	const sel_file = file_list.querySelector(`[data-file-index='${builder_globals.file_data.selectedFileIndex}']`);
	sel_file.style.backgroundColor = "lightblue";
	load_selected_code();
}

function create_file_div(name, index)
{
	const templates = document.querySelector('#templates');
	
	const file_entry = templates.querySelector('.file-entry').cloneNode(true);
	file_entry.setAttribute('data-file-index', index);
	
	file_entry.querySelector('.file-name').innerHTML = name;
	
	const file_list = document.querySelector('#file-list');
	file_list.append(file_entry);
}

function save_local_filesets()
{
	const file_data_str = JSON.stringify(builder_globals.file_data);
	localStorage.setItem('HEXFIELD-FILE-DATA', file_data_str);
}

function change_select(new_ind)
{
	const file_list = document.querySelector('#file-list');
	
	const cur_ind = builder_globals.file_data.selectedFileIndex;
	
	const cur_file = file_list.querySelector(`[data-file-index='${cur_ind}']`);
	cur_file.style.backgroundColor = undefined;
	
	builder_globals.file_data.selectedFileIndex = new_ind;
	
	const new_file = file_list.querySelector(`[data-file-index='${new_ind}']`);
	new_file.style.backgroundColor = "lightblue";
	
	load_selected_code();
}

function load_selected_code()
{
	const file = builder_globals.cur_file;
	
	load_code( file.content );
}

function replace_all(text, search, replace)
{
	return text.split(search).join(replace);
}

function load_code(code_str)
{
	const div = document.createElement('div');
	code_str = replace_all(code_str, 'html', 'html-tag');
	code_str = replace_all(code_str, 'head', 'head-tag');
	code_str = replace_all(code_str, 'body', 'body-tag');
	
	div.innerHTML = code_str;
	
	const code = document.querySelector('#code');
	code.innerHTML = '';
	
	// better to use a template with a dropzone?
	const botdz = document.createElement('div');
	botdz.setAttribute('class', 'dropzone');
	code.append(botdz);
	
	// TODO get/add doctype
	
	for (const el of div.children)
	{
		code.append(load_element(el));
		
		const botdz = document.createElement('div');
		botdz.setAttribute('class', 'dropzone');
		code.append(botdz);
	}
	
	dropify(code);
}

function load_element(el)
{
	var type = el.tagName.toLowerCase();
	var ne;
	
	if (type == 'html-tag') type = 'html';
	if (type == 'head-tag') type = 'head';
	if (type == 'body-tag') type = 'body';
	
	if (builder_globals.text_elements.includes(type))
	{
		ne = document.querySelector(`[data-type='${type}']`).cloneNode(true);
		const ta = ne.querySelector('textarea');
		ta.innerHTML = el.innerHTML;
	}
	else if (builder_globals.known_elements.includes(type))
	{
		ne = document.querySelector(`[data-type='${type}']`).cloneNode(true);
	
		for (const chel of el.children)
		{
			ne.append(load_element(chel));
			
			const botdz = document.createElement('div');
			botdz.setAttribute('class', 'dropzone');
			ne.append(botdz);
		}
	}
	// TODO else use custom...
	
	return ne;
}

function create_new_file()
{
	const name = prompt('Enter a file name');
	
	if (name)
	{
		const sel_ind = builder_globals.cur_set.length;
		builder_globals.cur_set.push({name, content: ''});
		
		create_file_div(name, sel_ind);
		change_select(sel_ind);
	}
}

/*

<div class="file-entry">
<span class="file-name">index</span>
</div>
<button class="file-remove-btn">X</button>
</div>


<div id="file-bank">
<div id="file-list"></div>
<div id="file-controls">
<button id="new-file-btn"></button>
<button id="upload-file-btn"></button>
</div>
</div>
*/