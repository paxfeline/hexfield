const builder_globals =
	{
		dragged: null,
		drag_stash: null,
	};

function dragstart_handler(ev)
{
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("text/plain", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "copy";
	builder_globals.dragged = null;
}


 // TODO: in this handler, set the value attribute explicitly so that it's copied
function dragstart_move_handler(ev)
{
	// Add the target element's id to the data transfer object
	const tas = ev.target.querySelectorAll("textarea");
	tas.forEach(ta => ta.innerHTML = ta.value);
	console.log('start', ev.target, tas);
	//ev.target.firstElementChild.innerHTML = ev.target.firstElementChild.value;
	ev.dataTransfer.setData("text/plain", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "move";
	builder_globals.dragged = ev.target;
}



function dragover_handler(ev) {
 ev.preventDefault();
 if (builder_globals.dragged && !ev.shiftKey)
	 ev.dataTransfer.dropEffect = "move";
 else
	 ev.dataTransfer.dropEffect = "copy";
}

function dragover_trash_handler(ev) {
 ev.preventDefault();
 //if (builder_globals.dragged)
	 ev.dataTransfer.dropEffect = "move";
}

function rem_attr(ev)
{
	ev.target.parentElement.remove();
	renderCode();
	render()
}

function add_attr(ev)
{
	const newAttr = document.createElement('div');
	const newName = ev.target.parentElement.querySelector('.builder-attr-name');
	const newValue = ev.target.parentElement.querySelector('.builder-attr-value');
	const attr_cont = ev.target.parentElement.querySelector('.builder-attributes-container');
	newAttr.innerHTML = `<span class="builder-attr-pair">${newName.value}="${newValue.value}"</span>`;
	attr_cont.appendChild(newAttr);
	const remAttr = document.createElement('button');
	remAttr.setAttribute("class", "btn")
	remAttr.innerHTML = "&nbsp;-&nbsp";
	remAttr.setAttribute('onclick', 'rem_attr(event)')
	newAttr.appendChild(remAttr);
	newName.value = '';
	newValue.value = '';
	
	renderCode();
	render()
}

function drop_handler(ev) {
 if (!drop_ok(ev)) return;
 ev.preventDefault();
 // Get the id of the target and add the moved element to the target's DOM
 const data = ev.dataTransfer.getData("text/plain");
 const rent = ev.target.parentElement;
 //ev.target.style.backgroundColor = '';
 const temp = document.createElement("div");


	 temp.innerHTML = data;
	 temp.firstElementChild.setAttribute("ondragstart", "dragstart_move_handler(event)");
 

	if ( !builder_globals.dragged && !temp.firstElementChild.hasAttribute("data-no-attributes") ) 
	{
		const wrapper = document.createElement('details');
		temp.firstElementChild.prepend(wrapper);
		//wrapper.setAttribute('class', 'wrapper');
	
		const summary = wrapper.appendChild(document.createElement("summary"))
		summary.innerHTML = "attributes";
	
		const listContainer = wrapper.appendChild(document.createElement('div'));
		listContainer.setAttribute('class', 'builder-attributes-container')
	
		const newName = wrapper.appendChild(document.createElement('input'));
		const newValue = wrapper.appendChild(document.createElement('input'));
		
		newName.setAttribute('class', 'builder-attr-name');
		newValue.setAttribute('class', 'builder-attr-value');
	
		const addBtn = wrapper.appendChild(document.createElement("button"));
		addBtn.setAttribute("class", "btn")
		addBtn.setAttribute('onclick', 'add_attr(event)')
		addBtn.innerHTML = "&nbsp;+&nbsp;";
	}
 
	 const dz = document.createElement('div');
	 dz.setAttribute('class', 'dropzone');
 
	 //ev.target.parentElement.style.borderColor = '';
	 ev.target.parentElement.style.removeProperty('--set-color');
	 ev.target.replaceWith( dz.cloneNode(), temp.firstElementChild, dz.cloneNode() );
	 
	 dropify(rent);
 
	 if (builder_globals.dragged && !ev.shiftKey)
		builder_globals.dragged.remove();
 
	 trim_dropzones(document.querySelector("#code").firstElementChild);
	 
	 renderCode();
	 render();
}

function drop_trash_handler(ev) {
 if (builder_globals.dragged)
 {
 
	 ev.preventDefault();
 	builder_globals.dragged.remove();
 
 	trim_dropzones(document.querySelector("#code").firstElementChild);
	
	renderCode();
	render();
 }
 
 
	const bank = document.querySelector('#bank');
	bank.style.background = '';
	bank.style.borderColor = '';
}

function dropify(wut)
	{
		const zones = wut.querySelectorAll(".dropzone");
		zones.forEach(
			el =>
			{
				el.addEventListener("drop", drop_handler);
				el.addEventListener("dragover", dragover_handler);
				el.addEventListener("dragenter", onDragEnter);
				el.addEventListener("dragleave", onDragLeave);
			});
	}

function trim_dropzones(el)
{
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

function onDragLeave(event)
{
	event.target.style.background = '';
	//event.target.parentElement.style.borderColor = '';
	event.target.parentElement.style.removeProperty('--set-color');
}

function onDragEnter(event)
{
	event.preventDefault();
	// Set the dropEffect to move
	//event.dataTransfer.dropEffect = 'linkMove';
	if (drop_ok(event))
	{
		event.target.parentElement.style.setProperty('--set-color', '#1f904e');
		//event.target.parentElement.style.borderColor = '#1f904e';
		event.target.style.background = 'mediumseagreen'; //'#1f904e';
	}
}

function onTrashDragLeave(event)
{
	console.log('trash leave');
	const bank = document.querySelector('#bank');
	bank.style.background = '';
	bank.style.borderColor = '';
}

function onTrashDragEnter(event)
{
	event.preventDefault();
	if (builder_globals.dragged)
	{
		const bank = document.querySelector('#bank');
		bank.style.borderColor = 'darkred';
		bank.style.background = 'red';
	}
}

function drop_ok(event)
{
	return (event.shiftKey
				|| !builder_globals.dragged
				|| (builder_globals.dragged
					//&& builder_globals.dragged != event.target.parentElement
					&& !check_in_tree(builder_globals.dragged, event.target.parentElement)
					&& builder_globals.dragged.previousElementSibling != event.target
					&& builder_globals.dragged.nextElementSibling != event.target));
}

function check_in_tree(el, check)
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

function renderCode(retReal=false)
{
	const source = document.querySelector("#code");
	const destCode = document.querySelector("#render-code");
	
	var code = '';
	
	if (source.children)
	{
		for (el of source.children)
		{
			if (el.getAttribute)
			{
				const dtype = el.getAttribute("data-type");
				if (dtype)
				{
					if (dtype != '[text]' )
						code += renderElementCode(el, retReal) + "\n";
				}
			}
		}
	}
	
	if (retReal)
		return code;
	else
		destCode.innerHTML = code;
}

function renderElementCode(source, realHTML=false, level=4, type_override)
{
	var code = '';
	
	if (realHTML)
		code += `<${type_override ?? source.getAttribute('data-type')}${renderAttributesCode(source)}>`;
	else
		code += `&lt;${type_override ?? source.getAttribute('data-type')}${renderAttributesCode(source)}&gt;`;
		
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
						code += el.querySelector('textarea').value;
					else if (dtype == '[custom]')
						code += renderElementCode(el, realHTML, level + 4, el.firstElementChild.nextElementSibling.querySelector('input').value);
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
			code += `</${type_override ?? source.getAttribute('data-type')}>`
		else
			code += `&lt;/${type_override ?? source.getAttribute('data-type')}&gt;`
	}
	return code;
}

function renderAttributesCode(source)
{
	var attrs = '';
	
	console.log('atts', source);
	
	if (!source.firstElementChild) return '';
	
	const list = source.firstElementChild.querySelectorAll('.builder-attr-pair');
	
	if ( list.length == 0 )
		return '';
	else
		list.forEach( el => attrs += ' ' + el.textContent );
	
	return attrs;
}

function render()
{
	var code = '';
	
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
			debugger;
			const title = head.querySelector("[data-type='title']");
			if (title)
			{
				const inp = title.querySelector("textarea");
				if (inp)
					destTitle.innerHTML = inp.value;
			}
		}
	
		const body = source.querySelector("[data-type='body']");
		if (body)
		{
			destBody.contentWindow.document.open();
			destBody.contentWindow.document.write(renderElementCode(html, true));
			destBody.contentWindow.document.close();

		}
			//destBody.innerHTML = renderElementCode(body, true);
	}
}

function save_code()
{
	const source = document.querySelector("#code");
	const blob = new Blob( [renderCode(true)], {type: 'text/html'});
	const url = URL.createObjectURL(blob);
	//window.location = url;
	
	//newWindow = window.open(url, 'neuesDokument');

	const link = document.createElement('a');
	link.href = url;
	link.download = 'webpage';
	link.click(); // Save
}

// thanks https://stackoverflow.com/a/17819167
function isPathAbsolute(path) {
  return /^(?:\/|[a-z]+:\/\/)/.test(path);
}