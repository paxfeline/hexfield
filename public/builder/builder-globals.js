/*
This file should be loaded before the other builder files,
so it can create the builder_globals object.
It's not necessary to import it, because it's automatically
attached to the window object.
*/

export const builder_globals =
{
    
    text_elements: ['[text]', 'title', 'style', 'script', 'option', ],
    // should contain everything contained in others:
    known_elements: [
        '!doctype html', 'html', 'head', 'body', 'link',
        'body', 'h1', 'div', 'span', 'img',
        'p', 'nav', 'form', 'input', 'option',
        'a', 'area', 'base', 'br', 'col',
        'embed', 'hr', 'img', 'input', 'keygen',
        'link', 'meta', 'param', 'source', 'track',
        'wbr', 'label',  ],
    known_attributes: [
        'src', 'href', 'width', 'style', 'for', 'type',
        'id', 'class', 'target', 'lang',  ],
    known_properties: ['font-size', ],
    empty_elements: ['[custom-empty]', '[text]', '!doctype', '!doctype html', 'area',
        'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr', ],
    no_attributes: ['!doctype html', '[text]'],
    dragged: null,
    handlers: {}, // filled in by other .js files
    factories: {}, // ibid.
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
