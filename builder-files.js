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
	
	if (file_data_str)
	{
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
	cur_file.style.backgroundColor = null;
	
	builder_globals.file_data.selectedFileIndex = new_ind;
	
	const new_file = file_list.querySelector(`[data-file-index='${new_ind}']`);
	new_file.style.backgroundColor = "lightblue";
	
	load_selected_code();
	
	render();
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
	const re = /<(\/?)(!?[-_\w]+)(.*?)>/g;
	code_str = code_str.replaceAll(re,
		(match, p1, p2, p3) =>
		{
			if  (p1 == '/')
				return `</div>`;
			else
			{
				var tn;
				if (builder_globals.empty_elements.includes(p2))
					tn = 'br';
				else
					tn = 'div';
				return `<${tn} data-converting-type='${p2}'${p3}>`;
			}
		}); // "<$1div data-converting-type='$2'$3>");
		
	const div = document.createElement('div');
	
	/*
	code_str = replace_all(code_str, '!DOCTYPE html', 'doctype');
	code_str = replace_all(code_str, 'html', 'html-tag');
	code_str = replace_all(code_str, 'head', 'head-tag');
	code_str = replace_all(code_str, 'body', 'body-tag');
	*/
	
	div.innerHTML = code_str;
	
	const code = document.querySelector('#code');
	code.innerHTML = '';
	
	// better to use a template with a dropzone?
	const botdz = document.createElement('div');
	botdz.setAttribute('class', 'dropzone');
	code.append(botdz);
	
	// TODO get/add doctype
	
	for (const el of div.childNodes)
	{
		const loaded = load_element(el);
		
		if (loaded)
		{
			code.append(loaded);
		
			const botdz = document.createElement('div');
			botdz.setAttribute('class', 'dropzone');
			code.append(botdz);
		}
	}
	
	dropify(code);
}

function load_element(el)
{
	var type;
	if (el.getAttribute)
	{
		type = el.getAttribute('data-converting-type'); //.tagName.toLowerCase();
	}
	
	/*
	if (type == 'doctype') type = '!DOCTYPE html';
	if (type == 'html-tag') type = 'html';
	if (type == 'head-tag') type = 'head';
	if (type == 'body-tag') type = 'body';
	*/
	
	if (type == "!DOCTYPE") type = "!DOCTYPE html"; // I am sorry for this if statement :/
	
	// TODO change document to the bank div
	const templ = document.querySelector(`[data-type='${type}']`);
	var ne;
	
	if (el.nodeType == 3) // text node
	{
		// if empty text node, return null to skip
		const txt = el.textContent.trim();
		
		if ( !txt ) return null;
		
		// TODO change document to the bank div
		const txt_templ = document.querySelector(`[data-type='[text]']`);
		ne = txt_templ.cloneNode(true);
	
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		const ta = ne.querySelector('textarea');
		ta.innerHTML = txt;
		// this line is apparently necessary, even though it shouldn't be
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.text_elements.includes(type))
	{
		ne = templ.cloneNode(true);
		addAttributes(el, ne);
		
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		const ta = ne.querySelector('textarea');
		el.innerHTML = el.innerHTML.trim();
		ta.innerHTML = el.innerHTML;
		// this line might be necessary, even though it shouldn't be
		ta.value = ta.innerHTML;
	}
	else if (builder_globals.known_elements.includes(type))
	{
		ne = templ.cloneNode(true);
		addAttributes(el, ne);
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
	
		for (const chel of el.childNodes)
		{
			const loaded = load_element(chel);
		
			if (loaded)
			{
				ne.append(loaded);
			
				const botdz = document.createElement('div');
				botdz.setAttribute('class', 'dropzone');
				ne.append(botdz);
			}
		}
	}
	else if (el.nodeType == 1)
	{
		// TODO change document to the bank div
		var check_empty = builder_globals.empty_elements.includes(type);
		
		const custom_templ = document.querySelector(`[data-type="${check_empty ? '[custom-empty]' : '[custom]'}"]`);
		ne = custom_templ.cloneNode(true);
		addAttributes(el, ne);
		ne.setAttribute("ondragstart", "dragstart_move_handler(event)");
		
		ne.querySelector('.builder-custom-type').setAttribute('value', type);
		
		if (!check_empty)
		{
			for (const chel of el.childNodes)
			{
				const loaded = load_element(chel);
		
				if (loaded)
				{
					ne.append(loaded);
			
					const botdz = document.createElement('div');
					botdz.setAttribute('class', 'dropzone');
					ne.append(botdz);
				}
			}
		}
	}

	
	return ne;
}

function addAttributes(source, dest)
{
	console.log("aa", source);
	if (!dest.hasAttribute("data-no-attributes"))
	{
		const wrapper = document.createElement('details');
		dest.prepend(wrapper);
		//wrapper.setAttribute('class', 'wrapper');
	
		const summary = wrapper.appendChild(document.createElement("summary"))
		summary.innerHTML = "attributes";
	
		const listContainer = wrapper.appendChild(document.createElement('div'));
		listContainer.setAttribute('class', 'builder-attributes-container');
		
		for (var i = 0; i < source.attributes.length; i++)
		{
			const attr = source.attributes[i];
			
			if (attr.name == 'data-converting-type') continue;
			
			const newAttr = listContainer.appendChild(document.createElement('div'));
			
			newAttr.innerHTML += `<span class="builder-attr-pair">${attr.name}="${attr.value}"</span>`;
			newAttr.innerHTML += '<button onclick="rem_attr(event)">&nbsp;-&nbsp</button>';
			// TODO simply code from builder.js that this came from
		}
	
		const newName = wrapper.appendChild(document.createElement('input'));
		const newValue = wrapper.appendChild(document.createElement('input'));
		
		newName.setAttribute('class', 'builder-attr-name');
		newValue.setAttribute('class', 'builder-attr-value');
	
		const addBtn = wrapper.appendChild(document.createElement("button"));
		addBtn.setAttribute("class", "btn")
		addBtn.setAttribute('onclick', 'add_attr(event)')
		addBtn.innerHTML = "&nbsp;+&nbsp;";
	}
}

function create_new_file()
{
	var name = prompt('Enter a file name');
	
	if (name)
	{
		if (!(name.slice(-5) == '.html' || name.slice(-4) == '.htm'))
			name += '.html';
	
		const sel_ind = builder_globals.cur_set.length;
		builder_globals.cur_set.push({name, content: ''});
		
		create_file_div(name, sel_ind);
		change_select(sel_ind);
	}
}

function select_file(event)
{
	change_select( event.target.parentElement.getAttribute('data-file-index') );
}

function upload_file(event)
{
	const fileList = event.target.files;
	
	for (let i = 0; i < fileList.length; i++)
	{
		const file = fileList[i];
		const reader = new FileReader();
		reader.onload = function(evt)
		{
			//console.log(evt.target.result);
			
			const sel_ind = builder_globals.cur_set.length;
			builder_globals.cur_set.push({name: file.name, content: evt.target.result});
		
			create_file_div(file.name, sel_ind);
			
			if (i == fileList.length - 1)
				change_select(sel_ind);
		};
		reader.readAsText(file);
	}
}





/* AT STARTUP, LOAD LOCAL FILE SETS */

load_local_filesets();







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