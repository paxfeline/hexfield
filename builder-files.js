/*
const builder_globals =
	{
		dragged: null,
		file_sets: {
			'default': ['index.html']
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
}

function create_new_file()
{
	const file_name = prompt('Enter a file name');
	
	if (file_name)
	{
		const sel_set = builder_globals.selected;
		const sel_ind = len( builder_globals.file_sets[ sel_set ] );
		builder_globals.file_sets[ sel_set ].append(file_name);
		builder_globals.selectedFileIndex = sel_ind;
	
		const 
	}
}

function create_file_div(name)
{
	const templates = document.querySelector('#templates');
	
	const file_entry = templates.querySelector('.file-entry').cloneNode(true);
	
	if (name)
	{
		file_entry.querySelector('.file-name').innerHTML = name;
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