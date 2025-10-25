export function dragstart_attribute_handler(ev)
{
	console.log('start drag attr', ev);
	// Add the target element's id to the data transfer object
	ev.dataTransfer.setData("application/hexfield-attribute", ev.target.outerHTML);
	ev.dataTransfer.dropEffect = "copy";
	builder_globals.dragged_attribute = null;
}

builder_globals.handlers.dragstart_attribute = dragstart_attribute_handler;

export function dragstart_move_attribute_handler(ev)
{

	console.log('ds-m-a-h');
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
	
	ev.stopPropagation();
}

builder_globals.handlers.dragstart_move_attribute = dragstart_move_attribute_handler;

export function drop_attribute_handler(ev) {

 if (!drop_attribute_ok(ev)) return;
 
 const data = ev.dataTransfer.getData("application/hexfield-attribute");
 const rent = ev.target.parentElement;
 //ev.target.style.backgroundColor = '';
 const temp = document.createElement("div");


	 temp.innerHTML = data;
	 temp.firstElementChild.setAttribute("ondragstart", "builder_globals.handlers.dragstart_move_attribute(event)");
 
	ev.target.parentElement.parentElement.style.filter = '';
	// TODO: check, why was it working?
	// changed from "event" to "ev":
		ev.target.style.removeProperty('--attribute-dropzone-color'); //'#1f904e';
	
	const attr_cont = ev.target.parentElement.querySelector('.builder-attribute-container');
	attr_cont.append(temp.firstElementChild);
 
	 if (builder_globals.dragged_attribute && !ev.shiftKey)
		builder_globals.dragged_attribute.remove();
	 
	 builder_globals.dragged_attribute = null;
	 
	//  renderCode();
	//  render();
 
	 ev.preventDefault();
}

builder_globals.handlers.drop_attribute = drop_attribute_handler;

export function dragover_attribute_handler(ev)
{
	if (ev.dataTransfer.types.includes("application/hexfield-attribute")
		&& drop_attribute_ok(ev))
	{
		if (builder_globals.dragged_attribute && !ev.shiftKey)
			ev.dataTransfer.dropEffect = "move";
		else
			ev.dataTransfer.dropEffect = "copy";
			
		ev.target.parentElement.parentElement.style.filter = 'brightness(75%)';
		ev.target.style.setProperty('--attribute-dropzone-color', 'mediumseagreen'); //'#1f904e';
	}
	else
	{
		ev.target.parentElement.parentElement.style.filter = '';
		ev.target.style.removeProperty('--attribute-dropzone-color');
	}
	
	ev.preventDefault();
}

builder_globals.handlers.dragover_attribute = dragover_attribute_handler;

export function onAttributeDragLeave(event)
{
	event.target.parentElement.parentElement.style.filter = '';
	event.target.style.removeProperty('--attribute-dropzone-color');
}

builder_globals.handlers.dragleave_attribute = onAttributeDragLeave;

export function drop_attribute_ok(event)
{
	//console.log('dao?', event.dataTransfer);
	
	return event.dataTransfer.types.includes("application/hexfield-attribute")
				&& (event.shiftKey
					|| !builder_globals.dragged_attribute
					|| (builder_globals.dragged_attribute
						&& event.target.parentElement != builder_globals.dragged_attribute.parentElement.parentElement));
}