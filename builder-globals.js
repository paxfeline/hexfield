const builder_globals =
	{
		text_elements: ['title', 'style', 'script', ],
		known_elements: ['!DOCTYPE html', 'html', 'head', 'body', 'link', 'body', 'h1', 'div', 'span', 'img', 'p', 'nav', ],
		empty_elements: ['!DOCTYPE', 'link', 'img', '[custom-empty]'],
		dragged: null,
		file_data:
		{
			file_sets: {
				'default': [{name: 'index', content: ''}]
			},
			selectedSet: 'default',
			selectedFileIndex: 0,
		},
		get cur_set()
		{
			return this.file_data.file_sets[ this.file_data.selectedSet ]
		},
		get cur_file()
		{
			return this.cur_set[ this.file_data.selectedFileIndex ]
		}
	};

