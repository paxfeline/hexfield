/*
The empty elements in HTML are as follows:

    <area>
    <base>
    <br>
    <col>
    <embed>
    <hr>
    <img>
    <input>
    <keygen>(HTML 5.2 Draft removed)
    <link>
    <meta>
    <param>
    <source>
    <track>
    <wbr>
*/


export const builder_globals =
	{
		
		text_elements: ['title', 'style', 'script', 'option', ],
		known_elements: ['!DOCTYPE html', 'html', 'head', 'body', 'link', 'body', 'h1', 'div', 'span', 'img', 'p', 'nav', 'form', 'input', 'option', 'br', 'a', ],
		known_attributes: ['src', 'href', 'width', 'style', ],
		known_properties: ['font-size', ],
		empty_elements: ['!DOCTYPE', 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', ],
		dragged: null,
		file_data:
		{
			file_sets: {
				'default': [{name: 'index.html', content: ''}], // {name, content, url}
			},
			media_sets: {
				'default': [], // {name, url}
			},
			selectedSet: 'default',
			selectedFileIndex: 0,
		},
		get cur_set()
		{
			return this.file_data.file_sets[ this.file_data.selectedSet ]
		},
		get cur_media()
		{
			return this.file_data.media_sets[ this.file_data.selectedSet ]
		},
		get cur_file()
		{
			return this.cur_set[ this.file_data.selectedFileIndex ]
		}
	};