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

export function load_local_filesets()
{
	const file_data_str = localStorage.getItem('HEXFIELD-FILE-DATA');
	
	if (file_data_str)
	{
		const file_data = JSON.parse(file_data_str);
	
		builder_globals.file_data = file_data;
		
		// html files
		const cur_file_set = builder_globals.cur_set;
	
		const file_list = document.querySelector('#file-list');
		file_list.innerHTML = '';
	
		for (var i = 0; i < cur_file_set.length; i++)
		{
			
			create_file_div( cur_file_set[i].name, i );
		}
		
		// create object URL for all files in all sets
		for (const file_set of Object.values(file_data.file_sets))
		{
			for (var i = 0; i < file_set.length; i++)
			{
				const file = file_set[i];
				file.url = URL.createObjectURL(new Blob([file.content], {type: 'text/html'}));
			}
		}
	
		const sel_file = file_list.querySelector(`[data-file-index='${builder_globals.file_data.selectedFileIndex}']`);
		sel_file.style.backgroundColor = "lightblue";
		load_selected_code();
		
		// media
		const media_set = builder_globals.cur_media;
	
		const media_list = document.querySelector('#media-list');
		//media_list.innerHTML = '';
	
		for (var i = 0; i < media_set.length; i++)
		{
			create_media_div( media_set[i].name, i, media_set[i].url );
		}
		
		// render selected file
		render();
	}
}

export function create_file_div(name, index)
{
	const templates = document.querySelector('#templates');
	
	const file_entry = templates.querySelector('.file-entry').cloneNode(true);
	file_entry.setAttribute('data-file-index', index);
	
	file_entry.querySelector('.file-name').innerHTML = name;
	
	const file_list = document.querySelector('#file-list');
	file_list.append(file_entry);
}

export function save_local_filesets()
{
	const file_data_str = JSON.stringify(builder_globals.file_data);
	localStorage.setItem('HEXFIELD-FILE-DATA', file_data_str);
}

export function change_select(new_ind)
{
	const file_list = document.querySelector('#file-list');
	
	const cur_ind = builder_globals.file_data.selectedFileIndex;
	
	const cur_file = file_list.querySelector(`[data-file-index='${cur_ind}']`);
	cur_file.style.backgroundColor = null;
	
	builder_globals.file_data.selectedFileIndex = new_ind;
	
	const new_file = file_list.querySelector(`[data-file-index='${new_ind}']`);
	new_file.style.backgroundColor = "lightblue";
	
	load_selected_code();
	
	renderCode()
	render();
}

export function load_selected_code()
{
	const file = builder_globals.cur_file;
	
	load_code( file.content );
}

export function replace_all(text, search, replace)
{
	return text.split(search).join(replace);
}

export function load_code(code_str)
{
	//const re = /<(\/?)(!?[-_\w]+)((?:\s*\w+(?:=(["']\w))))>/g;
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

export function load_element(el)
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

export function addAttributes(source, dest)
{
	//console.log("aa", source);
	if (!dest.hasAttribute("data-no-attributes"))
	{
		/*
<div class="builder-attribute-set">
<div class="builder-attribute-container"></div>
<div class="builder-attribute-dropzone" ondragenter="onAttributeDragEnter(event)" ondragleave="onAttributeDragLeave(event)" ondrop="drop_attribute_handler(event)" ondragover="dragover_attribute_handler(event)"></div>
</div>
		*/
		
		
		const templates = document.querySelector('#templates');
	
		const wrapper = templates.querySelector('.builder-attribute-set').cloneNode(true);
		dest.prepend(wrapper);
		
		const listContainer = wrapper.firstElementChild; // simpler but more brittle than querySelector('.builder-attribute-container').cloneNode(true);
		
		for (var i = 0; i < source.attributes.length; i++)
		{
			const attr = source.attributes[i];
			
			if (attr.name == 'data-converting-type') continue;
			
			if (builder_globals.known_attributes.includes(attr.name))
			{
				// TODO change document to the bank div (or make templates)
				const new_attr = document.querySelector(`[data-attribute-name='${attr.name}']`).cloneNode(true);
				
				if (attr.name == 'style')
				{
					const prop_list = new_attr.querySelector('.builder-property-container');
					
					// /([\w-]+):\s*([^;]+);?/gm
					
					
					
					
					////////////
					
					const cssdiv = document.createElement('div');
					cssdiv.style.cssText = attr.value;
					
					/*const cssdoc = document.implementation.createHTMLDocument();
					cssdoc.body.append(cssdiv);*/
			
					console.log('r s', cssdiv.style);
					
					for (var css_i = 0; css_i < cssdiv.style.length; css_i++)
					{
						const name = cssdiv.style[css_i];
						const value = cssdiv.style.getPropertyValue(name);
						
						const templ_name = builder_globals.known_properties.includes(name) ? name : '[custom]';
						const new_prop = document.querySelector(`[data-property-name='${templ_name}']`).cloneNode(true);
						
						if (templ_name == '[custom]')
							new_prop.querySelector('.builder-property-name').value = name;
						
						new_prop.querySelector('.builder-property-value').value = value;
						
						prop_list.append(new_prop);
					}
				}
				else
					new_attr.querySelector('.builder-attr-value').value = attr.value;
				
				listContainer.append(new_attr);
			}
			else
			{
				const new_attr = document.querySelector(`[data-attribute-name='[custom]']`).cloneNode(true);
				new_attr.querySelector('.builder-attr-name').value = attr.name;
				new_attr.querySelector('.builder-attr-value').value = attr.value;
				
				listContainer.append(new_attr);
			}
		}
	}
}

export function create_new_file()
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

export function select_file(event)
{
	change_select( event.target.parentElement.getAttribute('data-file-index') );
}

export function upload_file(event)
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
	
	save_local_filesets()
}

export function create_media_div(name, index, url)
{
	const templates = document.querySelector('#templates');
	
	const file_entry = templates.querySelector('.media-entry').cloneNode(true);
	file_entry.setAttribute('data-media-index', index);
	
	file_entry.querySelector('.media-name').innerHTML = name;
	file_entry.querySelector('.media-preview').src = url;
	
	const file_list = document.querySelector('#media-list');
	file_list.append(file_entry);
}

export function upload_media(event)
{
	const fileList = event.target.files;
	
	for (let i = 0; i < fileList.length; i++)
	{
		const file = fileList[i];
		const reader = new FileReader();
		reader.onload = function(evt)
		{
			//console.log(evt.target.result);
			
			const sel_ind = builder_globals.cur_media.length;
			builder_globals.cur_media.push({name: file.name, url: evt.target.result});
		
			create_media_div(file.name, sel_ind, evt.target.result);
		};
		reader.readAsDataURL(file);
	}
	
	save_local_filesets()
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