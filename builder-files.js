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
	
	const file_set = builder_globals.file_data.file_sets[ builder_globals.file_data.selected ];
	
	const file_list = document.querySelector('#file-list');
	file_list.innerHTML = '';
	
	for (var i = 0; i < file_set.length; i++)
	{
		const div = create_file_div( file_set[i].name, i );
		file_list.append(div);
	}
	
	const sel_file = file_list.querySelector(`[data-file-index='${builder_globals.file_data.selectedFileIndex}']`);
}

function save_local_filesets()
{
	const file_data_str = JSON.stringify(builder_globals.file_data);
	localStorage.setItem('HEXFIELD-FILE-DATA', file_data_str);
}

function change_select(new_ind)
{
	const file_list = document.querySelector('#file-list');
}

function load_selected_code()
{
	const file_set = builder_globals.file_data.file_sets[ builder_globals.file_data.selected ];
	const file = file_set[ builder_globals.file_data.selectedFileIndex ];
	
	load_code( file.content );
}

function load_code(code)
{
	const parser = new DOMParser();
	const doc = parser.parseFromString(code, "text/html");
	
	
}

function load_element(el)
{
	const type = el.tagName.toLowerCase();
	const ne = document.querySelector(`[data-type='${type}']`).cloneNode(true);
	
	if (builder_globals.text_elements.includes(type))
	{
		const ta = ne.querySelector('textarea');
		ta.innerHTML = el.innerHTML;
	}
	else if (builder_globals.known_elements.includes(type))
	{
		for (const chel in el.children)
			ne.append(load_el(chel));
		
		if (el.children.length)
		{
			const botdz = document.createElement('div');
			botdz.setAttribute('class', 'dropzone');
			ne.append(botdz);
		}
	}
}

function create_new_file()
{
	const file_name = prompt('Enter a file name');
	
	if (file_name)
	{
		const sel_set = builder_globals.selected;
		const sel_ind = builder_globals.file_sets[ sel_set ].length;
		builder_globals.file_sets[ sel_set ].append(file_name);
		builder_globals.selectedFileIndex = sel_ind;
	
		
	}
}

function create_file_div(name, index)
{
	const templates = document.querySelector('#templates');
	
	const file_entry = templates.querySelector('.file-entry').cloneNode(true);
	file_entry.setAttribute('data-file-index', index);
	
	file_entry.querySelector('.file-name').innerHTML = name;
	
	return file_entry;
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