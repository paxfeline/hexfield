// TODO: undo module-ness?

export function dragstart_handler(ev)
{
	console.log("dsh");
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("application/hexfield-element", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "copy";
	builder_globals.dragged = null;
	
	ev.stopPropagation();
}

builder_globals.handlers.dragstart = dragstart_handler;

 // TODO: in this handler, set the value attribute explicitly so that it's copied
export function dragstart_move_handler(ev)
{
	console.log("dsmh");
	// add any text area values to their elements as attributes
	const tas = ev.target.querySelectorAll("textarea");
	tas.forEach(ta => ta.innerHTML = ta.value);
	
	// for custom elements, copy input too
	const inp = ev.target.querySelector("input.builder-custom-type");
	if (inp)
		inp.setAttribute('value', inp.value);
	
	console.log('start', ev.target, tas);
	//ev.target.firstElementChild.innerHTML = ev.target.firstElementChild.value;
	ev.dataTransfer.setData("application/hexfield-element", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "move";
	builder_globals.dragged = ev.target;
	
	ev.stopPropagation();
}

builder_globals.handlers.dragstartmove = dragstart_move_handler;

export function drop_handler(ev)
{
 if (!drop_ok(ev)) return;

 ev.preventDefault();
 // Get the id of the target and add the moved element to the target's DOM
 const data = ev.dataTransfer.getData("application/hexfield-element");
 const rent = ev.target.parentElement;
 //ev.target.style.backgroundColor = '';
 const temp = document.createElement("div");


	 temp.innerHTML = data;
	 temp.firstElementChild.setAttribute("ondragstart", "dragstart_move_handler(event)");

	//if ( !builder_globals.dragged && !temp.firstElementChild.hasAttribute("data-no-attributes") ) 
	if ( !builder_globals.dragged && !builder_globals.no_attributes.includes(temp.firstElementChild.dataset.type) )
	{
		//const templates = document.querySelector('#templates');
		//const attribute_set = templates.querySelector('.builder-attribute-set').cloneNode(true);
		
		//temp.firstElementChild.prepend(attribute_set);
	}
 
	 const dz = document.createElement('div');
	 dz.setAttribute('class', 'dropzone');
 
	 //--//ev.target.parentElement.style.borderColor = '';
	 //ev.target.parentElement.style.removeProperty('--set-color');
	ev.target.parentElement.style.filter = '';
	 ev.target.replaceWith( dz.cloneNode(), temp.firstElementChild, dz.cloneNode() );
	 
	 dropify(rent);
 
	 if (builder_globals.dragged && !ev.shiftKey)
		builder_globals.dragged.remove();
 
	 // no longer used
	 //trim_dropzones(document.querySelector("#code").firstElementChild);
	 
	 //renderCode();
	 //render();
}

builder_globals.handlers.drop = drop_handler;

export function dragover_handler(ev)
{
	//console.log('doh', ev);
	
	if (ev.dataTransfer.getData("application/hexfield-element")
		&& drop_ok(ev))
	{
		if (builder_globals.dragged && !ev.shiftKey)
			ev.dataTransfer.dropEffect = "move";
		else
			ev.dataTransfer.dropEffect = "copy";
			
		ev.target.parentElement.style.filter = 'brightness(75%)';
		ev.target.style.background = 'mediumseagreen';
	}
	else
	{
		ev.target.parentElement.style.filter = '';
		ev.target.style.background = '';
	}
	
	ev.preventDefault();
}

builder_globals.handlers.dragover = dragover_handler;

export function onDragLeave(event)
{
	event.target.style.background = '';
	//--//event.target.parentElement.style.borderColor = '';
	
	event.target.parentElement.style.filter = '';
	//event.target.parentElement.style.removeProperty('--set-color');
}

builder_globals.handlers.dragleave = onDragLeave;

export function dropify(wut)
	{
		return; // TODO: 86

		const zones = wut.querySelectorAll(".dropzone");
		zones.forEach(
			el =>
			{
				// maybe change to setattribute
				el.addEventListener("drop", drop_handler);
				el.addEventListener("dragover", dragover_handler);
				el.addEventListener("dragleave", onDragLeave);
			});
	}

export function trim_dropzones(el)
{
	return; // TODO: 86

	var trav = el;
	while (trav)
	{
		var nel = trav.nextElementSibling;
		if (trav.className == "dropzone")
		{
			while (nel && nel.className == "dropzone")
			{
				nel.remove();
				nel = trav.nextElementSibling;
			}
		}
		else if (trav.firstElementChild)
		{
			trim_dropzones(trav.firstElementChild);
		}
		trav = nel;
	}
}



export function drop_ok(event)
{
	return event.dataTransfer.getData("application/hexfield-element")
				&&(event.shiftKey
					|| !builder_globals.dragged
					|| (builder_globals.dragged
						//&& builder_globals.dragged != event.target.parentElement // replaced with line below
						&& !check_in_tree(builder_globals.dragged, event.target.parentElement)
						&& builder_globals.dragged.previousElementSibling != event.target
						&& builder_globals.dragged.nextElementSibling != event.target));
}

export function check_in_tree(el, check)
{
	var cur = check;
	while (cur)
	{
		if (el == cur)
			return true;
		cur = cur.parentElement;
	}
	return false;
}

export function restoreAutosave()
{
	const autosave = localStorage.getItem( 'HEXFIELD-AUTOSAVE' );
	
	if (autosave)
	{
		const source = document.querySelector("#code");
		source.innerHTML = autosave;
	}
}

export function renderCode(realHTML=false)
{
	const source = document.querySelector("#code");
	const destCode = document.querySelector("#render-code");
	
	localStorage.setItem( 'HEXFIELD-AUTOSAVE', source.innerHTML );
	
	var code = '';
	
	// this data is annoying repeated here and renderElementCode (below)
	// IF YOU CHANGE THIS, CHANGE THAT
	if (source.children)
	{
		for (el of source.children)
		{
			if (el.getAttribute)
			{
				const dtype = el.getAttribute("data-type");
				if (dtype)
				{
					code += "\n";
					if (dtype == '[text]' )
					{
						const el_con = el.querySelector('textarea');
						// copy value into HTML element (for autosave)
						el_con.innerHTML = el_con.value;
						code += el_con.value;
					}
					else if (dtype == '[custom]')
					{
						const type_inp = el.firstElementChild.nextElementSibling.querySelector('input.builder-custom-type');
						type_inp.setAttribute('value', type_inp.value);
						code += renderElementCode(el, realHTML, 4, type_inp.value);
					}
					else
						code += renderElementCode(el, realHTML, 4);
				}
				
				/*
				if (dtype)
				{
					if (dtype == '[custom]')
						code += renderElementCode(el, realHTML, level + 4, el.firstElementChild.nextElementSibling.querySelector('input.builder-custom-type').value);
					else if (dtype != '[text]' )
						code += renderElementCode(el, realHTML) + "\n";
				
				*/
			}
		}
	}
	
	if (realHTML)
	{
		builder_globals.cur_file.content = code;
		save_local_filesets();
	
		console.log('gen url', builder_globals.cur_file.name);	

		// create uri for local linking
		builder_globals.cur_file.url = URL.createObjectURL(new Blob([code], {type: 'text/html'}));
	
		return code;
	}
	else
		destCode.innerHTML = code;
}

export function renderElementCode(source, realHTML=false, level=4, type_override)
{
	var code = '';
	
	if (realHTML)
		code += `<${type_override ? type_override : source.getAttribute('data-type')}${renderAttributesCode(source)}>`;
	else
		code += `&lt;${type_override ? type_override : source.getAttribute('data-type')}${renderAttributesCode(source)}&gt;`;
		
	// this data is annoying repeated here and renderCode (above)
	// IF YOU CHANGE THIS, CHANGE THAT
	if (source.children)
	{
		for (el of source.children)
		{
			if (el.getAttribute)
			{
				const dtype = el.getAttribute("data-type");
				if (dtype)
				{
					code += "\n";
					code += ' '.repeat(level);
					if (dtype == '[text]' )
					{
						const el_con = el.querySelector('textarea');
						// copy value into HTML element (for autosave)
						el_con.innerHTML = el_con.value;
						code += el_con.value;
					}
					else if (dtype == '[custom]')
					{
						const type_inp = el.firstElementChild.nextElementSibling.querySelector('input.builder-custom-type');
						type_inp.setAttribute('value', type_inp.value);
						code += renderElementCode(el, realHTML, level + 4, type_inp.value);
					}
					else if (dtype == '[custom-empty]')
					{
						const type_inp = el.firstElementChild.nextElementSibling.querySelector('input.builder-custom-type');
						type_inp.setAttribute('value', type_inp.value);
						code += renderElementCode(el, realHTML, level + 4, type_inp.value);
					}
					else
						code += renderElementCode(el, realHTML, level + 4);
				}
			}
		}
	}
	
	if (!source.hasAttribute('data-self-closing'))
	{
		code += "\n";
		code += ' '.repeat(level - 4);
		if (realHTML)
			code += `</${type_override ? type_override : source.getAttribute('data-type')}>`
		else
			code += `&lt;/${type_override ? type_override : source.getAttribute('data-type')}&gt;`
	}
	return code;
}

export function renderAttributesCode(source)
{
	var attrs = '';
	
	//console.log('atts', source);
	
	if (!source.firstElementChild) return '';
	
	const list = source.firstElementChild.querySelectorAll('.attr');
	
	for (const attr of list)
	{
		const attr_name_attr = attr.getAttribute('data-attribute-name');
		let name = attr_name_attr != '[custom]' ? attr_name_attr : attr.querySelector('.builder-attr-name').value;
		let value;
	
		if (name == 'style')
			value = renderStyleProperties(attr);
		else
			value = attr.querySelector('.builder-attr-value').value;
		
		attrs += ` ${name}="${value}"`;
	}
	
	return attrs;
}

export function renderStyleProperties(source)
{
	var style = '';
	
	const list = source.querySelector('.builder-property-container');
	
	for (const prop of list.children)
	{
		const prop_name_attr = prop.getAttribute('data-property-name');
		let name = prop_name_attr != '[custom]' ? prop_name_attr : prop.querySelector('.builder-property-name').value;
		const value = prop.querySelector('.builder-property-value').value;
		
		style += `${name}: ${value};`;
		
		if (prop != list.lastElementChild)
			style += ' ';
	}
	
	return style;
}

export function render()
{
	const source = document.querySelector("#code");
	const destOuter = document.querySelector("#render");
	const destTitle = destOuter.querySelector("#render-title");
	const destBody = destOuter.querySelector("#render-body");

	destTitle.innerHTML = '';
	destBody.innerHTML = '';
	
	const html = source.querySelector("[data-type='html']");
	if (html)
	{
		const head = source.querySelector("[data-type='head']");
		if (head)
		{
			const title = head.querySelector("[data-type='title']");
			if (title)
			{
				const inp = title.querySelector("textarea");
				if (inp)
					destTitle.innerHTML = inp.value;
			}
		}
	}
	
	renderCode(true);
	
	const iframe = document.querySelector("iframe");
	
	iframe.src = builder_globals.cur_file.url;
}

// /url\((['"])?(?!(data:))([^'")]*)\g1?\)/g

export function fix_urls(event)
{
	const iframe = document.querySelector("iframe");
	
	const urlSources =
		[
			Object.values(builder_globals.file_data.media_sets),
			Object.values(builder_globals.file_data.file_sets),
		
		];

	// why not loops?
	// loops are ok too.
	urlSources.forEach(
		urlSets =>
		{
			urlSets.forEach(
				urlSet =>
				{
					urlSet.forEach(
						item =>
						{
							// FOR EVERY FILE AND MEDIA ITEM...
							
							//console.log('file', item.name);
							
							// html attributes portion
							urlSelectors.forEach(
								urlSelector =>
								{
									//console.log('urls', urlSelector.type, urlSelector.attr);
									
									iframe.contentDocument.querySelectorAll(`${urlSelector.type}[${urlSelector.attr}]`).forEach(
										el =>
										{
											//fix_url(el, urlSelector.attr);
											
											// this is a bit overly complex but it just checks to see if the URL should be replaced
											//console.log('url item', item, el[urlSelector.attr]);
											
											const fullUrl = new URL(el[urlSelector.attr], 'http://hexfield.prog/');
											const sourceUrl = new URL(item.name, 'http://hexfield.prog/');
											
											if (fullUrl.href == sourceUrl.href)
											{
												el[urlSelector.attr] = item.url;
											}
										});
								});
							
							// css portion
							for (const styleSheet of iframe.contentDocument.styleSheets)
							{
								if (styleSheet.cssRules)
								{
									for (const rules of styleSheet.cssRules)
									{
										if (rules.style && rules.style.getPropertyValue)
										{
											//console.log('r s', rules.style);
											
											for (var i = 0; i < rules.style.length; i++)
											{
												const name = rules.style[i];
												const valueIn = rules.style.getPropertyValue(name);
				
												//console.log('check', valueIn, item.name);
				
												const re = /url\((['"])?(?!data:)([^'")]*)\1?\)/g;
												const valueOut = valueIn.replaceAll(re,
													(match, g1, g2, g3) =>
													{
														//console.log('match', match);
														const fullUrl = new URL(g2, 'http://hexfield.prog/');
														const sourceUrl = new URL(item.name, 'http://hexfield.prog/');
												
														if (fullUrl.href == sourceUrl.href)
															return `url("${item.url}")`;
														else
															return `url("${g2}")`;
													});
												
												rules.style.setProperty(name, valueOut);
												//console.log('new', valueOut);
											}
										}
									}
								}
							}
						});
				});
		});
	
	
}

const urlSelectors =
	[
		{type: 'a', attr: 'href'},
		{type: 'body', attr: 'background'},
		{type: 'form', attr: 'action'},
		{type: 'img', attr: 'src'},
		{type: 'link', attr: 'href'},
		{type: 'script', attr: 'src'},
		{type: 'embed', attr: 'src'},
	];
	
/*
So for HTML4 we've got:

    � <a href=url>
    <applet codebase=url>
    <area href=url>
    <base href=url>
    <blockquote cite=url>
    � <body background=url>
    <del cite=url>
    � <form action=url>
    <frame longdesc=url> and <frame src=url>
    <head profile=url>
    <iframe longdesc=url> and <iframe src=url>
    * <img longdesc=url> and � <img src=url> and <img usemap=url>
    <input src=url> and <input usemap=url>
    <ins cite=url>
    � <link href=url>
    <object classid=url> and <object codebase=url> and <object data=url> and <object usemap=url>
    <q cite=url>
    � <script src=url>

HTML 5 adds a few (and HTML5 seems to not use some of the ones above as well):

    <audio src=url>
    <button formaction=url>
    <command icon=url>
    � <embed src=url>
    <html manifest=url>
    <input formaction=url>
    <source src=url>
    <track src=url>
    <video poster=url> and <video src=url>

These aren't necessarily simple URLs:

    <img srcset="url1 resolution1, url2 resolution2">
    <source srcset="url1 resolution1, url2 resolution2">
    <object archive=url> or <object archive="url1 url2 url3">
    <applet archive=url> or <applet archive=url1,url2,url3>
    <meta http-equiv="refresh" content="seconds; url">

SVGs can also contain links to resources: <svg><image href="url" /></svg>

In addition, the style attribute can contain css declarations with one or several urls. For example: <div style="background: url(image.png)">
*/

export function save_code()
{
	const source = document.querySelector("#code");
	const blob = new Blob( [renderCode(true)], {type: 'text/html'});
	const url = URL.createObjectURL(blob);
	//window.location = url;
	
	//newWindow = window.open(url, 'neuesDokument');
	
	const filename = prompt('Please enter a file name');
	if (!filename) return;

	const link = document.createElement('a');
	link.href = url;
	link.download = filename + '.html';
	link.click(); // Save
}

var blocks_draggable = true;

export function toggle_draggable(event)
{
	blocks_draggable = !blocks_draggable;
	if (blocks_draggable)
		event.target.innerHTML = 'fix blocks';
	else
		event.target.innerHTML = 'make draggable';
	
	document.querySelectorAll('[draggable]').forEach(
		el =>
		{
			el.setAttribute('draggable', blocks_draggable);
		});
}