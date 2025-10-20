/*
This file should be loaded before the other builder files,
so it can create the builder_globals object.
It's not necessary to import it, because it's automatically
attached to the window object.
*/

export const builder_globals =
	{
		
		text_elements: ['title', 'style', 'script', 'option', ],
		known_elements: ['!DOCTYPE html', 'html', 'head', 'body', 'link', 'body', 'h1', 'div', 'span', 'img', 'p', 'nav', 'form', 'input', 'option', 'br', 'a', ],
		known_attributes: ['src', 'href', 'width', 'style', ],
		known_properties: ['font-size', ],
		empty_elements: ['!DOCTYPE', 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', ],
		dragged: null,
	};

window.builder_globals = builder_globals;

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
