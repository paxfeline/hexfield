function dragstart_attribute_handler(ev)
{
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("application/hexfield-attribute", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "copy";
	builder_globals.dragged_attribute = null;
}

function dragstart_move_attribute_handler(ev)
{
	// add any text area values to their elements as attributes
	const tas = ev.target.querySelectorAll("textarea");
	tas.forEach(ta => ta.innerHTML = ta.value);
	
	// for custom elements, copy input too
	const inp = ev.target.querySelector("input.builder-custom-type");
	if (inp)
		inp.setAttribute('value', inp.value);
	
	console.log('start', ev.target, tas);
	//ev.target.firstElementChild.innerHTML = ev.target.firstElementChild.value;
	ev.dataTransfer.setData("application/hexfield-attribute", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "move";
	builder_globals.dragged_attribute = ev.target;
}

function drop_attribute_handler(ev) {
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

function dragover_attribute_handler(ev) {
 ev.preventDefault();
 //if (builder_globals.dragged)
	 ev.dataTransfer.dropEffect = "copy";
}


function onAttributeDragLeave(event)
{
	event.target.style.background = '';
	//--//event.target.parentElement.style.borderColor = '';
	
		event.target.parentElement.parentElement.style.filter = '';
	//event.target.parentElement.style.removeProperty('--set-color');
		event.target.style.removeProperty('--attribute-dropzone-color'); //'#1f904e';
}

function onAttributeDragEnter(event)
{
	event.preventDefault();
	// Set the dropEffect to move
	//event.dataTransfer.dropEffect = 'linkMove';
	if (drop_attribute_ok(event))
	{
		event.target.parentElement.parentElement.style.filter = 'brightness(75%)';
		//event.target.parentElement.style.setProperty('--set-color', '#1f904e');
		//--//event.target.parentElement.style.borderColor = '#1f904e';
		event.target.style.setProperty('--attribute-dropzone-color', 'mediumseagreen'); //'#1f904e';
	}
}


function drop_attribute_ok(event)
{
	return event.dataTransfer.getData("application/hexfield-attribute")
				&& (event.shiftKey
					|| !builder_globals.dragged_attribute
					|| (builder_globals.dragged_attribute
						//&& builder_globals.dragged != event.target.parentElement // replaced with line below
						&& !check_in_tree(builder_globals.dragged, event.target.parentElement)));
}